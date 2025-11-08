import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserWeaves } from '../../services/weaveService';
import './WeaveComponents.css';

const MyWeaves = () => {
    const [weaves, setWeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadWeaves();
    }, [currentUser]);

    const loadWeaves = async () => {
        try {
        const userWeaves = await getUserWeaves(currentUser.uid);
        setWeaves(userWeaves);
        } catch (error) {
        console.error('Error loading weaves:', error);
        } finally {
        setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
        });
    };

    if (loading) {
        return (
        <div className="my-weaves-container">
            <div className="loading-spinner">Loading your weaves...</div>
        </div>
        );
    }

    return (
        <div className="my-weaves-container">
        <div className="my-weaves-header">
            <h1>My Weaves</h1>
            <div className="header-actions">
            <button onClick={() => navigate('/create-weave')} className="create-btn">
                + Create Weave
            </button>
            <button onClick={() => navigate('/join-weave')} className="join-btn">
                Join Weave
            </button>
            </div>
        </div>

        {weaves.length === 0 ? (
            <div className="empty-state">
            <div className="empty-icon">🌐</div>
            <h2>No Weaves Yet</h2>
            <p>Create a new weave or join an existing one to get started</p>
            <div className="empty-actions">
                <button onClick={() => navigate('/create-weave')} className="primary-btn">
                Create Your First Weave
                </button>
                <button onClick={() => navigate('/join-weave')} className="secondary-btn">
                Join a Weave
                </button>
            </div>
            </div>
        ) : (
            <div className="weaves-grid">
            {weaves.map((weave) => (
                <div
                key={weave.id}
                className="weave-card"
                onClick={() => navigate(`/weave/${weave.id}`)}
                >
                <div className="weave-card-header">
                    <h3>{weave.title}</h3>
                    {weave.admins?.includes(currentUser.uid) && (
                    <span className="admin-badge">Admin</span>
                    )}
                </div>
                
                <p className="weave-description">{weave.description}</p>
                
                <div className="weave-stats">
                    <div className="stat">
                    <span className="stat-icon">👥</span>
                    <span className="stat-value">{weave.members?.length || 0}</span>
                    <span className="stat-label">Members</span>
                    </div>
                    <div className="stat">
                    <span className="stat-icon">📊</span>
                    <span className="stat-value">{weave.pollCount || 0}</span>
                    <span className="stat-label">Polls</span>
                    </div>
                </div>
                
                <div className="weave-footer">
                    <span className="join-date">Joined {formatDate(weave.createdAt)}</span>
                    <span className="view-arrow">→</span>
                </div>
                </div>
            ))}
            </div>
        )}
        </div>
    );
};

export default MyWeaves;