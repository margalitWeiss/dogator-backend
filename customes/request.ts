import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface CustomRequest extends Request {
  id?: string;  // Optional property to hold user ID
  userAuth?: JwtPayload;  // Optional property to hold user information from JWT
}
