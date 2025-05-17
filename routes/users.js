const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');
const { stringify } = require('uuid');

mongoose.connect('mongodb://localhost:27017/pinterest-db')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  password: {
    type: String,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  fullname: {
    type: String,
    required: true,
    trim: true,
  },

  dp: {
    type: String, // URL to display picture
    default: '',  // optional
  },

  tagline: {
    type: String
  }, 

  description: {
    type: String
  },

  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  }],

  boards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board'
  }]
}, {
  timestamps: true  // adds createdAt and updatedAt
});

userSchema.plugin(plm);

module.exports = mongoose.model('User', userSchema);
