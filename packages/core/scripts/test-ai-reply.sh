#!/bin/bash

# Load environment variables from .env file if it exists
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Required environment variables
export OPENAI_API_KEY=${OPENAI_API_KEY:?"OPENAI_API_KEY is required"}
export NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL:?"SUPABASE_URL is required"}
export SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY:?"SUPABASE_SERVICE_ROLE_KEY is required"}

# Optional environment variables with defaults
export AI_MODEL_NAME=${AI_MODEL_NAME:-"gpt-4-turbo-preview"}
export AI_TEMPERATURE=${AI_TEMPERATURE:-0.7}

# LangChain environment variables
export LANGCHAIN_TRACING_V2=${LANGCHAIN_TRACING_V2:-"true"}
export LANGCHAIN_ENDPOINT=${LANGCHAIN_ENDPOINT:-"https://api.smith.langchain.com"}
export LANGCHAIN_API_KEY=${LANGCHAIN_API_KEY:?"LANGCHAIN_API_KEY is required for tracing"}
export LANGCHAIN_PROJECT=${LANGCHAIN_PROJECT:-"autocrm-ticket-replies"}

# Run the test
echo "Running AI reply test..."
echo "Model: $AI_MODEL_NAME"
echo "Temperature: $AI_TEMPERATURE"
echo "LangChain Project: $LANGCHAIN_PROJECT"
echo "-------------------"

ts-node src/ai/test/testAIReply.ts 