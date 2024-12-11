import { Router } from "express";
import { adminMiddleware } from "../middleware/admin";
import { CreateAvatarSchema, CreateElementSchema, CreateMapSchema, UpdateElementSchema } from "../types";
import client from "@ui/db/client"

export const adminRouter = Router();

adminRouter.post('/element',async (req,res)=>{
    console.log("inside creatting the element ---------------------------444444444444")
    const parsedData = CreateElementSchema.safeParse(req.body)
    if(!parsedData.success){
        res.status(400).json({message : "Invalid Inputs"})
        return
    }
    const element = await client.element.create({
        data : {
            imageUrl : parsedData.data?.imageUrl,
            width : parsedData.data?.width,
            height : parsedData.data?.height,
            static : parsedData.data?.static
        }
    })
    res.json({
        id : element.id
    })
})

adminRouter.put('/element/:elementId',adminMiddleware, async (req,res)=>{
    const parsedData = UpdateElementSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({message : "invalid input"})
        return
    }
    await client.element.update({
        where : {
            id : req.params.elementId
        },
        data : {
            imageUrl : parsedData.data.imageUrl
        }
    })
    res.json({message : "Element updated successfully"})
})

adminRouter.post('/avatar',async(req,res)=>{
    const parsedData = CreateAvatarSchema.safeParse(req.body);
    if(!parsedData.success)(
        res.status(400).json({message : "Invalid input"})
    )
    const avatar  = await client.avatar.create({
        data  : {
            imageUrl  : parsedData.data?.imageUrl,
            name : parsedData.data?.name
        }
    })
    res.status(200).json({avatarId  : avatar.id})
})

adminRouter.post("/map", async (req, res) => {
    const parsedData = CreateMapSchema.safeParse(req.body)
    if (!parsedData.success) {
        res.status(400).json({message: "Validation failed"})
        return
    }
    const map = await client.map.create({
        data: {
            name: parsedData.data.name,
            width: parseInt(parsedData.data.dimensions.split("x")[0]),
            height: parseInt(parsedData.data.dimensions.split("x")[1]),
            thumbnail: parsedData.data.thumbnail,
            mapElements: {
                create: parsedData.data.defaultElements.map(e => ({
                    elementId: e.elementId,
                    x: e.x,
                    y: e.y
                }))
            }
        }
    })
    console.log(parsedData.data.defaultElements)

    res.json({
        id: map.id
    })
})