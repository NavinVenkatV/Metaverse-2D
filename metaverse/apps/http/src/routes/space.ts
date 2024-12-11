import e, { Router } from "express";
import { AddElementSchema, CreateElementSchema, CreateSpaceSchema, DeleteElementSchema } from "../types";
import { userMiddleware } from "../middleware/user";
import client from "@ui/db/client"
import { adminMiddleware } from "../middleware/admin";


export const spaceRouter = Router();

spaceRouter.delete('/element',userMiddleware,async(req,res)=>{
    console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
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
    console.log("Beofer deleteing")
    const response = await client.spaceElements.delete({
        where :{
            id : parsedData.data.id
        }
    })
    console.log("after deleting")
    res.json({message  : "element deleted successfully"})
})

spaceRouter.post("/", userMiddleware, async (req, res) => {
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
    
    const map = await client.map.findFirst({
        where: {
            id: parsedData.data.mapId
        }, select: {
            mapElements: true,
            width: true,
            height: true
        }
    })
    console.log("after")
    if (!map) {
        res.status(400).json({message: "Map not found"})
        return
    }
    console.log("map.mapElements.length")
    console.log(map.mapElements.length)
    let space = await client.$transaction(async () => {
        const space = await client.space.create({
            data: {
                name: parsedData.data.name,
                width: map.width,
                height: map.height,
                creatorId: req.userId!,
            }
        });

        await client.spaceElements.createMany({
            data: map.mapElements.map(e => ({
                spaceId: space.id,
                elementId: e.elementId,
                x: e.x!,
                y: e.y!
            }))
        })

        return space;

    })
    console.log("space crated")
    res.json({id: space.id})
})

spaceRouter.delete('/:spaceId', userMiddleware, async (req, res) => {
    console.log("Inside space delete");
    console.log("Param id for deleting", req.params.spaceId);
  
    const space = await client.space.findUnique({
      where: {
        id: req.params.spaceId, // Correct parameter name
      },
      select: {
        creatorId: true,
      },
    });
  
    if (!space) {
      res.status(400).json({ message: "Space not found" });
      return;
    }
  
    if (space.creatorId !== req.userId) {
      res.status(403).json({ message: "Unauthorized user" });
      return;
    }
  
    await client.space.delete({
      where: {
        id: req.params.spaceId, // Correct parameter name
      },
    });
  
    res.status(200).json({ message: "Space deleted successfully" });
  });
  

spaceRouter.get('/all',userMiddleware, async (req,res)=>{
    console.log("inside getting their spaces")
    const spaces = await client.space.findMany({
        where : {
            creatorId : req.userId
        }
    })

    res.json({
        spaces : spaces.map(e =>({
            id : e.id,
            name : e.name,
            thumbnail : e.thumbnail,
            dimenstion : `${e.width}x${e.height}`
        }))
    })
    return; 
})

spaceRouter.get('/:spaceId',userMiddleware,async (req,res)=>{
    console.log("inside getting all the elements from the spaceId query params")
    const spaceId = req.params.spaceId;
    console.log("the spaceID is inside the gettin endpt  ", spaceId)
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
        dimensions : `${space.width}x${space.height}`,
        elements : space.elements.map(e => ({
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

