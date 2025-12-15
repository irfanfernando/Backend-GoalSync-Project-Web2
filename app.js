import express from "express";
import path from "path"
import api from "./routes/api.js"
import database from "./config/database.js"
import cors from "cors";

const app = express ();

app.use(express.static(path.join(process.cwd(), "public"))); 
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use("/api",api);

app.get("/", (req, res) => {
    res.status(200).json({message: "GoalSync OK"});
});

app.listen(3000, () => {
    database();
    console.log(`App berjalan di http://localhost:3000`);

});
