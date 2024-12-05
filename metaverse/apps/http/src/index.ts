import express from "express";
import { router } from "./routes";
import client from "@ui/db/client"

const app = express();

app.use('/api/v1',router)


app.listen(process.env.PORT || 3000, ()=>{
    console.log("Server is running on port 3000")
});