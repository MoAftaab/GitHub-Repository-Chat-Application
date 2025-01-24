import React from 'react';
import PropTypes from 'prop-types';
import RepositoryItem from './RepositoryItem';

/**
 * @component
 * @description Displays a list of GitHub repositories with expandable file trees
 */
const RepositoryList = ({ 
    repos, 
    selectedRepo, 
    onRepoSelect, 
    onRepoToggle, 
    onFileSelect 
}) => {
    return (
        <aside id="repoList">
            {repos.map(repo => (
                <RepositoryItem
                    key={repo.id}
                    repo={repo}
                    isSelected={selectedRepo === repo.full_name}
                    onSelect={() => onRepoSelect(repo.full_name)}
                    onToggle={(e) => onRepoToggle(e, repo.full_name)}
                    onFileSelect={onFileSelect}
                />
            ))}
        </aside>
    );
};

RepositoryList.propTypes = {
    repos: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        full_name: PropTypes.string.isRequired
    })).isRequired,
    selectedRepo: PropTypes.string,
    onRepoSelect: PropTypes.func.isRequired,
    onRepoToggle: PropTypes.func.isRequired,
    onFileSelect: PropTypes.func.isRequired
};

export default RepositoryList;
