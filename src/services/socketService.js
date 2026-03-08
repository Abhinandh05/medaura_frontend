import socketIO from 'socket.io-client';
import store from '../redux/store';
import { addNotification } from '../redux/slices/notificationSlice';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL 
  ? process.env.EXPO_PUBLIC_API_URL.replace('/api', '') 
  : 'https://medaura-backend.vercel.app';

class SocketService {
  socket = null;

  connect(userId, role) {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = socketIO(SOCKET_URL);

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      
      // Join appropriate room based on role
      if (role === 'pharmacy') {
        this.socket.emit('join_pharmacy', userId);
      } else if (role === 'user') {
        this.socket.emit('join_user', userId);
      }
    });

    this.socket.on('new_notification', (notification) => {
      console.log('New notification received:', notification);
      store.dispatch(addNotification(notification));
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

const socketService = new SocketService();
export default socketService;
