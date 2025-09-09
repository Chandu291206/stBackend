import mongoose from 'mongoose';

const userlogin=new mongoose.Schema({
     username: { type: String, required: true, unique: true },
  phno: { type: String, required: true },
  usermail: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:{ type: String,enum: ["Player", "Scout", "Agent"], required: true},
  path: { type: String }
})

 
    const Lform=mongoose.model("Login",userlogin)
    Lform.init()

export default Lform;
