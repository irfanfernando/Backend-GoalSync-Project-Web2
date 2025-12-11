import { hash, compare } from "../utils/hashUtils.js";
import userModel from "../models/userModel.js";
import { getJwtToken } from "../utils/jwtSignUtils.js";


export const signUp = async (req, res) =>{
    try{
        const {username, email, password} = req.body;

        if(!username || !email || !password) {
            return res.status(400).json({
                message: " Username, email, dan password wajib diisi"
            });
        }

        const exist = await userModel.findOne({email});
        if (exist) {
            return res.status(400).json({
                message: "Email sudah digunakan"
            });
        }

        const hashedPassword = hash(password);

        await userModel.create({
            username,
            email,
            password: hashedPassword
        });

        res.status(200).json({
            message: "Pendaftaran berhasil, silahkan login"
        });
    }catch (error){
        res.status(500).json({message: error.message});
    }
};

export const signIn = async (req, res) => {
    try{
        const {email, password }= req.body;

        if( !email || !password) {
            return res.status(400).json({
                messsage: "Email dan password wajib diisi"
            });
        }

        const user = await userModel.findOne({email});
        if(!user){
            return res.status(400).json({
                message:"Email tidak ditemukan"
            });
        }

        const match = compare(password, user.password);
        if(!match) {
            return res.status(400).json({
                message: " Password Salah"
            });
        }

        const token = getJwtToken(user._id, user.username);

        res.status(200).json({
            message: "Login berhasil",
            data: {token}
        });
    }catch (error){
        res.status(500).json({message: error.message});
    }
};

export const listUsers = async (req, res) => {
    try{
        const q = (req.query.q || ""). trim();
        const filter = q ? {
            $or: [
                { username: { $regex: q, $options: "i" } },
                { email: { $regex: q, $options: "i" } }
            ]
        } : {};

        const users = await userModel.find(filter).limit(30).select("_id username email").lean().exec();
        return res.json({ data: users});
    }catch (error){
        res.status(500).json({ message: "Server Error", error: error.message});
    }

}