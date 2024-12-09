import { Router } from "express";
import client from "@ui/db/client"
import { userMiddleware } from "../middleware/user";
import { UpdatemetadataSchema } from "../types";

export const userRouter = Router();

userRouter.post("/metadata", userMiddleware, async (req, res) => {
    const parsedData = UpdatemetadataSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(403).json({
            message : "Invalid Avatar Id"
        })
        return
    }
    try{
        await client.user.update({
            where : {
                id : req.userId
            },
            data : {
                avatarId : parsedData.data.avatarId
            }
        })
        res.status(200).json({message : "updated metadata successfully"})
    }catch(e){
        res.status(400).json({message : "Something went wrong"})
    }
})

userRouter.get('/metadata/bulk', async (req,res)=>{
    const metaId = req.query.ids as string;
    const type = JSON.parse(metaId);
    console.log(type);
})