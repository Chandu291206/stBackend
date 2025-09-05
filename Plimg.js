import express from 'express';
import mongoose from 'mongoose';
import axios from 'axios';
import cors from 'cors'
import path from 'path';
import { fileURLToPath } from 'url';

import Lform from './users.js';
import apip from './players.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const Ex=express();
const API_T="Mn28ppN9EcbjtF0l2d5pzHOPnuif0MnZnvjoEv1ZY7KGOWmCQAc1iCRjgoWV";

Ex.use(express.json());
Ex.use(express.urlencoded({ extended: true }));
Ex.use(express.static(path.join(__dirname, 'public')));

mongoose.connect("mongodb://127.0.0.1:27017/Info");

Ex.use(cors({
  origin: 'http://localhost:5173',  
  methods: ['GET', 'POST'],
  credentials: true
}));


Ex.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

Ex.post("/login",async (req,res)=>{
    try{
        const {userl,password}=req.body;
        console.log({userl,password});
        
        const user=await Lform.findOne({$or:[{usermail:userl,password},{username:userl,password}]});
        
        if(user) {
            res.sendFile(path.join(__dirname, 'public','login.html'));
            }
        
        else{res.status(404).json({ message: "User not found" });} 
    }
    catch(error){
    console.error("Something went wrong", error.message);
    res.status(500).json({ error: "Failed to fetch player data" });
}

    
})

Ex.post('/register',async (req,res)=>{
    try{

        const {username,phno,usermail,password}=req.body;
        const fUser=await Lform.create({
            username,   
            phno,
            usermail,
            password,
        });
        console.log(fUser);
        res.status(201).json({ 
            message: "User registered successfully", 
        });
    }
    catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: "User with this email or username already exists" 
            });
        }
        console.error(error);
    }
})

Ex.get("/api",async (req,res)=>{
    try{
                const reply=await axios.get(`https://api.sportmonks.com/v3/football/players?api_token=${API_T}`);
                const players=reply.data.data;
                console.log(players);
                console.log("Data fetched and stored locally");
                
                await apip.deleteMany({});
                await apip.insertMany(players, { ordered: false });
              }

            catch(error){
                console.error("Something went wrong",error);
            }
})


Ex.get('/api/datap', async (req, res) => {
  try {
    const data = await apip.find({});
    res.json(data);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch data' });
  }
});

Ex.listen(5501,()=>{
    console.log("Running in port 5501");
    
})