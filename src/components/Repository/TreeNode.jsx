import React, { useState } from 'react';
import './TreeNode.css';

function TreeNode({ node, level, selectedFiles, onFileSelect }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isFile = node.type === 'blob';
  const isSelected = selectedFiles.includes(node.path);
  
  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleSelect = () => {
    if (isFile) {
      onFileSelect(node.path);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const sortedChildren = Object.values(node.children).sort((a, b) => {
    if (a.type === 'tree' && b.type === 'blob') return -1;
    if (a.type === 'blob' && b.type === 'tree') return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="tree-node">
      <div 
        className={`node-content${isSelected ? ' selected' : ''}`}
        style={{ paddingLeft: `${level * 20}px` }}
        onClick={handleSelect}
      >
        {!isFile && (
          <span className={`expand-icon${isExpanded ? ' expanded' : ''}`}>
            ▶
          </span>
        )}
        <span className={`node-icon${isFile ? ' file' : ' folder'}`}>
          {isFile ? '📄' : isExpanded ? '📂' : '📁'}
        </span>
        <span className="node-name">{node.name}</span>
      </div>
      
      {!isFile && isExpanded && (
        <div className="node-children">
          {sortedChildren.map(childNode => (
            <TreeNode
              key={childNode.path}
              node={childNode}
              level={level + 1}
              selectedFiles={selectedFiles}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TreeNode;
