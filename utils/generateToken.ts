import jwt from "jsonwebtoken";
export default function generateToken(user: { user_id: string; email: string;role:string }){
    const secretKey = process.env.SECRET_KEY;
  if (!secretKey) {
    throw new Error("SECRET_KEY is not defined in the environment variables.");
  }
let token=jwt.sign({
    userId:user.user_id,
    role:user.role,
    email:user.email
},secretKey,
{expiresIn:"1h"})
return token;
}

