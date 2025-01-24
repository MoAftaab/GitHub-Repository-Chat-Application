# App Component Documentation

## Overview
Main application component that provides GitHub repository browsing and chat functionality. It handles user authentication, repository selection, file browsing, and chat interactions.

## Component Methods

### handleLogin
Initiates the GitHub OAuth login process by redirecting to the auth endpoint.

### fetchRepositories
Fetches the authenticated user's GitHub repositories.
- **Async**: Yes
- **Throws**: Error if the API request fails

### createTreeNode
Creates a tree node element for the file browser.
- **Parameters**:
  - `path` (string): The file or directory path
  - `isFile` (boolean, optional): Whether the node represents a file or directory
- **Returns**: JSX.Element - The rendered tree node

### fetchRepoFiles
Fetches and displays the file structure for a selected repository.
- **Async**: Yes
- **Parameters**:
  - `repoFullName` (string): The full name of the repository (owner/repo)
  - `containerRef` (React.RefObject): Reference to the container element
- **Throws**: Error if the API request fails

### handleSendMessage
Handles sending chat messages and fetches AI responses.
- **Async**: Yes
- **Throws**: Error if the message processing or API request fails

### addMessage
Adds a new message to the chat history.
- **Parameters**:
  - `sender` (string): The message sender ('User' or 'Assistant')
  - `text` (string): The message content
- **Returns**: number - The unique ID of the added message

### removeMessage
Removes a message from the chat history.
- **Parameters**:
  - `messageId` (number): The ID of the message to remove

## State Management
The component uses several state variables:
- `accessToken`: Manages the GitHub access token
- `selectedRepo`: Tracks the currently selected repository
- `repoData`: Stores data for the selected repository
- `selectedFiles`: Maintains list of selected files
- `repos`: Stores list of user's repositories
- `messages`: Manages chat message history

## UI Components
The component renders:
1. Login screen (when not authenticated)
   - GitHub login button
2. Main interface (when authenticated)
   - Repository list sidebar
   - Chat section with message history
   - Message input area with send button
