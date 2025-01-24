import React from 'react';
import PropTypes from 'prop-types';

/**
 * @component
 * @description Represents a file or folder node in the repository file tree
 */
const TreeNode = ({ name, path, isFile, onSelect, children }) => {
    const indent = path.split('/').length - 1;

    return (
        <div className="tree-item" style={{ marginLeft: `${indent * 20}px` }}>
            <label className="tree-item-content">
                {isFile ? (
                    <>
                        <input 
                            type="checkbox" 
                            data-path={path} 
                            onChange={(e) => onSelect(e.target.dataset.path, e.target.checked)} 
                        />
                        <span className="file-icon">📄</span>
                    </>
                ) : (
                    <span className="folder-icon">📁</span>
                )}
                <span className="item-name">{name}</span>
            </label>
            {!isFile && children && (
                <div className="tree-children">
                    {children}
                </div>
            )}
        </div>
    );
};

TreeNode.propTypes = {
    name: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    isFile: PropTypes.bool.isRequired,
    onSelect: PropTypes.func.isRequired,
    children: PropTypes.node
};

export default TreeNode;
