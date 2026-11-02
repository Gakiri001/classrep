import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { getElectionStatus, getElectionResults, getElectionHistory } from '../services/electionService';
import { connectElectionSocket, disconnectElectionSocket } from '../services/socketService';
import { TOKEN_KEY } from '../services/api';
import { toast } from 'sonner';

// oxlint-disable react/only-export-components

const ElectionContext = createContext(null);

export function ElectionProvider({ children }) {
  const { member, loading: authLoading } = useAuth();
  const [status, setStatus] = useState(null);
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(Boolean(member));
  const [socketConnected, setSocketConnected] = useState(false);
  const [error, setError] = useState('');

  const refreshAll = useCallback(async () => {
    if (!sessionStorage.getItem(TOKEN_KEY)) return;
    setBusy(true);
    setError('');
    const [statusResponse, resultsResponse, historyResponse] = await Promise.allSettled([
      getElectionStatus(), getElectionResults(), getElectionHistory(),
    ]);
    if (statusResponse.status === 'fulfilled') setStatus(statusResponse.value.data);
    if (resultsResponse.status === 'fulfilled') setResults(resultsResponse.value.data);
    if (historyResponse.status === 'fulfilled') setHistory(historyResponse.value.data);
    const failure = [statusResponse, resultsResponse, historyResponse].some((item) => item.status === 'rejected');
    if (failure) setError('Some election information could not be loaded.');
    setBusy(false);
  }, []);

  useEffect(() => {
    if (authLoading || !member) {
      disconnectElectionSocket();
      return undefined;
    }
    // oxlint-disable-next-line react/set-state-in-effect -- Fetch initial election state when an authenticated socket session begins.
    refreshAll();
    const socket = connectElectionSocket(sessionStorage.getItem(TOKEN_KEY));
    const refresh = () => refreshAll();
    const onParticipation = (payload) => {
      window.dispatchEvent(new CustomEvent('classrep:election-event', { detail: { type: 'participationUpdated', payload } }));
      refreshAll();
    };
    const onCompleted = (payload) => {
      toast.success('The election draw is complete. Results are available.');
      window.dispatchEvent(new CustomEvent('classrep:election-event', { detail: { type: 'electionCompleted', payload } }));
      refreshAll();
    };
    const onRenewed = (payload) => {
      toast.info('A new election cycle has started.');
      window.dispatchEvent(new CustomEvent('classrep:election-event', { detail: { type: 'electionRenewed', payload } }));
      refreshAll();
    };
    const onConnect = () => { setSocketConnected(true); refresh(); };
    const onDisconnect = () => setSocketConnected(false);
    const onConnectError = () => setSocketConnected(false);
    socket?.on('connect', onConnect);
    socket?.on('disconnect', onDisconnect);
    socket?.on('connect_error', onConnectError);
    socket?.on('participationUpdated', onParticipation);
    socket?.on('electionCompleted', onCompleted);
    socket?.on('electionRenewed', onRenewed);
    return () => {
      socket?.off('connect', onConnect);
      socket?.off('disconnect', onDisconnect);
      socket?.off('connect_error', onConnectError);
      socket?.off('participationUpdated', onParticipation);
      socket?.off('electionCompleted', onCompleted);
      socket?.off('electionRenewed', onRenewed);
    };
  }, [member, authLoading, refreshAll]);

  const value = useMemo(() => ({ status, results, history, busy, error, socketConnected, refreshAll }), [status, results, history, busy, error, socketConnected, refreshAll]);
  return <ElectionContext.Provider value={value}>{children}</ElectionContext.Provider>;
}

export function useElection() {
  const value = useContext(ElectionContext);
  if (!value) throw new Error('useElection must be used within ElectionProvider');
  return value;
}
