import { Request, Response, NextFunction } from "express";
import { blockedManyTimesUsers, getUsersWithOpenReports } from "../services/managmentDashboardService";

export const openReportedUsers = async (req:Request,res:Response):Promise<Response|void>=>{
    try{
        const reported_users= await getUsersWithOpenReports();
        return res.status(200).json(reported_users)
    }catch(err){
        return res.status(500).json({ message: 'Server error' });
    }
}


export const getBlockedUsers = async (req:Request,res:Response):Promise<Response|void>=>{
    console.log("getBlockedUsers function ❤️")

    try{
        const blocked_users= await blockedManyTimesUsers();
        return res.status(200).json(blocked_users)
    }catch(err){
        return res.status(500).json({ message: 'Server error' });
    }
}