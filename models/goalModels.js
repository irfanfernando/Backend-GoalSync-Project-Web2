import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    name: String,
    avatar: String,
    role : {
        type: String,
        default: "member"
    },
    joinedAt : {
        type: Date,
        default: Date.now
    }
});
const actionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    note: { type: String },
    value: { type: Number, default: 0 }, 
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);
const goalSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: { type: String, default: "" },
    targetValue: { type: Number, default: 100 },
    currentValue: { type: Number, default: 0 },
    members: { type: [memberSchema], default: [] },
    actions: { type: [actionSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isPublic: { type: Boolean, default: false },
},{
    timestamps: true
});

export default mongoose.model("Goal", goalSchema);

