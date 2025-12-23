let io;

export const initializeSocketIO = (socketIO) => {
  io = socketIO;

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join user-specific room
    socket.on('join', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Join vendor-specific room
    socket.on('joinVendor', (vendorId) => {
      socket.join(`vendor_${vendorId}`);
      console.log(`Vendor ${vendorId} joined their room`);
    });

    // Join chat room
    socket.on('joinChat', (roomId) => {
      socket.join(`chat_${roomId}`);
      console.log(`Joined chat room: ${roomId}`);
    });

    // Handle chat messages
    socket.on('sendMessage', (data) => {
      io.to(`chat_${data.roomId}`).emit('newMessage', data.message);
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      socket.to(`chat_${data.roomId}`).emit('userTyping', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Helper functions to emit events
export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

export const emitToVendor = (vendorId, event, data) => {
  if (io) {
    io.to(`vendor_${vendorId}`).emit(event, data);
  }
};

export const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};
