import e, { Router } from "express";
import { AddElementSchema, CreateElementSchema, CreateSpaceSchema, DeleteElementSchema } from "../types";
import { userMiddleware } from "../middleware/user";
import client from "@ui/db/client"


export const spaceRouter = Router();

spaceRouter.post('/',userMiddleware,async (req,res)=>{
    console.log("endopibnt")
    const parsedData = CreateSpaceSchema.safeParse(req.body)
    if (!parsedData.success) {
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
    const map = await client.map.findFirst({
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
    console.log("ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo")
    const space = await client.space.findFirst({
        where : {
            id : req.params.spaceId
        }, select : {
            creatorId : true
        }
    })
    if(!space){
        console.log('efkkrngfffffffffffffffffffffrrrrrrrrrrrrrrrrrrrrrrrfffffffffffffffffffffffffffff')
        res.status(400).json({message : "Space not found"})
        return
    }
    if(space?.creatorId != req.userId){
        res.status(403).json({message : "Unauthorized user"})
        return
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

spaceRouter.get('/:spaceId',userMiddleware,async (req,res)=>{
    const spaceId = req.params.id;
    const space = await client.space.findUnique({
        where : {
            id : spaceId
        },include : {
            elements : {
                include : {
                    element : true
                }
            },
        }
    })
    if(!space){
        res.status(400).json({message : "Invalid space Id"})
        return
    }
    res.json({
        Dimenstions : `${space.width}x${space.height}`,
        Elements : space.elements.map(e => ({
            id : e.id ,
            element : {
                id : e.element.id,
                imageUrl : e.element.imageUrl,
                static : e.element.static,
                width : e.element.width,
                height : e.element.height
            },
            x : e.x,
            y : e.y
        }))
    })
    return
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
    const spaceElements = await client.spaceElements.findUnique({
        where : {
            id : parsedData.data.id
        },include : {
            space : true
        }
    })
    if(spaceElements?.space.creatorId != req.userId){
        res.status(403).json({message : "Authorization fails"})
        return
    }
    await client.spaceElements.delete({
        where :{
            id : parsedData.data.id
        }
    })
})