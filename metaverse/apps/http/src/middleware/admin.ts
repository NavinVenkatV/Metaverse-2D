import jwt from "jsonwebtoken"
import { JWT_PASSWORD } from "../routes/config";
import { NextFunction,  Request, Response } from "express";

export const adminMiddleware = (req: Request, res: Response, next: NextFunction)=>{
    const headers = req.headers['authorization'];
    if(!headers){
        return res.status(403).json({
            message : "Inavlid authorizatioin"
        })
    }
    const token = headers?.split(' ')[1];
    try{
        const decoded = jwt.verify(token,JWT_PASSWORD) as {userId : string, role : string}
        if(!decoded){
            return res.status(400).json({
                message : "Invalid authorization"
            })
        }
        req.userId = decoded.userId;
        next();
    }catch(e){
        return res.status(400).json({
            message : "Something went wrong"
        })
    }
}