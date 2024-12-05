//zod validation
import z from "zod"


export const SignupSchema = z.object({
    username : z.string(),
    password : z.string(),
    role : z.enum(['admin','user'])
})

export const SigninSchema = z.object({
    username : z.string(),
    password : z.string(),
})

export const UpdatemetadataSchema = z.object({
    avatarId : z.string()
})

export const CreateSpaceSchema = z.object({
    name : z.string(),
    dimensions : z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
    mapId : z.string()
})

export const AddElementSchema = z.object({
    elementId : z.string(),
    spaveId : z.string(),
    x : z.number(),
    y : z.number()
})

export const DeleteElementSchema = z.object({
    id : z.number()
})

export const CreateElementSchema = z.object({
    imageUrl: z.string(),
    width : z.string(),
    height : z.string(),
    static : z.boolean()
})

export const UpdateElementSchema = z.object({
    imageUrl: z.string(),
})

export const CreateAvatarSchema = z.object({
    name: z.string(),
    imageUrl: z.string(),
})

export const CreateMapSchema = z.object({
    thumbnail: z.string(),
    dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
    name : z.string(),
    defaultElements : z.array(z.object({
        elementId : z.string(),
        x : z.number(),
        y : z.number()
    }))
})


