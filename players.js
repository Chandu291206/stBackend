import mongoose from 'mongoose';

const apif=new mongoose.Schema({}, { strict: false })
apif.index({ id: 1 }, { unique: true });
const apip=mongoose.model("Player",apif)

export default apip;