import OpenAI from 'openai';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPEN_API_KEY,
  baseURL: process.env.BASE_URL,
  model: process.env.model,
});

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

let conversationHistory = [];

app.use(cors());
app.use(express.json());

if (isProduction) {
    app.use(express.static(join(__dirname, '../dist'))); // Serve static files from 'dist' in production
    app.get('*', (req, res) => {
        res.sendFile(join(__dirname, '../dist', 'index.html')); // Serve index.html for all routes
    });
} else {
    app.use(express.static('public')); // Serve static files from 'public' in development
    app.get('/', (req, res) => {
        res.sendFile(join(__dirname, 'public', 'index.html'));
    });
}

// GitHub OAuth endpoints
app.get('/api/auth/github', (req, res) => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo`;
    res.redirect(githubAuthUrl);
});

app.get('/api/auth/github/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code
            })
        });
        const data = await response.json();
        res.redirect(`/?token=${data.access_token}`);
    } catch (error) {
        console.error('OAuth Error:', error);
        res.status(500).json({ error: 'Failed to authenticate with GitHub' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// GitHub API endpoints
app.get('/api/repos', async (req, res) => {
    const { token } = req.query;
    try {
        const response = await fetch('https://api.github.com/user/repos', {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        const repos = await response.json();
        res.json(repos);
    } catch (error) {
        console.error('Repos Error:', error);
        res.status(500).json({ error: 'Failed to fetch repositories' });
    }
});

app.get('/api/repos/:owner/:repo', async (req, res) => {
    const { token } = req.query;
    const { owner, repo } = req.params;
    try {
        const [repoResponse, issuesResponse] = await Promise.all([
            fetch(`https://api.github.com/repos/${owner}/${repo}`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }),
            fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            })
        ]);

        const [repoData, issuesData] = await Promise.all([
            repoResponse.json(),
            issuesResponse.json()
        ]);

        res.json({
            repository: repoData,
            issues: issuesData
        });
    } catch (error) {
        console.error('Repo Data Error:', error);
        res.status(500).json({ error: 'Failed to fetch repository data' });
    }
});

app.get('/api/repos/:owner/:repo/files', async (req, res) => {
    const { token } = req.query;
    const { owner, repo } = req.params;
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch repository files');
        }

        const files = data.tree || [];
        res.json(files);
    } catch (firstError) {
        try {
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch repository files');
            }

            const files = data.tree || [];
            res.json(files);
        } catch (error) {
            console.error('Files Error:', error);
            res.status(500).json({ error: 'Failed to fetch repository files' });
        }
    }
});

app.get('/api/repos/:owner/:repo/contents/:path(*)', async (req, res) => {
    const { token } = req.query;
    const { owner, repo, path } = req.params;
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch file content');
        }

        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        res.json({ content });
    } catch (error) {
        console.error('File Content Error:', error);
        res.status(500).json({ error: 'Failed to fetch file content' });
    }
});

// Helper function to fetch file content
async function fetchFileContent(filePath, token, repoData) {
    try {
        const contentResponse = await fetch(`http://localhost:3000/api/repos/${repoData.repository.owner.login}/${repoData.repository.name}/contents/${filePath}`);
        if (!contentResponse.ok) {
            console.error(`Failed to fetch content for ${filePath}: ${contentResponse.status} ${contentResponse.statusText}`);
            return `Error fetching content for ${filePath}`;
        }
        const contentData = await contentResponse.json();
        let content = Buffer.from(contentData.content, 'base64').toString('utf-8');
        if (content.length > 1000) {
            content = content.substring(0, 1000) + '... (truncated)';
        }
        return `Content of ${filePath}:\n${content}\n`; // Include filename in context
    } catch (error) {
        console.error(`Error fetching content for ${filePath}:`, error);
        return `Error fetching content for ${filePath}`;
    }
}

// Chat endpoint using Zephyr
app.post('/api/chat', async (req, res) => {
    const { message, repoData, files, codeDefinitions } = req.body; // Expect files and codeDefinitions in request body
    const token = req.query.token;

    try {
        // Add user message to conversation history
        conversationHistory.push(`User: ${message}`);

        // Prepare context about the repository
        let context = [
            'Repository Information:',
            `Name: ${repoData.repository.name}`,
            `Description: ${repoData.repository.description || 'No description provided'}`,
            `Language: ${repoData.repository.language || 'Not specified'}`,
            `Open Issues: ${repoData.issues.length}`
        ].join('\n');

        // Include file contents in context if provided
        if (files && files.length > 0) {
            context += '\n\nFile Contents:\n';
            const fileContents = files.map(file => {
                // Get file extension for language detection
                const ext = file.path.split('.').pop();
                const language = ext || 'text';
                return `Content of ${file.path}:\n\`\`\`${language}\n${file.content}\n\`\`\``;
            });
            context += fileContents.join('\n\n');
        }

        // Helper function to format code in AI response
        const formatCodeInResponse = (text) => {
            const codeFileRegex = /Content of ([^:]+):/g;
            let formattedText = text;
            
            // Find code file references and add code blocks
            const matches = text.match(codeFileRegex);
            if (matches) {
                matches.forEach(match => {
                    const filePath = match.replace('Content of ', '').replace(':', '');
                    const file = files?.find(f => f.path === filePath);
                    if (file) {
                        const ext = filePath.split('.').pop();
                        formattedText = formattedText.replace(
                            `${match}\n${file.content}`,
                            `${match}\n\`\`\`${ext}\n${file.content}\n\`\`\``
                        );
                    }
                });
            }
            return formattedText;
        };
        
        if (codeDefinitions && codeDefinitions.length > 0) {
            context += '\n\nCode Definitions:\n';
            context += codeDefinitions.join('\n');
        }

        // Include conversation history in the input
        const conversationContext = conversationHistory.join('\n');
        const inputs = `Repository context:\n${context}\n\nConversation History:\n${conversationContext}\n\nUser Question: ${message}`;

        const requestBody = JSON.stringify({
            inputs: inputs,
            parameters: {
                max_new_tokens: 250,
                temperature: 0.7,
                top_p: 0.95,
                do_sample: true
            }
        });

        console.log("OpenAI API Request Body:", requestBody);

        const openaiResponse = await openai.chat.completions.create({
            model: process.env.model,
            messages: [{ role: "user", content: inputs }],
            max_tokens: 250,
            temperature: 0.7,
            top_p: 0.95,
            frequency_penalty: 0,
            presence_penalty: 0,
        });

        let generatedText = openaiResponse.choices[0].message.content;

        // Format the first sentence (context) without bullet
        const sentences = generatedText.split(/(?<=[.!?])\s+/);
        const firstSentence = sentences.shift();
        
        // Format remaining sentences as bullet points with plain text
        const bulletPoints = sentences
            .filter(sentence => sentence.length > 5)  // Filter out very short sentences
            .map(sentence => {
                // Remove any markdown formatting like ** or __ 
                return `• ${sentence.trim().replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1')}`;
            });
            
        // Combine with proper spacing
        // Format the response with code blocks
        generatedText = formatCodeInResponse(firstSentence) + '\n\n' + bulletPoints.join('\n ');

        // Add AI response to conversation history
        conversationHistory.push(`AI: ${generatedText}`);

        res.json({ response: generatedText });

    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({
            error: 'Unable to process chat message',
            details: error.message ? error.message : 'Unknown error from Hugging Face API'
        });
    }
});
