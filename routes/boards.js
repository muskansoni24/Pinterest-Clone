const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  boardName: { type: String, required: true },
  boardDescription: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: [] }]
});

module.exports = mongoose.model('Board', boardSchema);

