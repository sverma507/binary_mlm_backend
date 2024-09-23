const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Product Schema
const ProductSchema = new Schema({
  img1: {
    type: String,
    required: true
  },
  img2: {
    type: String,
    
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  income: {
    type: Number,
    required: true
  },
  cycle: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  supply: {
    type: String,
    required: true
  }
}, {
  timestamps: true // Automatically manage createdAt and updatedAt fields
});

// Create and export the Product model
const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
