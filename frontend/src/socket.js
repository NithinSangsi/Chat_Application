import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
  reconnection: true,
  reconnectionDelay: 500,
  reconnectionDelayMax: 2000,
  reconnectionAttempts: 10
});

socket.on('connect', () => console.log('Socket connected:', socket.id));
socket.on('disconnect', () => console.log('Socket disconnected'));
// Force reconnect on visibility change
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Paused
    } else {
      // Resumed - force check
      socket.emit('user-sync');
    }
  });
}

export default socket;
