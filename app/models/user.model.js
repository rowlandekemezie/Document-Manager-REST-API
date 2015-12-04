var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Role = require('./role.model');
var Schema = mongoose.Schema;

var userSchema = new mongoose.Schema({

 userName: {
  type: String,
  required: true,
  unique: true,
  validate: {
   validator: function(userName) {
    return /[a-zA-Z0-9]/.test(userName);
   },
   message: '{VALUE} is not a valid userName!'
  }
 },

 name: {
  firstName: {
   type: String,
   required: true,
   validate: {
    validator: function(firstName) {
     return /[a-zA-Z]/.test(firstName);
    },
    message: '{VALUE} is not a valid firstName!'
   }
  },

  lastName: {
   type: String,
   required: true,
   validate: {
    validator: function(lastName) {
     return /[a-zA-Z]/.test(lastName);
    },
    message: '{VALUE} is not a valid lastName!'
   }
  },

  role: {
   type: mongoose.Schema.Types.ObjectId,
   ref: 'Role',
   required: true,
   validate: {
    validator: function(role) {
     return /[a-zA-Z]/.test(role);
    },
    message: '{VALUE} is not a valid role!'
   }
  },

  email: {
   type: String,
   required: true,
   unique: true,
   validate: {
    validator: function(email) {
     return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
    },
    message: '{VALUE} is not a valid email!'
   }
  },

  password: {
   type: String,
   required: true,
   minlength: 8
  }
 }
});

// // Bcrypt middleware on UserSchema
// userSchema.pre('save', function(next) {
//   var user = this;
//
//   if(!user.isModified('password')) return next();
//
//   bcrypt.genSalt(10, function(err, salt) {
//     if(err) return next(err);
//
//     bcrypt.hash(user.password, salt, function(err, hash) {
//       if(err) return next(err);
//       user.password = hash;
//       next();
//     });
//   });
// });
//
// //Password verification
// userSchema.methods.comparePassword = function(candidatePassword, cb) {
//   bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
//     if(err) return cb(err);
//     cb(null, isMatch);
//   });
// };

// The mongoose API requires the model name and schema to create the model
module.exports = mongoose.model("User", userSchema);
