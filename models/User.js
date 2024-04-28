const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstname: String,
  lastname: String,
  appointment_id: {
    type: String,
    default: '',
  },
  username: String,
  password: String,
  licence_number: String,
  age: Number,
  userType: String,
  car_details: {
    make: String,
    model: String,
    year: Number,
    plate_number: String,
  },
});

UserSchema.pre('save', async function (next) {
  var salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
const User = mongoose.model('User', UserSchema);

module.exports = User;
// This is a Mongoose-based User schema specification for a MongoDB collection.
// It specifies the format of a User document, together with the user's identification and vehicle information.
// The 'User' model is exported for usage in other areas of the programme.
