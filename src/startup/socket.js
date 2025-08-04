module.exports = function (io) {
  io.on('connection', (socket) => {
    console.log('📡 Socket ulandi:', socket.id);

    socket.on('join', (room) => {
      socket.join(room);
      console.log(`🔗 Ulandi xonaga: ${room}`);
    });

    socket.on('disconnect', () => {
      console.log('❌ Ajraldi:', socket.id);
    });
  });
};
