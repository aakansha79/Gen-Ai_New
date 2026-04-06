const userModel = require("../models/user.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")

// ================= REGISTER =================
async function registerUserController(req, res) {
    try {
        const { username, email, password } = req.body

        console.log("REGISTER BODY:", req.body)

        // 1. Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide username, email and password"
            })
        }

        if (typeof email !== "string") {
            return res.status(400).json({
                message: "Invalid email format"
            })
        }

        // 2. Check existing user
        const isUserAlreadyExists = await userModel.findOne({
            $or: [{ username }, { email }]
        })

        if (isUserAlreadyExists) {
            return res.status(400).json({
                message: "Account already exists"
            })
        }

        // 3. Hash password
        const hash = await bcrypt.hash(password, 10)

        // 4. Create user
        const user = await userModel.create({
            username,
            email,
            password: hash
        })

        // 5. Generate token
        const token = jwt.sign(
            { id: user._id, user: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        // 6. Set cookie (IMPORTANT FIX)
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // true in production (HTTPS)
            sameSite: "lax"
        })

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })

    } catch (error) {
        console.error("REGISTER ERROR:", error)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}


// ================= LOGIN =================
async function loginUserController(req, res) {
    try {
        let { email, password } = req.body

        console.log("LOGIN BODY:", req.body)

        // 🔥 DEFENSIVE FIX (your earlier bug)
        if (typeof email === "object") {
            password = email.password
            email = email.email
        }

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password required"
            })
        }

        // 1. Find user
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        // 2. Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        // 3. Generate token
        const token = jwt.sign(
            { id: user._id, user: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        // 4. Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        })

        return res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })

    } catch (error) {
        console.error("LOGIN ERROR:", error)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}


// ================= LOGOUT =================
async function logoutUserController(req, res) {
    try {
        const token = req.cookies.token

        if (token) {
            await tokenBlacklistModel.create({ token })
        }

        res.clearCookie("token")

        return res.status(200).json({
            message: "User logged out successfully"
        })

    } catch (error) {
        console.error("LOGOUT ERROR:", error)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}


// ================= GET ME =================
async function getMeController(req, res) {
    try {
        const user = await userModel.findById(req.user.id)

        return res.status(200).json({
            message: "User details fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })

    } catch (error) {
        console.error("GET ME ERROR:", error)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}