import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const region =
  process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "ca-central-1";
const stack = process.env.RETAIL_AWS_STACK || "sam-retail-demo";
function run(command, args, capture = false) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });
  if (result.status !== 0)
    throw new Error(
      `${command} failed (${result.status}): ${capture ? result.stderr : "see command output"}`,
    );
  return capture ? result.stdout.trim() : "";
}
if (run("git", ["status", "--porcelain"], true))
  throw new Error(
    "Commit the reviewed source before deployment so release.json identifies the exact version.",
  );
const commit = run("git", ["rev-parse", "HEAD"], true);
if (!process.argv.includes("--skip-build")) run("npm", ["run", "build:aws"]);
const aws = (args, capture = false) =>
  run("aws", [...args, "--region", region], capture);
aws([
  "cloudformation",
  "deploy",
  "--stack-name",
  stack,
  "--template-file",
  "infra/aws-static.yaml",
  "--no-fail-on-empty-changeset",
  "--tags",
  "Application=ABCShop",
  "Project=sam-retail",
]);
const outputs = JSON.parse(
  aws(
    [
      "cloudformation",
      "describe-stacks",
      "--stack-name",
      stack,
      "--query",
      "Stacks[0].Outputs",
      "--output",
      "json",
    ],
    true,
  ),
);
const output = (key) => outputs.find((o) => o.OutputKey === key)?.OutputValue;
const bucket = output("BucketName"),
  distribution = output("DistributionId"),
  url = output("SiteURL");
if (!bucket || !distribution || !url)
  throw new Error("The stack did not return all site outputs.");
writeFileSync(
  path.join(root, "dist-aws", "release.json"),
  JSON.stringify({ commit, builtAt: new Date().toISOString() }) + "\n",
);
// Preserve previous hashed assets so open browser tabs can finish lazy imports.
aws([
  "s3",
  "sync",
  "dist-aws/",
  `s3://${bucket}/`,
  "--exclude",
  "index.html",
  "--exclude",
  "release.json",
  "--cache-control",
  "public,max-age=31536000,immutable",
  "--only-show-errors",
]);
aws([
  "s3",
  "cp",
  "dist-aws/index.html",
  `s3://${bucket}/index.html`,
  "--content-type",
  "text/html; charset=utf-8",
  "--cache-control",
  "no-store,max-age=0,must-revalidate",
  "--only-show-errors",
]);
aws([
  "s3",
  "cp",
  "dist-aws/release.json",
  `s3://${bucket}/release.json`,
  "--content-type",
  "application/json",
  "--cache-control",
  "no-store,max-age=0,must-revalidate",
  "--only-show-errors",
]);
const invalidation = JSON.parse(
  aws(
    [
      "cloudfront",
      "create-invalidation",
      "--distribution-id",
      distribution,
      "--paths",
      "/",
      "/index.html",
      "/release.json",
      "--output",
      "json",
    ],
    true,
  ),
);
console.log(
  JSON.stringify(
    {
      url,
      commit,
      stack,
      region,
      distribution,
      invalidationId: invalidation.Invalidation.Id,
    },
    null,
    2,
  ),
);
