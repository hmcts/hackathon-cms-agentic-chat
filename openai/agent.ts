import { AzureOpenAI } from "openai";
import { createCasePrompt, tools } from "./prompts";

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;

const missingVars = [
  !endpoint && "AZURE_OPENAI_ENDPOINT",
  !apiVersion && "AZURE_OPENAI_API_VERSION",
  !deployment && "AZURE_OPENAI_DEPLOYMENT",
  !apiKey && "AZURE_OPENAI_API_KEY"
].filter(Boolean);

if (missingVars.length > 0) {
  throw new Error(`Missing required Azure OpenAI environment variable(s): ${missingVars.join(", ")}`);
}

const openai = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });

export async function chatWithAgent(messages: any[]) {
  // Only use spinner if in TTY (local dev), otherwise skip
  let spinner: NodeJS.Timeout | null = null;
  let dots = 0;
  const isTTY = process.stdout && (process.stdout as any).isTTY;
  if (isTTY) {
    const readline = await import('readline');
    spinner = setInterval(() => {
      dots = (dots + 1) % 4;
      readline.cursorTo(process.stdout, 0);
      process.stdout.write("Waiting for AI" + ".".repeat(dots) + "   ");
    }, 500);
  }
  try {
    const response = await openai.chat.completions.create({
      model: deployment as string,
      messages: [
        { role: "system", content: createCasePrompt },
        ...messages
      ],
      tools,
      tool_choice: "auto"
    });
    return response;
  } finally {
    if (spinner) {
      clearInterval(spinner);
      const readline = await import('readline');
      readline.cursorTo(process.stdout, 0);
      process.stdout.clearLine(0);
    }
  }
}
