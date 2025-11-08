import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {signUpWithEmail,signInWithEmail,signInAnonymousUser,setupRecaptcha,sendOTP,verifyOTP} from '../../services/authService';
import './AuthComponent.css';

const AuthComponent = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [authMethod, setAuthMethod] = useState('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    useEffect(() => {
        if (authMethod === 'phone') {
        setupRecaptcha('recaptcha-container');
        }
    }, [authMethod]);

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
        if (isSignUp) {
            await signUpWithEmail(email, password, displayName);
            toast.success('Account created successfully!');
        } else {
            await signInWithEmail(email, password);
            toast.success('Signed in successfully!');
        }
        navigate('/home');
        } catch (error) {
        toast.error(error.message);
        } finally {
        setLoading(false);
        }
    };

    const handlePhoneAuth = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
        if (!confirmationResult) {
            
            const result = await sendOTP(phoneNumber);
            setConfirmationResult(result);
            toast.success('OTP sent to your phone!');
        } else {
            
            await verifyOTP(confirmationResult, otp, displayName);
            toast.success('Phone verified successfully!');
            navigate('/home');
        }
        } catch (error) {
        toast.error(error.message);
        } finally {
        setLoading(false);
        }
    };

    const handleAnonymousAuth = async () => {
        setLoading(true);
        try {
        await signInAnonymousUser();
        toast.success('Signed in anonymously!');
        navigate('/home');
        } catch (error) {
        toast.error(error.message);
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="auth-container">
        <div className="auth-card">
            <h1 className="auth-title">VoiceWeave</h1>
            <p className="auth-subtitle">Micro-democracy for your community</p>

            
            <div className="auth-methods">
            <button
                className={authMethod === 'email' ? 'active' : ''}
                onClick={() => setAuthMethod('email')}
            >
                Email
            </button>
            {/* <button
                className={authMethod === 'phone' ? 'active' : ''}
                onClick={() => setAuthMethod('phone')}
            >
                Phone
            </button> */}
            <button
                className={authMethod === 'anonymous' ? 'active' : ''}
                onClick={() => setAuthMethod('anonymous')}
            >
                Anonymous
            </button>
            </div>

            
            {authMethod === 'email' && (
            <form onSubmit={handleEmailAuth} className="auth-form">
                {isSignUp && (
                <input
                    type="text"
                    placeholder="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                />
                )}
                <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                />
                <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                />
                <button type="submit" disabled={loading}>
                {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
                </button>
                <p className="auth-toggle">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <span onClick={() => setIsSignUp(!isSignUp)}>
                    {isSignUp ? ' Sign In' : ' Sign Up'}
                </span>
                </p>
            </form>
            )}

            
            {authMethod === 'phone' && (
            <form onSubmit={handlePhoneAuth} className="auth-form">
                {!confirmationResult && isSignUp && (
                <input
                    type="text"
                    placeholder="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                />
                )}
                {!confirmationResult ? (
                <>
                    <input
                    type="tel"
                    placeholder="Phone Number (+1234567890)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    />
                    <button type="submit" disabled={loading}>
                    {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                </>
                ) : (
                <>
                    <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    />
                    <button type="submit" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                </>
                )}
                <div id="recaptcha-container"></div>
            </form>
            )}

            
            {authMethod === 'anonymous' && (
            <div className="auth-form">
                <p className="anonymous-note">
                Continue without an account. Your data will be temporary.
                </p>
                <button onClick={handleAnonymousAuth} disabled={loading}>
                {loading ? 'Processing...' : 'Continue Anonymously'}
                </button>
            </div>
            )}
        </div>
        </div>
    );
};

export default AuthComponent;