import { Router } from "express";
import { AddElementSchema, CreateElementSchema, CreateSpaceSchema, DeleteElementSchema } from "../types";
import { userMiddleware } from "../middleware/user";
import client from "@ui/db/client"


export const spaceRouter = Router();

spaceRouter.post('/',userMiddleware,async (req,res)=>{
    console.log("endopibnt")
    const parsedData = CreateSpaceSchema.safeParse(req.body)
    if (!parsedData.success) {
        console.log(JSON.stringify(parsedData))
        res.status(400).json({message: "Validation failed"})
        return
    }

    if (!parsedData.data.mapId) {
        const space = await client.space.create({
            data: {
                name: parsedData.data.name,
                width: parseInt(parsedData.data.dimensions.split("x")[0]),
                height: parseInt(parsedData.data.dimensions.split("x")[1]),
                creatorId: req.userId!
            }
        });
        res.json({spaceId: space.id})
        return;
    }
    const map = await client.map.findUnique({
        where : {
            id : parsedData.data.mapId
        },
        select : {
            mapElements : true,
            width : true,
            height : true
        }
    })
    if(!map){
        res.status(400).json({message : "Invalid mapId"})
        return
    }
    let space = await client.$transaction(async ()=>{
        const space = await client.space.create({
            data : {
                name : parsedData.data.name,
                width : map.width,
                height :  map.height,
                creatorId : req.userId!
            }
        })
    
        await client.spaceElements.createMany({
            data :  map.mapElements.map(e =>({
                mapId : e.mapId,
                spaceId : space.id,
                elementId : e.elementId,
                x : e.x!,
                y : e.y!
            }))
        })
        return space;
    })
    res.json({spaceID : space.id})
    return;
})

spaceRouter.delete('/:spaceId',userMiddleware, async(req,res)=>{
    const space = await client.space.findUnique({
        where : {
            id : req.params.spaceId
        }, select : {
            creatorId : true
        }
    })
    if(!space){
        res.status(400).json({message : "Space not found"})
    }
    if(space?.creatorId != req.userId){
        res.status(403).json({message : "Unauthorized user"})
    }
    await client.space.delete({
        where : {
            id : req.params.id
        }
    })
    res.status(200).json({"message" : "space created successfully"})
})

spaceRouter.get('/all',userMiddleware, async (req,res)=>{
    const spaces = await client.space.findMany({
        where : {
            creatorId : req.userId
        }
    })
    if(!spaces){
        res.status(400).json({message : "something went wrong"})
        return
    }
    res.json({
        spaces : spaces.map(e =>({
            name : e.name,
            thumbnail : e.thumbnail,
            dimenstion : `${e.width}x${e.height}`
        }))
    })
    return;
})

spaceRouter.get('/:spaceId',(req,res)=>{

})

spaceRouter.post('/element',userMiddleware, async(req,res)=>{
    const parsedData = AddElementSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({message : "Something went wrong"});
        return;
    }
    const space = client.space.findUnique({
        where : {
            id : parsedData.data.spaceId
        }
    })
    const element = client.element.findUnique({
        where : {
            id : parsedData.data.elementId
        }
    })
    if(!space || !element){
        res.status(400).json({message : "Invalid spaceId or elementId"})
    }
    await client.spaceElements.create({
        data : {
            elementId : parsedData.data.elementId,
            spaceId : parsedData.data.spaceId,
            x : parsedData.data.x,
            y : parsedData.data.y
        }
    })
})

spaceRouter.delete('/element',async(req,res)=>{
    const parsedData = DeleteElementSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({message  : "Invalid credentials"})
        return
    }
    const space = await client.space.findUnique({
        where : {
            id : parsedData.data.spaceId
        }
    })
    if(!space){
        res.status(400).json({message : "Invalid space Id"})
        return
    }
    await client.spaceElements.delete({
        where : {
            spaceId : parsedData.data.spaceId,
            elementId : parsedData.data.elementId
        } 
    })
})