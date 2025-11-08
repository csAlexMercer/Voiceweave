import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './HomeComponent.css';

const HomeComponent = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

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
            <div className="trending-placeholder">
            <p>Polls from your weaves will appear here</p>
            <p className="note">Feature coming in Phase 2</p>
            </div>
        </div>
        </div>
    );
};

export default HomeComponent;