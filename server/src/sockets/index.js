let ioInstance = null;

export function initSockets(io) {
  ioInstance = io;

  io.on("connection", (socket) => {
    socket.on("identify", (userId) => {
      if (userId) socket.join(`user:${userId}`);
    });

    socket.on("disconnect", () => {});
  });
}

export function emitToUser(userId, event, payload) {
  if (!ioInstance) return;
  ioInstance.to(`user:${userId}`).emit(event, payload);
}
