import { Router } from "express";
import { userRouter } from "./user";
import { spaceRouter } from "./space";
import { adminRouter } from "./admin";
import { SigninSchema, SignupSchema } from "../types";
import client from "@ui/db/client"
import {hash, compare} from "./scrypt"
import jwt from "jsonwebtoken"
import { JWT_PASSWORD } from "./config";

export const router = Router();

router.post('/signup',async (req,res)=>{
    const parsedData = SignupSchema.safeParse(req.body)
    if(!parsedData.success){
         res.status(403).json({
            message : "Invalid username or password"
        })
        return;
    }
    const hashedPassword = await hash(parsedData.data.password)
    try{
        const user = await client.user.create({
            data: {
                username: parsedData.data.username,
                password: hashedPassword,
                role : parsedData.data.role === "admin" ? "Admin" : "User"
            }
        })
        res.json({
            userId: user.id
        })
    }catch(e){
        res.status(400).json({
            message : "Something went wrong"
        })
        return
    }
})

router.post('/signin',async (req,res)=>{
    const parsedData = SigninSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(403).json({
            message : "Invalid username or password"
        })
        return
    }
    try{
        const user = await client.user.findUnique({
            where : {
                username : parsedData.data.username
            }
        })
        if(!user){
            res.status(403).json({
                message : "User doesn't exists"
            })
            return;
        }
        const isvalid = await compare(parsedData.data.password, user?.password)
        if(!isvalid){
            res.status(400).json({
                message : "Incorrect password"
            })
            return;
        }
        const token = jwt.sign({
            userId : user.id,
            role : user.role
        },JWT_PASSWORD)

        res.json({
            token : token
        })

    }catch(e){
        res.status(400).json({
            message : "Something went wrong"
        })
        return;
    }

})

router.get('/avatars',(req,res)=>{

})

router.get('/elements',(req,res)=>{

})


router.use('/user',userRouter)
router.use('/space',spaceRouter)
router.use('/admin',adminRouter)
