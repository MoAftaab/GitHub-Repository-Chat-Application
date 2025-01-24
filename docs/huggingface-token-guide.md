# How to Get Your Hugging Face API Token

## Step-by-Step Guide with Screenshots

1. Go to https://huggingface.co/

2. Click "Sign Up" in the top right corner if you don't have an account
   - Fill in your details
   - Verify your email

3. Once logged in:
   - Click your profile picture in the top right
   - Select "Settings" from the dropdown menu

4. In the Settings page:
   - Look for "Access Tokens" in the left sidebar
   - Click on it

5. On the Access Tokens page:
   - Click the "New token" button
   - Name: "GitHub Chat Assistant" (or any name you prefer)
   - Role: Select "read" (that's all we need)
   - Click "Generate token"

6. Copy your token immediately
   - It looks like "hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   - Store it safely as you won't be able to see it again

7. Update your .env file:
```
GITHUB_CLIENT_ID=Ov23lilqrJIC7eBRJrX4
GITHUB_CLIENT_SECRET=82e82903a13c138a5e123b186a35cbc95566345a
HUGGING_FACE_TOKEN=your_copied_token_here
PORT=3000
```

## Troubleshooting

If you see errors like:
- "Model is loading" - Wait a few seconds and try again
- "Too many requests" - Wait about a minute between requests
- "Invalid token" - Make sure you copied the entire token correctly

## Token Security

- Never share your token
- Don't commit it to Git
- If compromised, you can revoke it in the Access Tokens page
- Generate a new one if needed

## Using the Token

The application will automatically use your token to:
- Access the CodeBERT model
- Process your repository questions
- Generate helpful responses

No additional setup is needed after adding the token to your .env file.
