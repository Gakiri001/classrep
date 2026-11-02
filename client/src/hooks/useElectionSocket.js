import { useEffect } from 'react';
import { getElectionSocket } from '../services/socketService';

export function useElectionSocket(event, handler) {
  useEffect(() => {
    const socket = getElectionSocket();
    if (!socket || !handler) return undefined;
    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, [event, handler]);
}
