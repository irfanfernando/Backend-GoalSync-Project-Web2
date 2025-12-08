import jwt from "jsonwebtoken";
const JWT_SECRET = "goalsync_secret";

export const authenticateTokenMiddleware = (req, res, next) =>{
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).json({message: "Token tidak ditemukan"});
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if(err){
            return res.status(403).json({message: "Token tidak valid"});
        }

        req.user = user;
        next()
    });
}