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
                role : parsedData.data.type === "admin" ? "Admin" : "User"
            }
        })
        res.json({
            id: user.id
        })
        return
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
            token
        })
        return
    }catch(e){
        res.status(400).json({
            message : "Something went wrong"
        })
        return;
    }

})

router.get('/avatars',async (req,res)=>{
    const avatars = await client.avatar.findMany();
    res.json({
        avatars : avatars.map(e=>({
            id : e.id,
            imageUrl : e.imageUrl,
            name : e.name
        }))
    })
})

router.get('/elements',async (req,res)=>{
    const elements = await client.element.findMany();
    res.json({
        Elements : elements.map(e=>({
            imageUrl : e.imageUrl,
            width : e.width,
            height : e.height,
            static : e.static
        }))
    })
})


router.use('/user',userRouter)
router.use('/space',spaceRouter)
router.use('/admin',adminRouter)
