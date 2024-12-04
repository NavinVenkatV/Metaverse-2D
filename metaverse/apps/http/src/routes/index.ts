import { Router } from "express";

export const router = Router();

router.get("/signin",(req,res)=>{
    res.json({
        message : "signed in"
    })
})

router.get('/signup',(req,res)=>{
    res.json({
        message : "Signed up"
    })
})
