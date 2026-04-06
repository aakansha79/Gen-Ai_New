const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            "http://localhost:5173",
            "https://gen-ai-1-syk7.onrender.com"
        ];

        // allow requests with no origin (like Postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            return callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))//fix by Aditya ji --->Without this → req.body becomes malformed
app.use(cookieParser())

const authRouter = require("./routes/auth.routes")
 
const interviewRouter = require("./routes/interview.routes")

app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

module.exports = app
