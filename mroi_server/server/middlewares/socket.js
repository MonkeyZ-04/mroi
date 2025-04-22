import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import { REDIS } from "@configs";

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_KEY } = REDIS.default;

class SocketIOMiddleware {
  redis;
  pub;
  sub;
  io;
  constructor() {
    this.redis = new Redis({ host: REDIS_HOST, port: REDIS_PORT, password: REDIS_PASSWORD });
    this.pub = this.redis.duplicate();
    this.sub = this.redis.duplicate();
  }

  init(io) {
    this.io = io;
    this.io.adapter(createAdapter(this.pub, this.sub, { key: REDIS_KEY }));
  }

  addHandler(app) {
    app.use((req, res, next) => {
      req.socket = { io: this.io, redis: this.redis, pub: this.pub, sub: this.sub };
      next();
    });
  }

  startListenner() {
    this.io.on("connection", (socket) => {
      socket.on("join_workspace", (room) => {
        socket.join(room);
      });
      socket.on("leave_workspace", (room) => {
        socket.leave(room);
      });
    });
  }
}

export default new SocketIOMiddleware();
