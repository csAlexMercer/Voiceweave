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
        </div>

        <div className="polls-section">
            <h2>Polls</h2>
            <div className="polls-list">
            <div className="empty-polls">
                <p>No polls yet. Be the first to create one!</p>
            </div>
            </div>
        </div>
        </div>
    );
};

export default WeaveDashboard;