import Groq from "groq-sdk";
import dotenv from "dotenv";
import { searchWeb } from "./tools/search.js";
import { readPage } from "./tools/reader.js";

dotenv.config();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const tools = [
  {
    type: "function",
    function: {
      name: "web_search",
      description: "Search the web using DuckDuckGo.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The search query" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "read_page",
      description: "Fetch and read the content of a web page.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "The URL to read" },
        },
        required: ["url"],
      },
    },
  },
];

async function callModel(messages, useTools = true) {
  const options = {
    model: "llama-3.3-70b-versatile",
    max_tokens: 4096,
    messages,
  };

  if (useTools) {
    options.tools = tools;
    options.tool_choice = "auto";
    options.parallel_tool_calls = false;
  }

  try {
    return await client.chat.completions.create(options);
  } catch (err) {
    if (err?.error?.error?.code === "tool_use_failed" && useTools) {
      console.log("⚠️  Tool call failed, retrying without tools...");
      return await callModel(messages, false);
    }
    throw err;
  }
}

async function runAgent(question) {
  console.log(`\n🔍 Researching: "${question}"\n`);
  console.log("─".repeat(50));

  const messages = [
    { role: "user", content: question },
  ];

  let iteration = 0;
  const MAX_ITERATIONS = 10;

  while (iteration < MAX_ITERATIONS) {
    iteration++;

    const response = await callModel(messages);
    const message = response.choices[0].message;
    messages.push(message);

    if (!message.tool_calls || message.tool_calls.length === 0) {
      console.log("\n✅ Final Answer:\n");
      console.log(message.content);
      return;
    }

    for (const toolCall of message.tool_calls) {
      const { id, function: fn } = toolCall;
      const args = JSON.parse(fn.arguments);

      let result = "";

      if (fn.name === "web_search") {
        console.log(`🔎 Searching: "${args.query}"`);
        result = await searchWeb(args.query);
      }

      if (fn.name === "read_page") {
        console.log(`📄 Reading: ${args.url}`);
        result = await readPage(args.url);
      }

      messages.push({
        role: "tool",
        tool_call_id: id,
        content: result,
      });
    }
  }

  console.log("⚠️ Max iterations reached.");
}

const question = process.argv.slice(2).join(" ");

if (!question) {
  console.error('❌ Please provide a question.\n   Usage: node agent.js "Your question here"');
  process.exit(1);
}

if (!process.env.GROQ_API_KEY) {
  console.error("❌ Missing GROQ_API_KEY in .env file.");
  process.exit(1);
}

runAgent(question);