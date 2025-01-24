class GitHubChatApp {
    constructor() {
        this.clientId = 'YOUR_GITHUB_CLIENT_ID'; // You'll need to register your GitHub OAuth app
        this.accessToken = null;
        this.selectedRepo = null;
        
        this.loginBtn = document.getElementById('loginBtn');
        this.chatContainer = document.getElementById('chatContainer');
        this.repoList = document.getElementById('repoList');
        this.messages = document.getElementById('messages');
        this.chatInput = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('sendBtn');

        this.initialize();
    }

    initialize() {
        // Check if we have a token in localStorage
        this.accessToken = localStorage.getItem('github_token');
        if (this.accessToken) {
            this.onLogin();
        }

        // Event listeners
        this.loginBtn.addEventListener('click', () => this.handleLogin());
        this.sendBtn.addEventListener('click', () => this.handleSendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSendMessage();
        });
    }

    handleLogin() {
        // GitHub OAuth redirect
        const redirectUri = window.location.origin + window.location.pathname;
        const scope = 'repo';
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${this.clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    }

    async onLogin() {
        this.loginBtn.parentElement.style.display = 'none';
        this.chatContainer.style.display = 'grid';
        await this.fetchRepositories();
    }

    async fetchRepositories() {
        try {
            const response = await fetch('https://api.github.com/user/repos', {
                headers: {
                    'Authorization': `token ${this.accessToken}`
                }
            });
            const repos = await response.json();
            
            this.repoList.innerHTML = repos
                .map(repo => `
                    <div class="repo-item" data-repo="${repo.full_name}">
                        ${repo.name}
                    </div>
                `).join('');

            // Add click handlers to repo items
            this.repoList.querySelectorAll('.repo-item').forEach(item => {
                item.addEventListener('click', () => this.selectRepository(item.dataset.repo));
            });
        } catch (error) {
            console.error('Error fetching repositories:', error);
        }
    }

    selectRepository(repoFullName) {
        this.selectedRepo = repoFullName;
        document.querySelectorAll('.repo-item').forEach(item => {
            item.style.backgroundColor = item.dataset.repo === repoFullName ? '#e1e4e8' : '';
        });
        this.addMessage('Assistant', `Now chatting with ${repoFullName}. How can I help you with this repository?`);
    }

    async handleSendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        if (!this.selectedRepo) {
            this.addMessage('Assistant', 'Please select a repository first.');
            return;
        }

        this.chatInput.value = '';
        this.addMessage('User', message);

        // Simulate API call to get repository data
        try {
            const repoData = await this.getRepositoryData();
            // In a real implementation, you would send the message and repo data
            // to your backend for processing
            this.simulateResponse(message, repoData);
        } catch (error) {
            console.error('Error:', error);
            this.addMessage('Assistant', 'Sorry, there was an error processing your request.');
        }
    }

    async getRepositoryData() {
        try {
            const [repoResponse, issuesResponse] = await Promise.all([
                fetch(`https://api.github.com/repos/${this.selectedRepo}`, {
                    headers: { 'Authorization': `token ${this.accessToken}` }
                }),
                fetch(`https://api.github.com/repos/${this.selectedRepo}/issues`, {
                    headers: { 'Authorization': `token ${this.accessToken}` }
                })
            ]);

            const [repoData, issuesData] = await Promise.all([
                repoResponse.json(),
                issuesResponse.json()
            ]);

            return {
                repository: repoData,
                issues: issuesData
            };
        } catch (error) {
            console.error('Error fetching repository data:', error);
            throw error;
        }
    }

    simulateResponse(message, repoData) {
        // In a real implementation, this would be replaced with actual AI processing
        const responses = [
            `I've analyzed the repository and found ${repoData.issues.length} open issues.`,
            'Looking at the code structure, I can help you identify potential improvements.',
            'Would you like me to help you fix any specific errors in the codebase?'
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setTimeout(() => this.addMessage('Assistant', randomResponse), 1000);
    }

    addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender.toLowerCase()}-message`;
        messageDiv.textContent = text;
        this.messages.appendChild(messageDiv);
        this.messages.scrollTop = this.messages.scrollHeight;
    }
}

// Check for OAuth callback
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

if (code) {
    // In a real implementation, you would exchange this code for an access token
    // using your backend server to keep the client secret secure
    console.log('Received OAuth code:', code);
    // For demo purposes, you can manually set a token here
    localStorage.setItem('github_token', 'YOUR_ACCESS_TOKEN');
    window.location.href = window.location.pathname;
}

// Initialize the app
new GitHubChatApp();
