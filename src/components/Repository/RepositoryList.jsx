import React from 'react';
import RepositoryItem from './RepositoryItem';
import './RepositoryList.css';

function RepositoryList({ token, selectedRepo, onSelectRepo, loading, setLoading }) {
  const [repos, setRepos] = React.useState([]);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchRepos = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/repos?token=' + token);
        if (!response.ok) throw new Error('Failed to fetch repositories');
        const data = await response.json();
        setRepos(data);
      } catch (err) {
        console.error('Error fetching repos:', err);
        setError('Failed to load repositories. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchRepos();
    }
  }, [token, setLoading]);

  const handleRepoSelect = async (repo) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/repos/${repo.owner.login}/${repo.name}?token=${token}`);
      if (!response.ok) throw new Error('Failed to fetch repository details');
      const data = await response.json();
      onSelectRepo(data);
    } catch (err) {
      console.error('Error fetching repo details:', err);
      setError('Failed to load repository details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <div className="repository-error">{error}</div>;
  }

  return (
    <div className="repository-section">
      <h2>Your Repositories</h2>
      <div className="repository-list">
        {loading ? (
          <div className="loading">Loading repositories...</div>
        ) : repos.length === 0 ? (
          <div className="no-repos">No repositories found</div>
        ) : (
          repos.map(repo => (
            <RepositoryItem
              key={repo.id}
              repo={repo}
              selected={selectedRepo?.repository.id === repo.id}
              onClick={() => handleRepoSelect(repo)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default RepositoryList;
