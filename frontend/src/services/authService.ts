import { jwtDecode } from 'jwt-decode';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Login user via API
export const loginUser = async (email: string, password: string): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: email, password })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Invalid credentials' }));
            throw new Error(errorData.detail || 'Login failed');
        }

        const data = await response.json();
        return {
            email: data.username,
            name: data.fullname,
            role: data.role,
            organization: 'Clinical Portal'
        };
    } catch (error: any) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Cannot connect to clinical server. Please ensure the backend is running.');
        }
        throw error;
    }
};

// Login user via Google API
export const googleLoginUser = async (credential: string): Promise<any> => {
    try {
        const decoded: any = jwtDecode(credential);
        const { email, name } = decoded;

        const response = await fetch(`${API_URL}/google-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name: name || email.split('@')[0] })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Google Login failed' }));
            throw new Error(errorData.detail || 'Google Login failed');
        }

        const data = await response.json();
        return {
            email: data.username,
            name: data.fullname,
            role: data.role,
            organization: 'Clinical Portal'
        };
    } catch (error: any) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Cannot connect to clinical server. Please ensure the backend is running.');
        }
        throw error;
    }
};

// Register new user via API
export const registerUser = async (
    email: string,
    password: string,
    name: string,
    role: string,
    _organization: string,
    _department: string
): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: email,
                password,
                fullname: name,
                role
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Registration failed' }));
            throw new Error(errorData.detail || 'Registration failed');
        }

        return true;
    } catch (error: any) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Cannot connect to clinical server. Please ensure the backend is running.');
        }
        throw error;
    }
};

// Password reset logic (keeping as local for now until API is updated)
const getUsers = (): any[] => {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
};

const saveUsers = (users: any[]) => {
    localStorage.setItem('users', JSON.stringify(users));
};

const generateResetToken = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const sendPasswordResetEmail = async (email: string): Promise<boolean> => {
    // Local fallback for now
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) throw new Error('No account found');

    const resetToken = generateResetToken();
    users[userIndex].resetToken = resetToken;
    users[userIndex].resetTokenExpiry = Date.now() + 3600000;
    saveUsers(users);

    console.log('🔑 Reset Link:', `${window.location.origin}/reset-password?token=${resetToken}&email=${email}`);
    return true;
};

export const verifyResetToken = (email: string, token: string): boolean => {
    const users = getUsers();
    const user = users.find(u => u.email === email);
    if (!user || user.resetToken !== token || Date.now() > user.resetTokenExpiry) return false;
    return true;
};

export const resetPassword = (email: string, token: string, newPassword: string): boolean => {
    if (!verifyResetToken(email, token)) return false;
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === email);
    users[userIndex].password = btoa(newPassword);
    delete users[userIndex].resetToken;
    delete users[userIndex].resetTokenExpiry;
    saveUsers(users);
    return true;
};

export const changePassword = (_email: string, _oldPassword: string, _newPassword: string): boolean => {
    return true; // Placeholder
};
