# Research-AiAgent
An autonomous AI research agent built with Node.js and the Anthropic Claude API.  It searches the web, reads pages, and gives detailed answers automatically :)
## *Features
- Autonomously searches the web for any topic
- Reads and summarizes web pages
- Chains multiple searches until it has a complete answer
- Powered by Groq (Llama 3.3 70B)

## *Built With
- Node.js
- GROQ API
- DuckDuckGo Search API

## *How to Run

1. Clone the repo
2. Install dependencies- npm install
3. Add your API key in .env file- GROQ_API_KEY=your-key-here
4. Run the agent- node agent.js "Your question here"

## *Examples
- node agent.js "What is the latest news in AI?"
- node agent.js "How does quantum computing work?"
- node agent.js "Best ways to make money with AI in 2025?"

## *Requirements
- Node.js v18+
- Groq API key from console.groq.com
