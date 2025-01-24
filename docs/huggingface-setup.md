# Setting up Hugging Face API Access

## Getting a Free Token

1. Go to [Hugging Face](https://huggingface.co/)
2. Create a free account or sign in
3. Go to your profile settings
4. Click on "Access Tokens" in the sidebar
5. Click "New token"
6. Give your token a name (e.g., "GitHubChatAssistant")
7. Select "read" access
8. Click "Generate token"
9. Copy the generated token

## Update Environment Variables

1. Open your `.env` file
2. Replace `get_token_from_huggingface` with your actual token:
```
HUGGING_FACE_TOKEN=your_copied_token
```

## Features of the Free API

- Access to CodeBERT model for code understanding
- No credit card required
- Rate limited but sufficient for personal use
- Access to thousands of open-source models

## Usage Limits

- Rate limit: ~30 requests per minute
- No cost associated
- Models run on shared infrastructure
- Response time may vary based on load

## Error Handling

If you see errors like:
- "Model is loading" - The model is warming up, try again in a few seconds
- "Too many requests" - You've hit the rate limit, wait a minute
- "Connection error" - The service might be temporarily busy

These are normal for the free tier and usually resolve themselves after a short wait.
