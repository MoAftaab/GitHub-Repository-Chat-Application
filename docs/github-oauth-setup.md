# Setting up GitHub OAuth

## Step-by-Step Guide

1. Go to GitHub Settings:
   - Click your profile picture in the top right
   - Click "Settings"
   - Click "Developer settings" (at the bottom of left sidebar)
   - Click "OAuth Apps"
   - Click "New OAuth App"

2. Fill in the OAuth application details:
   ```
   Application name: GitHub Repo Chat Assistant
   Homepage URL: http://localhost:3000
   Application description: (Optional) Chat with your GitHub repositories and get help fixing errors
   Authorization callback URL: http://localhost:3000/api/auth/github/callback
   ```

   > Note: These URLs are for local development. For production:
   > - Replace `localhost:3000` with your actual domain
   > - Example: If your domain is `example.com`:
   >   - Homepage URL: `https://example.com`
   >   - Callback URL: `https://example.com/api/auth/github/callback`

3. After creating the application, you'll see:
   - Client ID (copy this to `.env` as `GITHUB_CLIENT_ID`)
   - Click "Generate a new client secret"
   - Copy the generated secret to `.env` as `GITHUB_CLIENT_SECRET`

Your final `.env` file should look like this:
```
GITHUB_CLIENT_ID=your_copied_client_id
GITHUB_CLIENT_SECRET=your_copied_client_secret
OPENAI_API_KEY=your_openai_api_key
PORT=3000
```

## How it Works

1. When a user clicks "Login with GitHub", they're redirected to GitHub's authorization page
2. After authorizing, GitHub redirects back to your callback URL with a code
3. The server exchanges this code for an access token using your client ID and secret
4. The access token is used to make authenticated requests to the GitHub API
