import { Request,Response,NextFunction } from "express";
export type RouteHandler = (req: Request, res: Response) => Promise<void>;
export type middlewareH = (req: Request, res: Response, next: NextFunction) => Promise<void>;