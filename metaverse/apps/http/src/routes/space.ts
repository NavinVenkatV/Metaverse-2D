import { Router } from "express";
import { CreateSpaceSchema } from "../types";
import { userMiddleware } from "../middleware/user";
import client from "@ui/db/client"


export const spaceRouter = Router();

spaceRouter.post('/',userMiddleware,async (req,res)=>{
    const parsedBody = CreateSpaceSchema.safeParse(req.body);
    if(!parsedBody.success){
        res.status(403).json({message : "Invalid Input"})
    }
    if(!parsedBody.data?.mapId){
        await client.space.create({
            data : {
                name : parsedBody.data?.name,
                width : parsedBody.data?.dimensions.split("x")[0],
                height : parsedBody.data?.dimensions.split("x")[1],
                creatorId : req.userId
            }
        })
        res.json({message : "Space created succesfully"})
    }
})

spaceRouter.delete('/:spaceId',(req,res)=>{

})

spaceRouter.get('/all',(req,res)=>{

})

spaceRouter.get('/:spaceId',(req,res)=>{

})

spaceRouter.post('/element',(req,res)=>{

})

spaceRouter.delete('/element',(req,res)=>{

})