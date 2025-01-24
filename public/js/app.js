class GitHubChatApp {
    constructor() {
        this.accessToken = null;
        this.selectedRepo = null;
        this.repoData = null;
        this.selectedFiles = [];
        
        this.loginBtn = document.getElementById('loginBtn');
        this.loginContainer = document.getElementById('loginContainer');
        this.chatContainer = document.getElementById('chatContainer');
        this.repoList = document.getElementById('repoList');
        this.messages = document.getElementById('messages');
        this.chatInput = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('sendBtn');

        this.initialize();
    }

    initialize() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
            this.accessToken = token;
            window.history.replaceState({}, document.title, window.location.pathname);
            this.onLogin();
        }

        this.loginBtn.addEventListener('click', () => this.handleLogin());
        this.sendBtn.addEventListener('click', () => this.handleSendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSendMessage();
        });
    }

    handleLogin() {
        window.location.href = '/api/auth/github';
    }

    async onLogin() {
        this.loginContainer.style.display = 'none';
        this.chatContainer.style.display = 'grid';
        await this.fetchRepositories();
    }

    async fetchRepositories() {
        try {
            const response = await fetch(`/api/repos?token=${this.accessToken}`);
            const repos = await response.json();
            
            if (!response.ok) {
                throw new Error(repos.error || 'Failed to fetch repositories');
            }

            this.repoList.innerHTML = repos
                .map(repo => `
                    <div class="repo-container">
                        <div class="repo-header">
                            <span class="repo-icon">📁</span>
                            <span class="repo-name">${repo.name}</span>
                            <button class="tree-toggle" data-repo="${repo.full_name}">▶</button>
                        </div>
                        <div class="tree-content" id="tree-${repo.name}" style="display: none;">
                            <div class="loading">Loading files...</div>
                        </div>
                    </div>
                `).join('');

            this.repoList.querySelectorAll('.tree-toggle').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const repoFullName = button.dataset.repo;
                    const repoContainer = button.closest('.repo-container');
                    const treeContent = repoContainer.querySelector('.tree-content');
                    
                    if (button.textContent === '▶') {
                        button.textContent = '▼';
                        treeContent.style.display = 'block';
                        if (treeContent.querySelector('.loading')) {
                            this.fetchRepoFiles(repoFullName, treeContent);
                        }
                    } else {
                        button.textContent = '▶';
                        treeContent.style.display = 'none';
                    }
                });
            });

            this.repoList.querySelectorAll('.repo-header').forEach(header => {
                header.addEventListener('click', () => {
                    const repoFullName = header.querySelector('.tree-toggle').dataset.repo;
                    this.selectRepository(header, repoFullName);
                });
            });
        } catch (error) {
            console.error('Error fetching repositories:', error);
            this.addMessage('Assistant', 'Failed to load repositories. Please try logging in again.');
        }
    }

    createTreeNode(path, isFile = true) {
        const parts = path.split('/');
        const name = parts[parts.length - 1];
        const indent = (parts.length - 1) * 20;
        
        return `
            <div class="tree-item" style="margin-left: ${indent}px">
                <label class="tree-item-content">
                    ${isFile ? `
                        <input type="checkbox" data-path="${path}">
                        <span class="file-icon">📄</span>
                    ` : '<span class="folder-icon">📁</span>'}
                    <span class="item-name">${name}</span>
                </label>
            </div>
        `;
    }

    async fetchRepoFiles(repoFullName, container) {
        try {
            const response = await fetch(`/api/repos/${repoFullName}/files?token=${this.accessToken}`);
            const files = await response.json();

            if (!response.ok) {
                throw new Error(files.error || 'Failed to fetch repository files');
            }

            // Build tree structure
            const tree = {};
            files
                .filter(file => file.type === 'blob') // Only include files
                .forEach(file => {
                    const parts = file.path.split('/');
                    let current = tree;
                    parts.forEach((part, i) => {
                        if (i === parts.length - 1) {
                            current[part] = null; // File
                        } else {
                            current[part] = current[part] || {}; // Folder
                            current = current[part];
                        }
                    });
                });

            // Render tree
            let html = '';
            const renderTree = (obj, path = '') => {
                Object.entries(obj || {}).forEach(([name, subtree]) => {
                    const fullPath = path ? `${path}/${name}` : name;
                    if (subtree === null) {
                        html += this.createTreeNode(fullPath, true);
                    } else {
                        html += this.createTreeNode(fullPath, false);
                        renderTree(subtree, fullPath);
                    }
                });
            };

            renderTree(tree);
            container.innerHTML = html || '<div class="empty">No files found</div>';

            // Add event listeners for checkboxes
            container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    if (checkbox.checked) {
                        this.selectedFiles.push(checkbox.dataset.path);
                    } else {
                        this.selectedFiles = this.selectedFiles.filter(f => f !== checkbox.dataset.path);
                    }
                });
            });
        } catch (error) {
            console.error('Error fetching files:', error);
            container.innerHTML = '<div class="error">Failed to load files</div>';
        }
    }

    selectRepository(element, repoFullName) {
        if (this.selectedRepo === repoFullName) return;

        document.querySelectorAll('.repo-header').forEach(item => {
            item.classList.remove('selected');
        });
        element.classList.add('selected');

        this.selectedRepo = repoFullName;
        this.selectedFiles = [];
        this.fetchRepoData();

        const [owner, repo] = repoFullName.split('/');
        this.addMessage('Assistant', `Now chatting with ${owner}/${repo}. Select files to ask specific questions about them, or ask general questions about the repository.`);
    }

    async fetchRepoData() {
        try {
            const [owner, repo] = this.selectedRepo.split('/');
            const response = await fetch(`/api/repos/${owner}/${repo}?token=${this.accessToken}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch repository data');
            }

            this.repoData = {
                ...data,
                token: this.accessToken
            };
        } catch (error) {
            console.error('Error fetching repo data:', error);
            this.addMessage('Assistant', 'Failed to load repository data. Please try again.');
        }
    }

    async fetchCodeDefinitions(filePath) {
        try {
            const response = await fetch(`/api/definitions?token=${this.accessToken}&repo=${this.selectedRepo}&file_path=${filePath}`);
            if (!response.ok) {
                const errorData = await response.json(); // Try to parse error response
                throw new Error(errorData.error || `Failed to fetch code definitions for ${filePath}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching code definitions for ${filePath}:`, error);
            this.addMessage('Assistant', `Failed to fetch code definitions for ${filePath}.`);
            return null; // Or handle error as needed, e.g., return empty array
        }
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

        try {
            const loadingId = this.addMessage('Assistant', 'Thinking...');
            
            this.sendBtn.disabled = true;
            this.chatInput.disabled = true;

            // Fetch code definitions for selected files
            let codeDefinitions = [];
            if (this.selectedFiles.length > 0) {
                const definitionPromises = this.selectedFiles.map(filePath => 
                    this.fetchCodeDefinitions(filePath)
                );
                codeDefinitions = await Promise.all(definitionPromises);
                codeDefinitions = codeDefinitions.filter(defs => defs && defs.length > 0).flat(); // Filter out empty results and flatten
            }
            
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message,
                    repoData: this.repoData,
                    filePaths: this.selectedFiles, // Send selected file paths
                    codeDefinitions: codeDefinitions // Send code definitions
                })
            });

            const data = await response.json();
            this.removeMessage(loadingId);

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get response');
            }

            this.addMessage('Assistant', data.response);
        } catch (error) {
            console.error('Chat Error:', error);
            const errorDetails = error.details ? `: ${error.details}` : '';
            this.addMessage('Assistant', `Error: ${error.message || 'Failed to process your request'}${errorDetails}`);
        } finally {
            this.sendBtn.disabled = false;
            this.chatInput.disabled = false;
            this.chatInput.focus();
        }
    }

    addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        const messageId = Date.now();
        messageDiv.id = `message-${messageId}`;
        messageDiv.className = `message ${sender.toLowerCase()}-message`;
        messageDiv.textContent = text;
        this.messages.appendChild(messageDiv);
        this.messages.scrollTop = this.messages.scrollHeight;
        return messageId;
    }

    removeMessage(messageId) {
        const messageDiv = document.getElementById(`message-${messageId}`);
        if (messageDiv) {
            messageDiv.remove();
        }
    }
}

// Initialize the app
new GitHubChatApp();
