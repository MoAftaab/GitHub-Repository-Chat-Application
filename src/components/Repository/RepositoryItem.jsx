import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import FileTree from './FileTree';

/**
 * @component
 * @description Displays a single repository item with an expandable file tree
 */
const RepositoryItem = ({ 
    repo, 
    isSelected, 
    onSelect, 
    onToggle, 
    onFileSelect 
}) => {
    const treeContentRef = useRef(null);

    return (
        <div className="repo-container">
            <div 
                className={`repo-header ${isSelected ? 'selected' : ''}`} 
                onClick={onSelect}
            >
                <span className="repo-icon">📁</span>
                <span className="repo-name">{repo.name}</span>
                <button 
                    className="tree-toggle" 
                    data-repo={repo.full_name}
                    onClick={(e) => onToggle(e, treeContentRef)}
                >
                    ▶
                </button>
            </div>
            <div 
                className="tree-content loading" 
                id={`tree-${repo.name}`} 
                style={{ display: 'none' }}
                ref={treeContentRef}
            >
                <FileTree 
                    repoFullName={repo.full_name}
                    containerRef={treeContentRef}
                    onFileSelect={onFileSelect}
                />
            </div>
        </div>
    );
};

RepositoryItem.propTypes = {
    repo: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        full_name: PropTypes.string.isRequired
    }).isRequired,
    isSelected: PropTypes.bool.isRequired,
    onSelect: PropTypes.func.isRequired,
    onToggle: PropTypes.func.isRequired,
    onFileSelect: PropTypes.func.isRequired
};

export default RepositoryItem;
