import mongoose from 'mongoose';

// Cart schema for Scout accounts
const cartSchema = new mongoose.Schema({
  scoutId: {
    type: String,
    required: true,
    index: true
  },
  players: [{
    playerId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    common_name: String,
    image_url: String,
    age: String,
    team_name: String,
    position: String,
    country: String,
    height: String,
    weight: String,
    foot: String,
    jersey: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { 
  strict: false,
  timestamps: true 
});

// Index for efficient queries
cartSchema.index( { unique: true });
cartSchema.index({ 'players.playerId': 1 });

// Pre-save middleware to update updatedAt
cartSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
