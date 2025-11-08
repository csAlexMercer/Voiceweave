import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../services/authService';
import './Navbar.css';

const Navbar = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
        await logout();
        toast.success('Logged out successfully');
        navigate('/');
        } catch (error) {
        toast.error('Logout failed');
        }
    };

    return (
        <nav className="navbar">
        <div className="navbar-container">
            <div className="navbar-logo" onClick={() => navigate('/home')}>
            <span className="logo-icon">🗳️</span>
            <span className="logo-text">VoiceWeave</span>
            </div>

            <div className="navbar-menu">
            <button onClick={() => navigate('/home')} className="nav-link">
                Home
            </button>
            <button onClick={() => navigate('/my-weaves')} className="nav-link">
                My Weaves
            </button>
            <div className="user-menu">
                <span className="user-name">
                {currentUser?.displayName || currentUser?.email || 'User'}
                </span>
                <button onClick={handleLogout} className="logout-btn">
                Logout
                </button>
            </div>
            </div>
        </div>
        </nav>
    );
};

export default Navbar;