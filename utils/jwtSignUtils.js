import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "goalsync_secret";

export const getJwtToken = (userId, username) => {
    return jwt.sign(
        {userId: userId, username: username},
        JWT_SECRET,
        {expiresIn: "7d"}
    );
};

export const verifyJwtToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};