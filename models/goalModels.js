import mongoose from "mongoose";

// member schema
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

// action schema
const actionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    note: { type: String },
    value: { type: Number, default: 0 }, 
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// task schema
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  isDone: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// goal schema
const goalSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: { type: String, default: "" },

    //Fitur legacy (target & current value UNUSED since sudah ada pakai fitur add task !!!)
    //targetValue: { type: Number, default: 100 },
    //currentValue: { type: Number, default: 0 },

    // Tambahan untuk membuat Timeline (Fitur Baru)
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },

    //tambahan task list
    tasks: {
    type: [taskSchema],
    default: [],
    },


    members: { type: [memberSchema], default: [] },
    actions: { type: [actionSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isPublic: { type: Boolean, default: false },
    
},{
    timestamps: true
});




export default mongoose.model("Goal", goalSchema);

