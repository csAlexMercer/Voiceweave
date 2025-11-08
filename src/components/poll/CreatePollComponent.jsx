import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { createPoll } from '../../services/pollService';
import './PollComponents.css';

const CreatePollComponent = () => {
    const [pollType, setPollType] = useState('petition');
    const [pollQuestion, setPollQuestion] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [voteGoal, setVoteGoal] = useState(50);
    const [options, setOptions] = useState(['', '']);
    const [loading, setLoading] = useState(false);

    const { weaveId } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleAddOption = () => {
        if (options.length < 6) {
        setOptions([...options, '']);
        } else {
        toast.warning('Maximum 6 options allowed');
        }
    };

    const handleRemoveOption = (index) => {
        if (options.length > 2) {
        setOptions(options.filter((_, i) => i !== index));
        } else {
        toast.warning('Minimum 2 options required');
        }
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const validateForm = () => {
        if (!pollQuestion.trim()) {
        toast.error('Please enter a poll question');
        return false;
        }

        if (pollQuestion.length > 140) {
        toast.error('Question must be 140 characters or less');
        return false;
        }

        if (pollType === 'multiple_choice') {
        const validOptions = options.filter(opt => opt.trim() !== '');
        if (validOptions.length < 2) {
            toast.error('Please provide at least 2 options');
            return false;
        }

        const uniqueOptions = new Set(validOptions.map(opt => opt.trim().toLowerCase()));
        if (uniqueOptions.size !== validOptions.length) {
            toast.error('Options must be unique');
            return false;
        }
        }
        if (voteGoal < 1) {
        toast.error('Vote goal must be at least 1');
        return false;
        }
        return true;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
        return;
        }
        setLoading(true);
        try {
        const pollData = {
            pollType,
            pollQuestion: pollQuestion.trim(),
            isAnonymous,
            voteGoal: parseInt(voteGoal),
            options: pollType === 'petition' 
            ? ['yes', 'no'] 
            : options.filter(opt => opt.trim() !== '').map(opt => opt.trim())
        };

        await createPoll(weaveId, pollData, currentUser.uid);
        
        toast.success('Poll created successfully!');
        navigate(`/weave/${weaveId}`);
        } catch (error) {
        toast.error(error.message);
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="create-poll-container">
        <div className="create-poll-card">
            <h2>Create New Poll</h2>
            <p className="subtitle">Ask your community and get their voice heard</p>

            <form onSubmit={handleSubmit} className="poll-form">
            <div className="form-section">
                <label className="section-label">Poll Type</label>
                <div className="poll-type-selector">
                <div
                    className={`type-option ${pollType === 'petition' ? 'active' : ''}`}
                    onClick={() => setPollType('petition')}
                >
                    <span className="type-icon">✋</span>
                    <div className="type-info">
                    <h4>Petition</h4>
                    <p>Yes/No question</p>
                    </div>
                </div>
                <div
                    className={`type-option ${pollType === 'multiple_choice' ? 'active' : ''}`}
                    onClick={() => setPollType('multiple_choice')}
                >
                    <span className="type-icon">☑️</span>
                    <div className="type-info">
                    <h4>Multiple Choice</h4>
                    <p>2-6 custom options</p>
                    </div>
                </div>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="question">Poll Question *</label>
                <textarea
                id="question"
                placeholder="What do you want to ask your community?"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                maxLength={140}
                rows={3}
                required
                />
                <span className="char-count">{pollQuestion.length}/140</span>
            </div>

            {pollType === 'multiple_choice' && (
                <div className="form-section">
                <label className="section-label">Options</label>
                <div className="options-list">
                    {options.map((option, index) => (
                    <div key={index} className="option-input-group">
                        <input
                        type="text"
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        maxLength={50}
                        />
                        {options.length > 2 && (
                        <button
                            type="button"
                            onClick={() => handleRemoveOption(index)}
                            className="remove-option-btn"
                        >
                            ✕
                        </button>
                        )}
                    </div>
                    ))}
                </div>
                {options.length < 6 && (
                    <button
                    type="button"
                    onClick={handleAddOption}
                    className="add-option-btn"
                    >
                    + Add Option
                    </button>
                )}
                </div>
            )}

            <div className="form-group">
                <label htmlFor="voteGoal">Vote Goal *</label>
                <input
                id="voteGoal"
                type="number"
                placeholder="Number of votes needed for resolution"
                value={voteGoal}
                onChange={(e) => setVoteGoal(e.target.value)}
                min={1}
                required
                />
                <small className="field-hint">
                Poll will be marked as resolved when this goal is reached
                </small>
            </div>

            <div className="form-group">
                <div className="toggle-group">
                <div className="toggle-info">
                    <label htmlFor="anonymous">Anonymous Voting</label>
                    <small>Hide voter identities from results</small>
                </div>
                <label className="toggle-switch">
                    <input
                    id="anonymous"
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                </label>
                </div>
            </div>

            <div className="form-actions">
                <button
                type="button"
                onClick={() => navigate(`/weave/${weaveId}`)}
                className="cancel-btn"
                >
                Cancel
                </button>
                <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Creating...' : 'Create Poll'}
                </button>
            </div>
            </form>
        </div>
        </div>
    );
};

export default CreatePollComponent;