import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

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
        return `Content of ${filePath}:\n${contentData.content}\n`; // Include filename in context
    } catch (error) {
        console.error(`Error fetching content for ${filePath}:`, error);
        return `Error fetching content for ${filePath}`;
    }
}

// Chat endpoint using Zephyr
app.post('/api/chat', async (req, res) => {
    const { message, repoData, filePaths, codeDefinitions } = req.body; // Expect filePaths and codeDefinitions in request body
    const token = req.query.token;

    try {
        // Prepare context about the repository
        let context = [
            'Repository Information:',
            `Name: ${repoData.repository.name}`,
            `Description: ${repoData.repository.description || 'No description provided'}`,
            `Language: ${repoData.repository.language || 'Not specified'}`,
            `Open Issues: ${repoData.issues.length}`
        ].join('\n');

        // Fetch and include file contents in context if filePaths are provided
        if (filePaths && filePaths.length > 0) {
            context += '\n\nFile Contents:\n';
            const fileContents = await Promise.all(
                filePaths.map(filePath => fetchFileContent(filePath, token, repoData))
            );
            context += fileContents.join('\n'); // Join contents with new lines
        }
        
        if (codeDefinitions && codeDefinitions.length > 0) {
            context += '\n\nCode Definitions:\n';
            context += codeDefinitions.join('\n');
        }

        const requestBody = JSON.stringify({
            inputs: `Repository context:\n${context}\n\nUser Question: ${message}`,
            parameters: {
                max_new_tokens: 250,
                temperature: 0.7,
                top_p: 0.95,
                do_sample: true
            }
        });

        console.log("Hugging Face API Request Body:", requestBody);

        const response = await fetch(
            "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-v0.1",
            {
                headers: {
                    "Authorization": `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
                    "Content-Type": "application/json" 
                },
                method: "POST",
                body: requestBody
            }
        );

        console.log("Hugging Face API Response Status:", response.status);
        console.log("Hugging Face API Raw Response:", await response.clone().text());

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json({ error: 'Hugging Face API error', details: errorData });
        }

        const responseData = await response.json();
        const generatedText = responseData[0]?.generated_text;

        res.json({ response: generatedText });

    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({
            error: 'Unable to process chat message',
            details: error.message ? error.message : 'Unknown error from Hugging Face API'
        });
    }
});
