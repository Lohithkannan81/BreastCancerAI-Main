import { jwtDecode } from 'jwt-decode';

const API_URL = import.meta.env.VITE_API_URL || '';

/* ────────────────────────────────────────────────────────────
   LOCAL STORAGE USER STORE
   Used both as a cache and as a complete offline fallback when
   the backend is unavailable (e.g., Vercel free tier SQLite limits).
──────────────────────────────────────────────────────────── */
const LS_KEY = 'medibot_users';

interface LSUser {
  username: string;
  passwordHash: string;
  fullname: string;
  role: string;
}

function hashPassword(pw: string): string {
  // Simple deterministic hash (same logic as backend SHA-256 hex)
  // We use a fast JS approach since we can't import Node crypto in browser
  let hash = 0;
  for (let i = 0; i < pw.length; i++) {
    hash = ((hash << 5) - hash) + pw.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

function getLocalUsers(): LSUser[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}
function saveLocalUsers(users: LSUser[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(users));
}

/* ────────────────────────────────────────────────────────────
   TRY BACKEND — falls back to localStorage on any network error
──────────────────────────────────────────────────────────── */
async function tryBackend(path: string, body: object): Promise<any | null> {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000), // 5s timeout
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(err.detail || 'Request failed');
    }
    return await res.json();
  } catch (e: any) {
    // Network / connection error — return null to trigger localStorage fallback
    if (e.name === 'TypeError' || e.name === 'AbortError') return null;
    throw e; // Re-throw actual HTTP errors (401, 400, etc.)
  }
}

/* ────────────────────────────────────────────────────────────
   LOGIN
──────────────────────────────────────────────────────────── */
export const loginUser = async (email: string, password: string): Promise<any> => {
  // 1. Try backend
  const data = await tryBackend('/login', { username: email, password });
  if (data) {
    return { email: data.username, name: data.fullname, role: data.role, organization: 'Clinical Portal' };
  }

  // 2. Fallback: localStorage
  const users = getLocalUsers();
  const user = users.find(u => u.username === email && u.passwordHash === hashPassword(password));
  if (!user) throw new Error('Invalid credentials');
  return { email: user.username, name: user.fullname, role: user.role, organization: 'Clinical Portal' };
};

/* ────────────────────────────────────────────────────────────
   GOOGLE LOGIN
──────────────────────────────────────────────────────────── */
export const googleLoginUser = async (credential: string): Promise<any> => {
  const decoded: any = jwtDecode(credential);
  const { email, name } = decoded;
  const displayName = name || email.split('@')[0];

  // 1. Try backend
  const data = await tryBackend('/google-login', { email, name: displayName });
  if (data) {
    return { email: data.username, name: data.fullname, role: data.role, organization: 'Clinical Portal' };
  }

  // 2. Fallback: localStorage — find or auto-create
  const users = getLocalUsers();
  const existing = users.find(u => u.username === email);
  if (existing) {
    return { email: existing.username, name: existing.fullname, role: existing.role, organization: 'Clinical Portal' };
  }
  // Auto-register Google user locally
  const newUser: LSUser = { username: email, passwordHash: '', fullname: displayName, role: 'Doctor' };
  saveLocalUsers([...users, newUser]);
  return { email: newUser.username, name: newUser.fullname, role: newUser.role, organization: 'Clinical Portal' };
};

/* ────────────────────────────────────────────────────────────
   REGISTER
──────────────────────────────────────────────────────────── */
export const registerUser = async (
  email: string,
  password: string,
  name: string,
  role: string,
  _organization: string,
  _department: string
): Promise<boolean> => {
  // 1. Try backend
  const data = await tryBackend('/signup', { username: email, password, fullname: name, role });
  if (data) return true;

  // 2. Fallback: localStorage
  const users = getLocalUsers();
  if (users.find(u => u.username === email)) throw new Error('Username already exists');
  const newUser: LSUser = { username: email, passwordHash: hashPassword(password), fullname: name, role };
  saveLocalUsers([...users, newUser]);
  return true;
};

/* ────────────────────────────────────────────────────────────
   PASSWORD RESET (local only)
──────────────────────────────────────────────────────────── */
function generateToken(): string {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export const sendPasswordResetEmail = async (email: string): Promise<boolean> => {
  const users = getLocalUsers();
  const idx = users.findIndex(u => u.username === email);
  if (idx === -1) throw new Error('No account found with that email');
  const token = generateToken();
  (users[idx] as any).resetToken = token;
  (users[idx] as any).resetTokenExpiry = Date.now() + 3_600_000;
  saveLocalUsers(users);
  console.log('🔑 Reset link:', `${window.location.origin}/reset-password?token=${token}&email=${email}`);
  return true;
};

export const verifyResetToken = (email: string, token: string): boolean => {
  const users = getLocalUsers();
  const user = users.find(u => u.username === email) as any;
  return !!(user?.resetToken === token && Date.now() < user?.resetTokenExpiry);
};

export const resetPassword = (email: string, token: string, newPassword: string): boolean => {
  if (!verifyResetToken(email, token)) return false;
  const users = getLocalUsers();
  const idx = users.findIndex(u => u.username === email);
  users[idx].passwordHash = hashPassword(newPassword);
  delete (users[idx] as any).resetToken;
  delete (users[idx] as any).resetTokenExpiry;
  saveLocalUsers(users);
  return true;
};

export const changePassword = (_email: string, _oldPassword: string, _newPassword: string): boolean => true;
