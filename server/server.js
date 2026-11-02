import "dotenv/config";
import http from "node:http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { Server as SocketServer } from "socket.io";
import { rateLimit } from "express-rate-limit";
import { connectDB } from "./config/db.js";
import Member from "./models/Member.js";
import authRoutes from "./routes/authRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import electionRoutes from "./routes/electionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { setIo } from "./utils/realtime.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();
const server = http.createServer(app);
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const io = new SocketServer(server, {
  cors: { origin: clientUrl, methods: ["GET", "POST"], credentials: true },
});
setIo(io);

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json({ limit: "20kb" }));
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60_000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);

app.get("/api/health", (req, res) =>
  res.json({
    status: "ok",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  }),
);
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/election", electionRoutes);
app.use("/api/admin", adminRoutes);
app.use(notFound);
app.use(errorHandler);

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const member = await Member.findById(payload.sub).select("_id isActive");
    if (!member?.isActive) return next(new Error("Authentication required"));
    socket.memberId = String(member._id);
    next();
  } catch {
    next(new Error("Invalid or expired authentication"));
  }
});

const port = Number(process.env.PORT || 5000);
try {
  await connectDB();
  server.listen(port, "0.0.0.0", () =>
    console.log(`Server listening on port ${port}`),
  );
} catch {
  console.error(
    "Unable to connect to MongoDB. Check network access and server configuration.",
  );
  process.exit(1);
}

function shutdown() {
  server.close(() => mongoose.disconnect().finally(() => process.exit(0)));
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
