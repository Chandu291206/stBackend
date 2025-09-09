import express from 'express';
import mongoose from 'mongoose';
import axios from 'axios';
import cors from 'cors'
import path from 'path';
import { fileURLToPath } from 'url';

import Lform from './users.js';
import apip from './players.js';
import inplayer from './Offplayer.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const Ex=express();
const API_T="Mn28ppN9EcbjtF0l2d5pzHOPnuif0MnZnvjoEv1ZY7KGOWmCQAc1iCRjgoWV";

Ex.use(express.json());
Ex.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb://127.0.0.1:27017/Info");

Ex.use(cors({
  origin: 'http://localhost:5173',  
  methods: ['GET', 'POST'],
  credentials: true
}));


Ex.get("/",(req,res)=>{
   console.log("welcome");
})

Ex.post("/login", async (req, res) => {
  try {
    const { userl, lpass } = req.body;
    const user = await Lform.findOne({
      $or: [{ usermail: userl }, { username: userl }],
      password: lpass,
    });
    if (user) {
      res.status(200).json({
        message: 'Login successful',
        role: user.role,
        path: user.path
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch player data" });
  }
});


Ex.post('/register', async (req, res) => {
  try {
    const { username, phno, usermail, password, role } = req.body;
    // Decide path after registration
    let path = "/";
    if (role === "Player") path = "/Player";
    else if (role === "Scout") path = "/Scoutmar";
    else if (role === "Agent") path = "/Agent";

    const newUser = await Lform.create({ username, phno, usermail, password, role, path });
    res.status(201).json({
      message: "User registered successfully",
      role,
      path
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "User with this email or username already exists" });
    }
    console.error(error);
    res.status(500).json({ error: "Registration error" });
  }
});


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

Ex.post("/Offplayers",async (req,res)=>{
    try{
        const {playerName,teamName,position,country,jerseyNumber,age,height,weight,preferredFoot,profileImageUrl}=req.body;
        const oplayer=await inplayer.create({
            username:playerName,   
            teamname:teamName,
            position:position,
            country:country,
            jersey:jerseyNumber,
            image:profileImageUrl,
            age:age,
            height:height,
            weight:weight,
            foot:preferredFoot
        });
        console.log(oplayer);
        res.status(201).json({ 
            message: "Player registered successfully", 
        });
    }
    catch (error) {
                if (error.code === 11000) {
                    return res.status(400).json({ 
                        message: "Player with this jersey number already exists" 
                    });
                }
                console.error(error);
            }
        })

Ex.get('/api/datao', async (req, res) => {
  try {
    const odata = await inplayer.find({});
    res.json(odata);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch data' });
  }
});

Ex.listen(5501,()=>{
    console.log("Running in port 5501");
    
})