import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserWeaves } from '../../services/weaveService';
import { getTrendingPolls } from '../../services/pollService';
import './HomeComponent.css';

const HomeComponent = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [trendingPolls, setTrendingPolls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTrendingPolls();
    }, [currentUser]);

    const loadTrendingPolls = async () => {
        try {
            const weaves = await getUserWeaves(currentUser.uid);
            const weaveIDs = weaves.map(w => w.id);
            if (weaveIDs.length > 0) {
                const polls = await getTrendingPolls(weaveIDs);
                setTrendingPolls(polls);
            }
        } catch (error) {
            console.error('Error loading trending polls:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const calculateProgress = (poll) => {
        const totalVotes = Object.values(poll.votes).reduce((a, b) => a + b, 0);
        return Math.min((totalVotes / poll.voteGoal) * 100, 100);
    };

    return (
        <div className="home-container">
            <div className="home-header">
                <h1>Welcome to VoiceWeave</h1>
                <p className="welcome-message">
                Hello, {currentUser?.displayName || currentUser?.email || 'User'}! 
                </p>
            </div>

            <div className="quick-actions">
                <div className="action-card" onClick={() => navigate('/my-weaves')}>
                    <span className="action-icon">🌐</span>
                    <h3>My Weaves</h3>
                    <p>View and manage your communities</p>
                </div>

                <div className="action-card" onClick={() => navigate('/create-weave')}>
                    <span className="action-icon">➕</span>
                    <h3>Create Weave</h3>
                    <p>Start a new micro-democracy</p>
                </div>

                <div className="action-card" onClick={() => navigate('/join-weave')}>
                    <span className="action-icon">🔗</span>
                    <h3>Join Weave</h3>
                    <p>Connect with existing communities</p>
                </div>
            </div>

            <div className="trending-section">
                <h2>Trending Polls</h2>
                {loading ? (
                    <div className="trending-placeholder">
                        <p>Loading polls...</p>
                    </div>
                ) : trendingPolls.length === 0 ? (
                    <div className="trending-placeholder">
                        <p>No active polls yet</p>
                        <p className="note">Join or create a weave to see polls here</p>
                    </div>
                ) : (
                    <div className="trending-polls-grid">
                        {trendingPolls.map((poll) => {
                            const totalVotes = Object.values(poll.votes).reduce((a, b) => a + b, 0);
                            const progress = calculateProgress(poll);

                            return (
                                <div 
                                    key={poll.id} 
                                    className="trending-poll-card"
                                    onClick={() => navigate(`/poll/${poll.id}`)}
                                >
                                    <div className="trending-poll-header">
                                        <h3>{poll.pollQuestion}</h3>
                                        <span className="trending-badge">🔥</span>
                                    </div>

                                    <div className="trending-poll-stats">
                                        <span>🗳️ {totalVotes} votes</span>
                                        <span>💬 {poll.commentCount || 0}</span>
                                        <span>{formatDate(poll.createdAt)}</span>
                                    </div>

                                    <div className="trending-poll-progress">
                                        <div className="trending-progress-bar">
                                            <div 
                                                className="trending-progress-fill" 
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                        <span className="trending-progress-text">
                                            {progress.toFixed(0)}% to goal
                                        </span>
                                    </div>

                                    <div className="trending-poll-footer">
                                        <span className="poll-type-badge">
                                            {poll.pollType === 'petition' ? '✋ Petition' : '☑️ Multiple Choice'}
                                        </span>
                                        <span className="view-poll-link">Vote now →</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            
            </div>
        </div>
    );
};

export default HomeComponent;