import {io} from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3002";

let socket = null;

export const connectSocket = (token) => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transport : ['websocket','polling'],
            auth: {
                token: token
            },
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });
    }
    if (!socket.connected) {
        socket.connect();
    }

    return socket;
}

export const getSocket = () =>  socket;
export const joinRoom = (roomId) => {
    if(socket?.connected) {
        socket.emit('join-room', { roomId });
        console.log(`Joined room: ${roomId}`);
    }
}
export const leaveRoom = (roomId) => {
    if(socket?.connected) {
        socket.emit('leave-room', { roomId });
        console.log(`Left room: ${roomId}`);
    }
}
export const joinTicket = (ticketId) => {
    if(socket?.connected) {
        socket.emit('join-ticket', ticketId);
        console.log(`Joined ticket room: ${ticketId}`);
    }
}
export const joinTask = (taskId) => {
    if(socket?.connected) {
        socket.emit('join-task', taskId);
        console.log(`Joined task room: ${taskId}`);
    }
}
export const leaveTicket = (ticketId) => {
    if(socket?.connected) {
        socket.emit('leave-ticket', ticketId);
        console.log(`Left ticket room: ${ticketId}`);
    }
}
export const leaveTask = (taskId) => {
    if(socket?.connected) {
        socket.emit('leave-task', taskId);
        console.log(`Left task room: ${taskId}`);
    }
}
export const authenticationSocket = (userId) => {
    if(socket?.connected) {
        socket.emit('authenticate', { userId });
        console.log(`Socket authenticated for user: ${userId}`);
    }
}
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};