const mongoose = require('mongoose');
const { stringify } = require('uuid');

const postSchema = new mongoose.Schema({
  postText: {
    type: String,
    required: true,
    trim: true,
  },

  image: {
    type: String,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  likes: {
    type: Array,
    default: [],
  },

//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   }
});

module.exports = mongoose.model('Post', postSchema);
