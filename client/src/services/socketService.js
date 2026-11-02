import { io } from 'socket.io-client';

let socket;

export function connectElectionSocket(token) {
  if (!token) return null;
  if (socket?.connected && socket.auth?.token === token) return socket;
  if (socket) socket.disconnect();
  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
  });
  return socket;
}

export function getElectionSocket() { return socket; }
export function disconnectElectionSocket() {
  socket?.disconnect();
  socket = null;
}
