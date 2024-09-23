const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Product Schema
const PosterSchema = new Schema({
  video: {
    type: String,
    required: true
  },
  title: {
    type:String, 
    required: true
  }
}, {
  timestamps: true // Automatically manage createdAt and updatedAt fields
});

// Create and export the Product model
const Poster = mongoose.model('Poster', PosterSchema);

module.exports = Poster;