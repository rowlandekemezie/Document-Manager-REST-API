var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Role = require('./role.model');
var Schema = mongoose.Schema;

var userSchema = new mongoose.Schema({

  userName: String,
  name: {
    firstName: String,

    lastName: String
  },

  role: {
    type: String,
    ref: 'Role'
  },

  email: String,

  password: {
    type: String,
    required: true,
    minlength: 8
  }

});

// setter method to make email lowercase before saving to the database
function toLower(v) {
  return v.toLowerCase();
}

// Bcrypt middleware on UserSchema
userSchema.pre('save', function(next) {
  var user = this;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

//Password verification
userSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compareSync(candidatePassword, this.password);
};

// The mongoose API requires the model name and schema to create the model
module.exports = mongoose.model("User", userSchema);
