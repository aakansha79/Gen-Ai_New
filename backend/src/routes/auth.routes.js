const { Router } = require("express")
const authController = require("../controllers/auth.controller")
const authMiddleware= require ("../middlewares/auth.middleware")

const authRouter = Router()

const respondOptions = (req, res) => res.sendStatus(200)

authRouter.options(["/register", "/login", "/logout", "/get-me"], respondOptions)

authRouter.post("/register", authController.registerUserController)
authRouter.post("/login", authController.loginUserController)

authRouter.post("/logout", authController.logoutUserController)
authRouter.get(
  "/get-me",
  authMiddleware.authUser,
  authController.getMeController
)

module.exports = authRouter
