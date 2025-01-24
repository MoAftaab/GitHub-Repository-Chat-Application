import React from 'react';
import './RepositoryItem.css';

function RepositoryItem({ repo, selected, onClick }) {
  return (
    <div 
      className={`repository-item${selected ? ' selected' : ''}`}
      onClick={onClick}
    >
      <div className="repository-name">
        <span className="name">{repo.name}</span>
        {repo.private && <span className="private-badge">Private</span>}
      </div>
      
      <div className="repository-details">
        {repo.description && (
          <p className="description">{repo.description}</p>
        )}
        
        <div className="meta-info">
          {repo.language && (
            <span className="language">
              <span 
                className="language-dot"
                style={{
                  backgroundColor: {
                    'JavaScript': '#f1e05a',
                    'TypeScript': '#2b7489',
                    'Python': '#3572A5',
                    'Java': '#b07219',
                    'Ruby': '#701516',
                  }[repo.language] || '#gray'
                }}
              />
              {repo.language}
            </span>
          )}
          
          {repo.stargazers_count > 0 && (
            <span className="stars">
              ⭐ {repo.stargazers_count}
            </span>
          )}

          {repo.open_issues_count > 0 && (
            <span className="issues">
              🔴 {repo.open_issues_count} issues
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default RepositoryItem;
