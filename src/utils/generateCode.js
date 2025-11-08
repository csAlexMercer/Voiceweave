// Generating unique Weave ID
export const generateWeaveID = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 7);
    return `weave_${timestamp}_${randomStr}`;
};

// Generating 8-character alphanumeric join code
export const generateJoinCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

export const formatJoinCode = (code) => {
    if (code.length !== 8) return code;
    return `${code.substring(0, 4)}-${code.substring(4)}`;
};