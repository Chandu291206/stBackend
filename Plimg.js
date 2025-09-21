import express from 'express';
import mongoose from 'mongoose';
import axios from 'axios';
import cors from 'cors'
import path from 'path';
import { fileURLToPath } from 'url';

import Lform from './users.js';
import apip from './players.js';
import inplayer from './Offplayer.js';
import Cart from './cart.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const Ex=express();
const API_T="Mn28ppN9EcbjtF0l2d5pzHOPnuif0MnZnvjoEv1ZY7KGOWmCQAc1iCRjgoWV";

Ex.use(express.json());
Ex.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb://127.0.0.1:27017/Info");

Ex.use(cors({
  origin: 'http://localhost:5173',  
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
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
    else if (role === "Scout") path = "/Sprofile";
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

// Update player details
Ex.put('/api/datao/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const updateData = req.body;
    
    const updatedPlayer = await inplayer.findByIdAndUpdate(
      playerId,
      updateData,
      { new: true }
    );
    
    if (!updatedPlayer) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    res.json(updatedPlayer);
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({ error: 'Failed to update player details' });
  }
});

// List all registered users (usernames)
Ex.get('/users', async (req, res) => {
  try {
    const users = await Lform.find({}, { username: 1, role: 1, usermail: 1, phno: 1, path: 1, _id: 0 }).lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user details
Ex.put('/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { usermail, phno } = req.body;
    
    console.log('Update request received for username:', username);
    console.log('Request body:', { usermail, phno });
    
    // Validate required fields
    if (!usermail || !phno) {
      console.log('Validation failed: missing required fields');
      return res.status(400).json({ error: 'Email and phone number are required' });
    }
    
    // Update user details
    console.log('Attempting to update user in database...');
    const updatedUser = await Lform.findOneAndUpdate(
      { username },
      { usermail, phno },
      { new: true, select: 'username role usermail phno path' }
    );
    
    console.log('Database update result:', updatedUser);
    
    if (!updatedUser) {
      console.log('User not found in database');
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User updated successfully:', updatedUser);
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ error: 'Failed to update user details' });
  }
});

// Market endpoints for managing players in the market

// Get all players in the market
Ex.get('/market/players', async (req, res) => {
  try {
    const marketPlayers = await apip.find({ inMarket: true }).lean();
    console.log('Fetched market players:', marketPlayers.length);
    res.json(marketPlayers);
  } catch (error) {
    console.error('Error fetching market players:', error);
    res.status(500).json({ error: 'Failed to fetch market players' });
  }
});

// Clear all players from database (for testing)
Ex.delete('/market/players/clear', async (req, res) => {
  try {
    await apip.deleteMany({});
    console.log('All players cleared from database');
    res.json({ message: 'All players cleared successfully' });
  } catch (error) {
    console.error('Error clearing players:', error);
    res.status(500).json({ error: 'Failed to clear players' });
  }
});

// Get all players (including those not in market) - for debugging
Ex.get('/market/players/all', async (req, res) => {
  try {
    const allPlayers = await apip.find({}).lean();
    console.log('Fetched all players:', allPlayers.length);
    res.json(allPlayers);
  } catch (error) {
    console.error('Error fetching all players:', error);
    res.status(500).json({ error: 'Failed to fetch all players' });
  }
});

// Add player to market
Ex.post('/market/players', async (req, res) => {
  try {
    const playerData = req.body;
    console.log('Received player data:', playerData);
    
    // Check if player already exists in market (only check by username and inMarket status)
    const existingPlayer = await apip.findOne({ 
      $and: [
        {
          $or: [
            { common_name: playerData.username },
            { display_name: playerData.username },
            { username: playerData.username }
          ]
        },
        { inMarket: true }
      ]
    });
    
    console.log('Existing player in market found:', existingPlayer);
    
    if (existingPlayer) {
      // Player already in market, return existing player
      console.log('Player already in market:', existingPlayer);
      res.json(existingPlayer);
    } else {
      // Check if player exists but not in market
      const playerExists = await apip.findOne({ 
        $or: [
          { common_name: playerData.username },
          { display_name: playerData.username },
          { username: playerData.username }
        ]
      });
      
      if (playerExists) {
        // Update existing player to be in market
        const updatedPlayer = await apip.findOneAndUpdate(
          { _id: playerExists._id },
          { 
            ...playerData,
            inMarket: true,
            common_name: playerData.username,
            display_name: playerData.username,
            team_name: playerData.teamname,
            position: playerData.position,
            country_name: playerData.country,
            current_age: parseInt(playerData.age) || 0,
            image_path: playerData.image,
            height_cm: playerData.height,
            weight_kg: playerData.weight,
            preferred_foot: playerData.foot,
            shirt_number: playerData.jersey
          },
          { new: true }
        );
        console.log('Updated existing player to market:', updatedPlayer);
        res.json(updatedPlayer);
      } else {
        // Create new player in market
        const newPlayer = new apip({
          ...playerData,
          inMarket: true,
          common_name: playerData.username,
          display_name: playerData.username,
          team_name: playerData.teamname,
          position: playerData.position,
          country_name: playerData.country,
          current_age: parseInt(playerData.age) || 0,
          image_path: playerData.image,
          height_cm: playerData.height,
          weight_kg: playerData.weight,
          preferred_foot: playerData.foot,
          shirt_number: playerData.jersey
        });
        
        console.log('Creating new player:', newPlayer);
        await newPlayer.save();
        console.log('New player saved:', newPlayer);
        res.json(newPlayer);
      }
    }
  } catch (error) {
    console.error('Error adding player to market:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Failed to add player to market', details: error.message });
  }
});

