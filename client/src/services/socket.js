import { io } from 'socket.io-client';

let socket = null;

export const initSocket = () => {
  if (socket) return socket;
  // VITE_API_URL may include '/api' in this project; strip it for socket connection
  const raw = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const API_URL = raw.replace(/\/api\/?$/, '');
  const token = localStorage.getItem('token');
  socket = io(API_URL, {
    auth: { token },
    withCredentials: true,
  });
  socket.on('connect_error', (err) => {
    console.error('Socket connect_error', err);
  });
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default { initSocket, getSocket, disconnectSocket };
