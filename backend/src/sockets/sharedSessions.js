import SharedSession from "../v1/models/SharedSession.js";

export function attachSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    socket.on("joinSession", async ({ sessionId, userId }) => {
      console.log(`User ${userId} joined session ${sessionId}`);

      // Example: update DB when a user joins
      await SharedSession.findByIdAndUpdate(sessionId, {
        $addToSet: { participants: { userId } },
      });

      socket.join(sessionId);
      io.to(sessionId).emit("sessionUpdated", { sessionId });
    });

    socket.on("leaveSession", async ({ sessionId, userId }) => {
      console.log(`User ${userId} left session ${sessionId}`);

      await SharedSession.findByIdAndUpdate(sessionId, {
        $pull: { participants: { userId } },
      });

      socket.leave(sessionId);
      io.to(sessionId).emit("sessionUpdated", { sessionId });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);
    });
  });
}
