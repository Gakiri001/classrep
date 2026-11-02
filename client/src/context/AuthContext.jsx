import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getMe } from '../services/memberService';
import { MEMBER_KEY, TOKEN_KEY } from '../services/api';
import { disconnectElectionSocket } from '../services/socketService';

// oxlint-disable react/only-export-components

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [member, setMember] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(MEMBER_KEY) || 'null'); } catch { return null; }
  });
  const [loading, setLoading] = useState(Boolean(sessionStorage.getItem(TOKEN_KEY)));

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(MEMBER_KEY);
    sessionStorage.removeItem('pending_email');
    setMember(null);
    disconnectElectionSocket();
  }, []);

  const login = useCallback((token, profile) => {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(MEMBER_KEY, JSON.stringify(profile));
    setMember(profile);
  }, []);

  const refreshMember = useCallback(async () => {
    const { data } = await getMe();
    setMember(data);
    sessionStorage.setItem(MEMBER_KEY, JSON.stringify(data));
    return data;
  }, []);

  useEffect(() => {
    let active = true;
    const restore = async () => {
      if (!sessionStorage.getItem(TOKEN_KEY)) { setLoading(false); return; }
      try {
        const { data } = await getMe();
        if (active) { setMember(data); sessionStorage.setItem(MEMBER_KEY, JSON.stringify(data)); }
      } catch { if (active) logout(); }
      finally { if (active) setLoading(false); }
    };
    const expired = () => logout();
    window.addEventListener('classrep:auth-expired', expired);
    restore();
    return () => { active = false; window.removeEventListener('classrep:auth-expired', expired); };
  }, [logout]);

  const value = useMemo(() => ({ member, setMember, loading, login, logout, refreshMember }), [member, loading, login, logout, refreshMember]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
