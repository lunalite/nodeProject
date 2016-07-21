var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  userName: {type: String, required: true},
  timeCreated: {type: Date, default: Date.now}
});

var User = mongoose.model('User', UserSchema);

module.exports = User;