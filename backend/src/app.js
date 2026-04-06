const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

const stringList = (value) =>
  (value || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

const baseOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://gen-ai-new-frontend.onrender.com",
  "https://gen-ai-new.onrender.com",
  process.env.FRONTEND_URL
].filter(Boolean)

const allowedOrigins = Array.from(
  new Set([...baseOrigins, ...stringList(process.env.CORS_WHITELIST)])
)

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      callback(new Error("Not allowed by CORS"))
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200
  })
)


app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});


app.use(express.json())
app.use(express.urlencoded({ extended: true }))//fix by Aditya ji --->Without this → req.body becomes malformed
app.use(cookieParser())

const authRouter = require("./routes/auth.routes")
 
const interviewRouter = require("./routes/interview.routes")

app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

app.use((err, req, res, next) => {
  console.error("ERROR:", err)
  if (res.headersSent) {
    return next(err)
  }
  res.status(err?.status || 500).json({
    message: err?.message || "Internal server error"
  })
})

module.exports = app
