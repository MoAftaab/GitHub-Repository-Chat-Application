# GitHub Repository Chat Application 🚀

A modern React application that allows users to chat with an AI about their GitHub repositories. This application helps developers understand and navigate codebases more efficiently by providing an intelligent chat interface connected to their repositories.

## ✨ Features

- **GitHub Authentication**: Securely authenticate with your GitHub account using OAuth.
- **Repository Browsing**: Easily browse your GitHub repositories within the application.
- **File Tree Exploration**: Navigate through an expandable file tree to explore repository contents.
- **Context-Aware Chat**: Chat with an AI model that understands your selected repository and files.
- **Code Understanding**: Get explanations, summaries, and insights about your code directly in the chat.
- **Multi-File Selection**: Select specific files to provide context to the AI for more targeted questions.
- **Responsive Design**: User-friendly interface optimized for both desktop and mobile devices.

## 🛠️ Tech Stack

### Frontend

- **React.js**: A JavaScript library for building user interfaces.
- **JSX**: A syntax extension to JavaScript for writing HTML-like structures in React.
- **React Hooks**: For managing state and side effects in functional components.
- **PropTypes**: For type checking React component props.
- **CSS**: For styling the application.

### Backend

- **Node.js**: An open-source, cross-platform JavaScript runtime environment.
- **Express.js**: A minimal and flexible Node.js web application framework.
- **Hugging Face API**:  Utilizing the `mistralai/Mistral-7B-v0.1` model for chat completions.
- **GitHub API**: To fetch repository data, file contents, and code definitions.

### Development Tools

- **Vite**: A fast build tool and development server for modern web projects.
- **npm**: Package manager for JavaScript.

## ⚙️ API and Model Usage

This application leverages the following APIs and models:

- **GitHub API**:
    - Used for user authentication via OAuth.
    - Fetches user repositories and file structures.
    - Retrieves file content and code information.

- **[Mistral 7B]**:
    - Powers the chat functionality.
    - Provides intelligent responses based on user queries and repository context.
    - Enables code understanding and generation.
    - *(Please replace this with the actual model or API you are using, e.g., 'OpenAI GPT-3 API' or 'Hugging Face Transformers library with [Model Name]')*

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- GitHub Account
- [GitHub OAuth App](docs/github-oauth-setup.md) set up for local development.
- [API Key/Token for AI Model] (if applicable, e.g., OpenAI API Key or Hugging Face Token). See [docs/huggingface-setup.md](docs/huggingface-setup.md) for Hugging Face setup.

### Installation

1. **Clone the repository:**
   ```bash
   git clone [repository-url]
   cd github-repo-chat
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Create a `.env` file in the root directory.
   - Add your GitHub Client ID and Secret, and AI API Key (if needed):
     ```env
     GITHUB_CLIENT_ID=YOUR_GITHUB_CLIENT_ID
     GITHUB_CLIENT_SECRET=YOUR_GITHUB_CLIENT_SECRET
     [AI_API_KEY_ENV_VAR]=YOUR_AI_API_KEY  # e.g., OPENAI_API_KEY=sk-... or HUGGINGFACE_API_TOKEN=hf_...
     ```
     Refer to the documentation for setting up [GitHub OAuth](docs/github-oauth-setup.md) and [Hugging Face API](docs/huggingface-setup.md).

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:5173` in your browser.

## 💻 Usage

1. **Login**: Click the "Login with GitHub" button to authenticate with your GitHub account.
2. **Select Repository**: Choose a repository from the list in the sidebar to start chatting about it.
3. **Explore Files**: Expand the repository item to view the file tree and select specific files for context.
4. **Chat with AI**: Type your questions or prompts in the chat input area and send messages to the AI.
5. **Receive Intelligent Responses**: The AI will provide responses based on your queries and the context of the selected repository and files.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix (`git checkout -b feature/your-feature-name`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature-name`).
5. Open a pull request to the main branch.

## 📜 License

[MIT License](LICENSE)

## 🙏 Acknowledgements

- Thanks to [GitHub](https://github.com/) for providing the API and OAuth services.
- Thanks to [OpenAI/Hugging Face/etc.] for the AI model/API. *(Acknowledge the specific AI provider)*
- React.js and the open-source community for the fantastic tools and libraries.

---
