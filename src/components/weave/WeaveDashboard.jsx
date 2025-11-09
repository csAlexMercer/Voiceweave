import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getWeaveDetails } from '../../services/weaveService';
import { formatJoinCode } from '../../utils/generateCode';
import './WeaveComponents.css';

const WeaveDashboard = () => {
    const [weave, setWeave] = useState(null);
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showJoinCode, setShowJoinCode] = useState(false);
    const [filter, setFilter] = useState('all');
    const { weaveId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        loadWeaveDetails();
    }, [weaveId]);

    const loadWeaveDetails = async () => {
        try {
            const weaveData = await getWeaveDetails(weaveId);
            setWeave(weaveData);
            const { getWeavePolls } = await import('../../services/pollService');
            const weavePolls = await getWeavePolls(weaveId);
            setPolls(weavePolls);
        } catch (error) {
            toast.error('Failed to load weave details');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const copyJoinCode = () => {
        navigator.clipboard.writeText(weave.joinCode);
        toast.success('Join code copied!');
    };

    const getFilteredPolls = () => {
        if (filter === 'all') return polls;
        return polls.filter(poll => poll.status === filter);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateProgress = (poll) => {
        const totalVotes = Object.values(poll.votes).reduce((a, b) => a + b, 0);
        return Math.min((totalVotes / poll.voteGoal) * 100, 100);
    };

    if (loading) {
        return (
        <div className="weave-dashboard-container">
            <div className="loading-spinner">Loading weave...</div>
        </div>
        );
    }

    if (!weave) {
        return (
        <div className="weave-dashboard-container">
            <div className="error-message">Weave not found</div>
            <button onClick={() => navigate('/my-weaves')} className="back-btn">
            ← Back to My Weaves
            </button>
        </div>
        );
    }

    return (
        <div className="weave-dashboard-container">
        <div className="weave-dashboard-header">
            <button onClick={() => navigate('/my-weaves')} className="back-icon">
            ←
            </button>
            <div className="weave-info">
            <h1>{weave.title}</h1>
            <p>{weave.description}</p>
            </div>
            <button onClick={() => setShowJoinCode(!showJoinCode)} className="info-icon">
            ℹ️
            </button>
        </div>

        {showJoinCode && (
            <div className="join-code-banner">
            <div className="join-code-content">
                <span className="label">Join Code:</span>
                <span className="code">{formatJoinCode(weave.joinCode)}</span>
                <button onClick={copyJoinCode} className="copy-icon-btn">📋</button>
            </div>
            </div>
        )}

        <div className="weave-stats-bar">
            <div className="stat-item">
            <span className="stat-icon">👥</span>
            <span className="stat-text">{weave.members?.length || 0} Members</span>
            </div>
            <div className="stat-item">
            <span className="stat-icon">📊</span>
            <span className="stat-text">{weave.pollCount || 0} Polls</span>
            </div>
        </div>

        <div className="dashboard-actions">
            <button 
            onClick={() => navigate(`/weave/${weaveId}/create-poll`)} 
            className="create-poll-btn"
            >
            + Create Poll
            </button>

            <div className="filter-buttons">
                <button 
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                >
                    All ({polls.length})
                </button>
                <button 
                    className={filter === 'active' ? 'active' : ''}
                    onClick={() => setFilter('active')}
                >
                    Active ({polls.filter(p => p.status === 'active').length})
                </button>
                <button 
                    className={filter === 'resolved' ? 'active' : ''}
                    onClick={() => setFilter('resolved')}
                >
                    Resolved ({polls.filter(p => p.status === 'resolved').length})
                </button>
            </div>
        </div>

        <div className="polls-section">
            <h2>Polls</h2>
            <div className="polls-list">
                {getFilteredPolls().length === 0 ? (
                    <div className="empty-polls">
                        <p>
                            {filter === 'all' ? 'No polls yet. Be the first to create one!' : `No ${filter} polls found.`}
                        </p>
                    </div>
                ) : (
                    <div className="polls-grid">
                        {getFilteredPolls().map((poll) => {
                            const totalVotes = Object.values(poll.votes).reduce((a, b) => a + b, 0);
                            const progress = calculateProgress(poll);

                            return (
                                <div key={poll.id} className="poll-card-mini" onClick={() => navigate(`/poll/${poll.id}`)}>
                                    <div className="poll-card-header">
                                        <h3>{poll.pollQuestion}</h3>
                                        <span className={`status-dot ${poll.status}`}></span>
                                    </div>

                                    <div className="poll-card-meta">
                                        <span>🗳️ {totalVotes} votes</span>
                                        <span>💬 {poll.commentCount || 0}</span>
                                        <span>{poll.isAnonymous ? '🔒' : '👤'}</span>
                                    </div>

                                    <div className="poll-card-progress">
                                        <div className="mini-progress-bar">
                                            <div className="mini-progress-fill" style={{ width: `${progress}%` }}></div>
                                        </div>
                                        <span className="progress-label">
                                            {totalVotes}/{poll.voteGoal} ({progress.toFixed(0)}%)
                                        </span>
                                    </div>

                                    <div className="poll-card-footer">
                                        <span>{formatDate(poll.createdAt)}</span>
                                        <span className="view-link">View →</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
        </div>
    );
};

export default WeaveDashboard;