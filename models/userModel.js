import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {type: String, requires: true},
    email: {type: String, requires: true, unique: true},
    password :{type: String, requires: true},
    avatar : {type:String, default: null}
},{
    timestamps: true
});

export default mongoose.model("User", userSchema);