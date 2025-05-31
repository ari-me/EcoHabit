const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
    habit: { type: String, required: true },
    description: { type: String, required: true },
    end: { type: String },
    frequency: { type: String },
    date: { type: Date, default: Date.now },
    time: { type: String },
    streak: { type: Number, default: 0 },
    days: {
      one: { type: String, default: null, },
      two: { type: String, default: null, },
      three: { type: String, default: null, },
      four: { type: String, default: null, },
      five: { type: String, default: null, },
      six: { type: String, default: null, },
      seven: { type: String, default: null, },
    },
});
  

module.exports = mongoose.model('Habit', habitSchema);