// Remove player from market
Ex.delete('/market/players/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    console.log('Attempting to remove player with ID:', playerId);
    
    const updatedPlayer = await apip.findOneAndUpdate(
      { _id: playerId },
      { inMarket: false },
      { new: true }
    );
    
    console.log('Updated player result:', updatedPlayer);
    
    if (!updatedPlayer) {
      console.log('Player not found with ID:', playerId);
      return res.status(404).json({ error: 'Player not found' });
    }
    
    res.json({ message: 'Player removed from market', player: updatedPlayer });
  } catch (error) {
    console.error('Error removing player from market:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Failed to remove player from market', details: error.message });
  }
});

// Cart endpoints for Scout accounts

// Get cart for a specific scout
Ex.get('/cart/:scoutId', async (req, res) => {
  try {
    const { scoutId } = req.params;
    const cart = await Cart.findOne({ scoutId });
    
    if (!cart) {
      return res.json({ scoutId, players: [] });
    }
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add player to scout's cart
Ex.post('/cart/:scoutId/add', async (req, res) => {
  try {
    const { scoutId } = req.params;
    const playerData = req.body;
    
    // Check if player already exists in cart
    const existingCart = await Cart.findOne({ scoutId });
    
    if (existingCart) {
      // Check if player already exists
      const playerExists = existingCart.players.some(
        player => player.playerId === playerData.playerId || 
                 player.name === playerData.name
      );
      
      if (playerExists) {
        return res.status(400).json({ error: 'Player already in cart' });
      }
      
      // Add player to existing cart
      existingCart.players.push({
        ...playerData,
        addedAt: new Date()
      });
      
      await existingCart.save();
      res.json(existingCart);
    } else {
      // Create new cart
      const newCart = new Cart({
        scoutId,
        players: [{
          ...playerData,
          addedAt: new Date()
        }]
      });
      
      await newCart.save();
      res.json(newCart);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to add player to cart' });
  }
});

// Remove player from scout's cart
Ex.delete('/cart/:scoutId/remove/:playerId', async (req, res) => {
  try {
    const { scoutId, playerId } = req.params;
    
    const cart = await Cart.findOne({ scoutId });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    cart.players = cart.players.filter(player => 
      player.playerId !== playerId && player.name !== playerId
    );
    
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove player from cart' });
  }
});

// Clear entire cart for a scout
Ex.delete('/cart/:scoutId/clear', async (req, res) => {
  try {
    const { scoutId } = req.params;
    
    const cart = await Cart.findOne({ scoutId });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    cart.players = [];
    await cart.save();
    
    res.json({ message: 'Cart cleared successfully', cart });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// Update entire cart for a scout (replace all players)
Ex.put('/cart/:scoutId', async (req, res) => {
  try {
    const { scoutId } = req.params;
    const { players } = req.body;
    
    const cart = await Cart.findOneAndUpdate(
      { scoutId },
      { 
        players: players.map(player => ({
          ...player,
          addedAt: player.addedAt || new Date()
        }))
      },
      { upsert: true, new: true }
    );
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

Ex.listen(5501,()=>{
    console.log("Running in port 5501");
    
})