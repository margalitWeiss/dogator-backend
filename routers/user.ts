import { Router } from "express";
import { login,signUp,deleteUserById, getUserById, updateUser,deleteUser,logout} from "../controllers/users";
import { checkAuth } from "../middlewares/auth";
import { middlewareH } from "../types/handlers";

const userRoute = Router();

userRoute.post("/auth/login",login)
userRoute.post("/auth/signup",signUp)
userRoute.get("/:id",checkAuth as middlewareH,getUserById)
userRoute.get("/me",checkAuth as middlewareH,getUserById)
userRoute.delete("/:id",checkAuth as middlewareH,deleteUserById)
userRoute.put("/:id",checkAuth as middlewareH,updateUser)
userRoute.post("/auth/logout",logout)
userRoute.delete("/me",checkAuth as middlewareH,deleteUser)
export default userRoute;
