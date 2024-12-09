import jwt from "jsonwebtoken"
import { JWT_PASSWORD } from "../routes/config";
import { NextFunction,  Request, Response } from "express";

export const adminMiddleware = (req: Request, res: Response, next: NextFunction)=>{
    const headers = req.headers['authorization'];
    if(!headers){
        res.status(403).json({
            message : "Inavlid authorizatioin"
        })
        return
    }
    const token = headers?.split(' ')[1];
    try{
        const decoded = jwt.verify(token,JWT_PASSWORD) as {userId : string, role : string}
        if(!decoded || decoded.role != "admin"){
            res.status(400).json({
                message : "Invalid authorization"
            })
            return
        }
        req.userId = decoded.userId;
        next();
    }catch(e){
        res.status(400).json({
            message : "Something went wrong"
        })
        return
    }
}