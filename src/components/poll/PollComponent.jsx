import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import {getPollDetails,submitVote,hasUserVoted,subscribeToPoll,addComment,getPollComments,subscribeToComments} from '../../services/pollService';
import { getWeaveDetails } from '../../services/weaveService';
import VoteVisualization from './VoteVisualization';
import './PollComponents.css';

const PollComponent = () => {
    const [poll, setPoll] = useState(null);
    const [weave, setWeave] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [selectedOption, setSelectedOption] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [showComments, setShowComments] = useState(false);

    const { pollId } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadPollData();

        const unsubscribePoll = subscribeToPoll(pollId, (updatedPoll) => {
            setPoll(updatedPoll);
        });

        const unsubscribeComments = subscribeToComments(pollId, (updatedComments) => {
            setComments(updatedComments);
        });

        return () => {
            unsubscribePoll();
            unsubscribeComments();
        };
    }, [pollId]);

    const loadPollData = async () => {
        try {
            const pollData = await getPollDetails(pollId);
            setPoll(pollData);

            const weaveData = await getWeaveDetails(pollData.weaveID);
            setWeave(weaveData);

            const voted = await hasUserVoted(pollId, currentUser.uid);
            setHasVoted(voted);

            const pollComments = await getPollComments(pollId);
            setComments(pollComments);
        } catch (error) {
            toast.error('Failed to load poll');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async () => {
        if (!selectedOption) {
            toast.warning('Please select an option');
            return;
        }

        setSubmitting(true);

        try {
            await submitVote(pollId, selectedOption, currentUser.uid, poll.isAnonymous);
            setHasVoted(true);
            toast.success('Vote submitted successfully!');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();

        if (!newComment.trim()) {
            toast.warning('Comment cannot be empty');
            return;
        }

        try {
            await addComment(pollId, newComment.trim(), currentUser.uid, true);
            setNewComment('');
            toast.success('Comment added!');
        } catch (error) {
            toast.error('Failed to add comment');
        }
    };

    const calculateProgress = () => {
        if (!poll) return 0;
        const totalVotes = Object.values(poll.votes).reduce((a, b) => a + b, 0);
        return Math.min((totalVotes / poll.voteGoal) * 100, 100);
    };

    const calculateConsensus = () => {
        if (!poll) return 0;
        const totalVotes = Object.values(poll.votes).reduce((a, b) => a + b, 0);
        if (totalVotes === 0) return 0;
        
        const maxVotes = Math.max(...Object.values(poll.votes));
        return ((maxVotes / totalVotes) * 100).toFixed(1);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="poll-container">
                <div className="loading-spinner">Loading poll...</div>
            </div>
        );
    }

    if (!poll) {
        return (
            <div className="poll-container">
                <div className="error-message">Poll not found</div>
            </div>
        );
    }

    const totalVotes = Object.values(poll.votes).reduce((a, b) => a + b, 0);
    const progress = calculateProgress();
    const consensus = calculateConsensus();

    return (
        <div className="poll-container">
            <div className="poll-header">
                <button onClick={() => navigate(`/weave/${poll.weaveID}`)} className="back-btn-small">
                    ← Back to {weave?.title}
                </button>
                <div className="poll-status-badge" data-status={poll.status}>
                    {poll.status === 'resolved' ? '✓ Resolved' : '● Active'}
                </div>
            </div>

            <div className="poll-card">
                <div className="poll-question-section">
                    <h1 className="poll-question">{poll.pollQuestion}</h1>
                    <div className="poll-meta">
                        <span className="meta-item">
                            {poll.isAnonymous ? '🔒 Anonymous' : '👤 Public'}
                        </span>
                        <span className="meta-item">📅 {formatDate(poll.createdAt)}</span>
                        <span className="meta-item">🗳️ {totalVotes} votes</span>
                        <span className="meta-item">💬 {poll.commentCount || 0} comments</span>
                    </div>
                </div>

                <div className="progress-section">
                    <div className="progress-header">
                        <span>Progress to Goal</span>
                        <span className="progress-text">
                            {totalVotes} / {poll.voteGoal} votes ({progress.toFixed(0)}%)
                        </span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="consensus-section">
                    <div className="consensus-header">
                        <span>Consensus</span>
                        <span className="consensus-value">{consensus}%</span>
                    </div>
                    <div className="consensus-bar">
                        <div className="consensus-fill" style={{ width: `${consensus}%` }}></div>
                    </div>
                    <small className="consensus-hint">
                        Percentage of votes for the leading option
                    </small>
                </div>

                {!hasVoted && poll.status === 'active' ? (
                    <div className="voting-section">
                        <h3>Cast Your Vote</h3>
                        <div className="options-grid">
                            {poll.options.map((option) => (
                                <button
                                    key={option}
                                    className={`vote-option ${selectedOption === option ? 'selected' : ''}`}
                                    onClick={() => setSelectedOption(option)}
                                >
                                    <span className="option-radio">
                                        {selectedOption === option ? '◉' : '○'}
                                    </span>
                                    <span className="option-text">{option}</span>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleVote}
                            disabled={submitting || !selectedOption}
                            className="submit-vote-btn"
                        >
                            {submitting ? 'Submitting...' : 'Submit Vote'}
                        </button>
                    </div>
                ) : (
                    <div className="voted-section">
                        <div className="voted-message">
                            {hasVoted ? (
                                <>
                                    <span className="check-icon">✓</span>
                                    <span>You have voted on this poll</span>
                                </>
                            ) : (
                                <>
                                    <span className="lock-icon">🔒</span>
                                    <span>This poll is resolved</span>
                                </>
                            )}
                        </div>
                    </div>
                )}

                <VoteVisualization poll={poll} />

                {/* Show voter names if poll is not anonymous */}
                {!poll.isAnonymous && poll.voterDetails && Object.keys(poll.voterDetails).length > 0 && (
                    <div className="voter-details-section" style={{
                        marginTop: '24px',
                        paddingTop: '24px',
                        borderTop: '1px solid #e5e7eb'
                    }}>
                        <h4 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '16px'
                        }}>Vote Details:</h4>
                        {poll.options.map((option) => {
                            const voters = poll.voterDetails[option] || [];
                            
                            return voters.length > 0 ? (
                                <div key={option} style={{ marginBottom: '16px' }}>
                                    <p style={{
                                        fontWeight: '500',
                                        color: '#4b5563',
                                        marginBottom: '8px'
                                    }}>{option}:</p>
                                    <ul style={{
                                        marginLeft: '24px',
                                        fontSize: '14px',
                                        color: '#6b7280',
                                        listStyle: 'none',
                                        padding: 0
                                    }}>
                                        {voters.map((voter, i) => (
                                            <li key={i} style={{ marginBottom: '4px' }}>
                                                • {voter.userName || voter.userEmail || 'Anonymous User'}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null;
                        })}
                    </div>
                )}
            </div>

            <div className="comments-section">
                <div className="comments-header" onClick={() => setShowComments(!showComments)}>
                    <h3>💬 Comments ({comments.length})</h3>
                    <span className="toggle-icon">{showComments ? '▼' : '▶'}</span>
                </div>

                {showComments && (
                    <>
                        <form onSubmit={handleAddComment} className="comment-form">
                            <textarea
                                placeholder="Share your thoughts (anonymous)..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                maxLength={500}
                                rows={3}
                            />
                            <div className="comment-form-footer">
                                <span className="char-count">{newComment.length}/500</span>
                                <button type="submit" className="submit-comment-btn">
                                    Post Comment
                                </button>
                            </div>
                        </form>

                        <div className="comments-list">
                            {comments.length === 0 ? (
                                <div className="no-comments">
                                    <p>No comments yet. Be the first to share your thoughts!</p>
                                </div>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="comment-card">
                                        <div className="comment-header">
                                            <span className="comment-author">
                                                {comment.isAnonymous ? '👤 Anonymous' : 'User'}
                                            </span>
                                            <span className="comment-time">
                                                {formatDate(comment.timestamp)}
                                            </span>
                                        </div>
                                        <p className="comment-content">{comment.content}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PollComponent;