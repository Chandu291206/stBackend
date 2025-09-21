import mongoose from 'mongoose';

const apif=new mongoose.Schema({}, { strict: false })

const apip=mongoose.model("Player",apif)

export default apip;