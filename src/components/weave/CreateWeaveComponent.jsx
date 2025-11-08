import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {QRCodeCanvas} from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import { createWeave } from '../../services/weaveService';
import { formatJoinCode } from '../../utils/generateCode';
import './WeaveComponents.css';

const CreateWeaveComponent = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [createdWeave, setCreatedWeave] = useState(null);
    
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleCreateWeave = async (e) => {
        e.preventDefault();
        
        if (!title.trim() || !description.trim()) {
        toast.error('Please fill in all fields');
        return;
        }

        setLoading(true);

        try {
        const result = await createWeave(
            title,
            description,
            currentUser.uid,
            currentUser.email
        );

        setCreatedWeave(result);
        toast.success('Weave created successfully!');
        } catch (error) {
        toast.error(error.message);
        } finally {
        setLoading(false);
        }
    };

    const copyJoinCode = () => {
        navigator.clipboard.writeText(createdWeave.joinCode);
        toast.success('Join code copied to clipboard!');
    };

    const goToWeave = () => {
        navigate(`/weave/${createdWeave.weaveID}`);
    };

    if (createdWeave) {
        return (
        <div className="weave-success-container">
            <div className="weave-success-card">
            <div className="success-icon">✓</div>
            <h2>Weave Created Successfully!</h2>
            <p className="weave-title">{createdWeave.weaveData.title}</p>

            <div className="join-details">
                <div className="qr-section">
                <h3>Share QR Code</h3>
                <QRCodeCanvas
                    value={`${window.location.origin}/join/${createdWeave.joinCode}`}
                    size={200}
                    level="H"
                    includeMargin={true}
                />
                </div>

                <div className="code-section">
                <h3>Join Code</h3>
                <div className="join-code-display">
                    {formatJoinCode(createdWeave.joinCode)}
                </div>
                <button onClick={copyJoinCode} className="copy-btn">
                    Copy Code
                </button>
                </div>
            </div>

            <div className="success-actions">
                <button onClick={goToWeave} className="primary-btn">
                Go to Weave
                </button>
                <button onClick={() => navigate('/my-weaves')} className="secondary-btn">
                My Weaves
                </button>
            </div>
            </div>
        </div>
        );
    }

    return (
        <div className="create-weave-container">
        <div className="create-weave-card">
            <h2>Create New Weave</h2>
            <p className="subtitle">Start a micro-democracy for your community</p>

            <form onSubmit={handleCreateWeave} className="weave-form">
            <div className="form-group">
                <label htmlFor="title">Weave Title *</label>
                <input
                id="title"
                type="text"
                placeholder="e.g., Greenfield Apartments"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
                />
                <span className="char-count">{title.length}/100</span>
            </div>

            <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                id="description"
                placeholder="Describe your community and its purpose..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={4}
                required
                />
                <span className="char-count">{description.length}/500</span>
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Creating...' : 'Create Weave'}
            </button>
            </form>

            <button onClick={() => navigate('/home')} className="back-btn">
            ← Back to Home
            </button>
        </div>
        </div>
    );
};

export default CreateWeaveComponent;