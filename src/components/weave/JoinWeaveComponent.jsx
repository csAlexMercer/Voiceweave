import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { joinWeaveByCode } from '../../services/weaveService';
import './WeaveComponents.css';

const JoinWeaveComponent = () => {
    const [joinCode, setJoinCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [scannerActive, setScannerActive] = useState(false);
    
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { code } = useParams();

    useEffect(() => {
        if (code) {
        handleJoinWeave(code);
        }
    }, [code]);

    const handleJoinWeave = async (codeToJoin = null) => {
        const finalCode = codeToJoin || joinCode;
        
        if (!finalCode.trim()) {
        toast.error('Please enter a join code');
        return;
        }

        setLoading(true);

        try {
        const result = await joinWeaveByCode(
            finalCode,
            currentUser.uid,
            currentUser.email
        );

        toast.success(`Joined ${result.weaveData.title} successfully!`);
        navigate(`/weave/${result.weaveID}`);
        } catch (error) {
        toast.error(error.message);
        } finally {
        setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleJoinWeave();
    };

    const formatCodeInput = (value) => {
        const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

        if (cleaned.length > 4) {
        return `${cleaned.substring(0, 4)}-${cleaned.substring(4, 8)}`;
        }
        return cleaned;
    };

    const handleCodeChange = (e) => {
        const formatted = formatCodeInput(e.target.value);
        setJoinCode(formatted);
    };

    const startQRScanner = async () => {
        try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setScannerActive(true);
        toast.info('QR Scanner activated! Point camera at QR code');
        
        setTimeout(() => {
            stream.getTracks().forEach(track => track.stop());
            setScannerActive(false);
            toast.info('Use manual code entry for now');
        }, 3000);
        } catch (error) {
        toast.error('Camera access denied. Please use manual code entry.');
        }
    };

    return (
        <div className="join-weave-container">
        <div className="join-weave-card">
            <h2>Join a Weave</h2>
            <p className="subtitle">Enter a join code or scan a QR code</p>

            <form onSubmit={handleSubmit} className="join-form">
            <div className="form-group">
                <label htmlFor="joinCode">Join Code</label>
                <input
                id="joinCode"
                type="text"
                placeholder="XXXX-XXXX"
                value={joinCode}
                onChange={handleCodeChange}
                maxLength={9}
                required
                className="join-code-input"
                />
            </div>

            <button type="submit" disabled={loading || scannerActive} className="submit-btn">
                {loading ? 'Joining...' : 'Join Weave'}
            </button>
            </form>

            <div className="divider">
            <span>OR</span>
            </div>

            <button
            onClick={startQRScanner}
            disabled={scannerActive}
            className="qr-scan-btn"
            >
            {scannerActive ? 'Scanning...' : '📷 Scan QR Code'}
            </button>

            {scannerActive && (
            <div className="scanner-placeholder">
                <p>Camera viewfinder would appear here</p>
                <p className="note">Note: Full QR scanning requires additional library integration</p>
            </div>
            )}

            <button onClick={() => navigate('/home')} className="back-btn">
            ← Back to Home
            </button>
        </div>
        </div>
    );
};

export default JoinWeaveComponent;