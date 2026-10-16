import { readFileSync } from "node:fs";
export function chatTemplate() {
  return {
    AWSTemplateFormatVersion: "2010-09-09",
    Description:
      "ABC Shop read-only assistant with a server-side LiteLLM credential",
    Parameters: {
      ChatSecretArn: {
        Type: "String",
        Description: "Existing Secrets Manager ARN; never the API key itself",
      },
      ChatModel: { Type: "String", Default: "azure-gpt-4o-mini" },
    },
    Resources: {
      Usage: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          BillingMode: "PAY_PER_REQUEST",
          AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
          KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
          TimeToLiveSpecification: {
            AttributeName: "expiresAt",
            Enabled: true,
          },
        },
      },
      Logs: {
        Type: "AWS::Logs::LogGroup",
        Properties: {
          LogGroupName: {
            "Fn::Sub": "/aws/lambda/${AWS::StackName}-assistant",
          },
          RetentionInDays: 7,
        },
      },
      Role: {
        Type: "AWS::IAM::Role",
        Properties: {
          AssumeRolePolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Principal: { Service: "lambda.amazonaws.com" },
                Action: "sts:AssumeRole",
              },
            ],
          },
          Policies: [
            {
              PolicyName: "ShopChat",
              PolicyDocument: {
                Version: "2012-10-17",
                Statement: [
                  {
                    Effect: "Allow",
                    Action: ["secretsmanager:GetSecretValue"],
                    Resource: { Ref: "ChatSecretArn" },
                  },
                  {
                    Effect: "Allow",
                    Action: ["dynamodb:UpdateItem"],
                    Resource: { "Fn::GetAtt": ["Usage", "Arn"] },
                  },
                  {
                    Effect: "Allow",
                    Action: ["logs:CreateLogStream", "logs:PutLogEvents"],
                    Resource: {
                      "Fn::Sub":
                        "arn:${AWS::Partition}:logs:${AWS::Region}:${AWS::AccountId}:log-group:/aws/lambda/${AWS::StackName}-assistant:*",
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      Assistant: {
        Type: "AWS::Lambda::Function",
        DependsOn: "Logs",
        Properties: {
          FunctionName: { "Fn::Sub": "${AWS::StackName}-assistant" },
          Runtime: "nodejs24.x",
          Handler: "index.handler",
          Role: { "Fn::GetAtt": ["Role", "Arn"] },
          Timeout: 28,
          MemorySize: 256,
          ReservedConcurrentExecutions: 2,
          Code: {
            ZipFile: readFileSync(
              new URL("../server/chat.cjs", import.meta.url),
              "utf8",
            ),
          },
          Environment: {
            Variables: {
              CHAT_SECRET_ARN: { Ref: "ChatSecretArn" },
              CHAT_USAGE_TABLE: { Ref: "Usage" },
              CHAT_MODEL: { Ref: "ChatModel" },
              CHAT_DAILY_LIMIT: "300",
              LITELLM_BASE_URL: "https://lite-llm.mymaas.net/v1",
            },
          },
        },
      },
      Api: {
        Type: "AWS::ApiGatewayV2::Api",
        Properties: {
          Name: { "Fn::Sub": "${AWS::StackName}" },
          ProtocolType: "HTTP",
          CorsConfiguration: {
            AllowOrigins: [
              "https://d2ghkgr2gk9p6l.cloudfront.net",
              "https://solacese.github.io",
              "http://localhost:5173",
              "http://localhost:4173",
              "http://127.0.0.1:5173",
              "http://127.0.0.1:4173",
            ],
            AllowMethods: ["POST", "OPTIONS"],
            AllowHeaders: ["content-type"],
            MaxAge: 600,
          },
        },
      },
      Integration: {
        Type: "AWS::ApiGatewayV2::Integration",
        Properties: {
          ApiId: { Ref: "Api" },
          IntegrationType: "AWS_PROXY",
          IntegrationUri: { "Fn::GetAtt": ["Assistant", "Arn"] },
          PayloadFormatVersion: "2.0",
          TimeoutInMillis: 29000,
        },
      },
      Route: {
        Type: "AWS::ApiGatewayV2::Route",
        Properties: {
          ApiId: { Ref: "Api" },
          RouteKey: "POST /chat",
          Target: {
            "Fn::Join": ["/", ["integrations", { Ref: "Integration" }]],
          },
        },
      },
      Stage: {
        Type: "AWS::ApiGatewayV2::Stage",
        Properties: {
          ApiId: { Ref: "Api" },
          StageName: "$default",
          AutoDeploy: true,
          DefaultRouteSettings: {
            ThrottlingBurstLimit: 4,
            ThrottlingRateLimit: 2,
          },
        },
      },
      Invoke: {
        Type: "AWS::Lambda::Permission",
        Properties: {
          FunctionName: { Ref: "Assistant" },
          Action: "lambda:InvokeFunction",
          Principal: "apigateway.amazonaws.com",
          SourceArn: {
            "Fn::Sub":
              "arn:${AWS::Partition}:execute-api:${AWS::Region}:${AWS::AccountId}:${Api}/*/POST/chat",
          },
        },
      },
    },
    Outputs: {
      ChatURL: { Value: { "Fn::Sub": "${Api.ApiEndpoint}/chat" } },
      FunctionName: { Value: { Ref: "Assistant" } },
    },
  };
}
