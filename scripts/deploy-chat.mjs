import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chatTemplate } from "../infra/aws-chat.mjs";
export function deployChat({
  region = "ca-central-1",
  stack = "sam-retail-demo-chat",
} = {}) {
  function aws(args, capture = false) {
    const result = spawnSync("aws", [...args, "--region", region], {
      encoding: "utf8",
      stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    });
    if (result.status !== 0)
      throw new Error(
        `AWS chat deployment failed: ${capture ? result.stderr : "see output"}`,
      );
    return capture ? result.stdout.trim() : "";
  }
  const secretArn = aws(
    [
      "secretsmanager",
      "describe-secret",
      "--secret-id",
      "sam-retail/demo/litellm",
      "--query",
      "ARN",
      "--output",
      "text",
    ],
    true,
  );
  const folder = mkdtempSync(join(tmpdir(), "abc-shop-chat-"));
  try {
    const template = join(folder, "template.json");
    writeFileSync(template, JSON.stringify(chatTemplate()));
    aws([
      "cloudformation",
      "deploy",
      "--stack-name",
      stack,
      "--template-file",
      template,
      "--parameter-overrides",
      `ChatSecretArn=${secretArn}`,
      `ChatModel=${process.env.SHOP_CHAT_MODEL || "azure-gpt-4o-mini"}`,
      "--capabilities",
      "CAPABILITY_IAM",
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
    return outputs.find((o) => o.OutputKey === "ChatURL").OutputValue;
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
}
if (process.argv[1] === fileURLToPath(import.meta.url))
  console.log(JSON.stringify({ chatUrl: deployChat() }));
