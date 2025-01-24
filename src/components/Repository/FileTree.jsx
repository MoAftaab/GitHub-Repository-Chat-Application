import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import TreeNode from './TreeNode';

/**
 * @component
 * @description Displays a hierarchical file tree structure for a repository
 */
const FileTree = ({ repoFullName, containerRef, onFileSelect }) => {
    const [files, setFiles] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFiles();
    }, [repoFullName]);

    const fetchFiles = async () => {
        try {
            const response = await fetch(`/api/repos/${repoFullName}/files`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch repository files');
            }

            // Build tree structure
            const tree = {};
            data
                .filter(file => file.type === 'blob')
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

            setFiles(tree);
            setError(null);
        } catch (err) {
            console.error('Error fetching files:', err);
            setError('Failed to load files');
            setFiles(null);
        }
    };

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!files) {
        return <div className="loading">Loading files...</div>;
    }

    const renderTree = (obj, path = '') => {
        return Object.entries(obj).map(([name, subtree]) => {
            const fullPath = path ? `${path}/${name}` : name;
            return (
                <TreeNode
                    key={fullPath}
                    name={name}
                    path={fullPath}
                    isFile={subtree === null}
                    onSelect={onFileSelect}
                >
                    {subtree !== null && renderTree(subtree, fullPath)}
                </TreeNode>
            );
        });
    };

    return <div className="file-tree">{renderTree(files)}</div>;
};

FileTree.propTypes = {
    repoFullName: PropTypes.string.isRequired,
    containerRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
    onFileSelect: PropTypes.func.isRequired
};

export default FileTree;
