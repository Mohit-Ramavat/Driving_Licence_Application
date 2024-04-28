const mongoose = require('mongoose');
const schema = mongoose.Schema;

const appoSchema = new schema({
  date: String,
  time: String,
  isTimeSlotAvailable: {
    type: Boolean,
    default: true,
  },
});

const appointment = mongoose.model('appointment', appoSchema);
module.exports = appointment;
