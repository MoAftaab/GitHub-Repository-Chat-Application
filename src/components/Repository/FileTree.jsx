import React from 'react';
import TreeNode from './TreeNode';
import './FileTree.css';

function buildFileTree(files) {
  const root = {};
  
  files.forEach(file => {
    const parts = file.path.split('/');
    let current = root;
    
    parts.forEach((part, i) => {
      if (!current[part]) {
        current[part] = {
          name: part,
          path: parts.slice(0, i + 1).join('/'),
          children: {},
          type: i === parts.length - 1 ? 'blob' : 'tree'
        };
      }
      current = current[part].children;
    });
  });
  
  return root;
}

function sortNodes(nodes) {
  return Object.values(nodes).sort((a, b) => {
    // Folders come before files
    if (a.type === 'tree' && b.type === 'blob') return -1;
    if (a.type === 'blob' && b.type === 'tree') return 1;
    // Alphabetical sort within the same type
    return a.name.localeCompare(b.name);
  });
}

function FileTree({ files, selectedFiles, onFileSelect }) {
  const fileTree = React.useMemo(() => buildFileTree(files), [files]);
  const sortedNodes = React.useMemo(() => sortNodes(fileTree), [fileTree]);

  return (
    <div className="file-tree">
      <div className="file-tree-header">
        <h3>Repository Files</h3>
        {selectedFiles.length > 0 && (
          <div className="selected-count">
            {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
          </div>
        )}
      </div>
      <div className="file-tree-content">
        {sortedNodes.map(node => (
          <TreeNode
            key={node.path}
            node={node}
            level={0}
            selectedFiles={selectedFiles}
            onFileSelect={onFileSelect}
          />
        ))}
      </div>
    </div>
  );
}

export default FileTree;
