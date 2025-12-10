import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "goalsync_secret";

export const authenticateTokenMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ message: "Token tidak valid" });
    }

    req.user = {
      userId: payload.userId ?? payload.user_id ?? payload.id ?? null,
      user_id: payload.user_id ?? payload.userId ?? payload.id ?? null,
      username: payload.username ?? payload.name ?? null,
    };

    next();
  });
};
export default authenticateTokenMiddleware;