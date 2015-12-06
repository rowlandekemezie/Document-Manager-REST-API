var mongoose = require('mongoose');

var roleSchema = new mongoose.Schema({
  // _id: {
  //   type: Number
  // },

  title: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /[a-zA-Z]/.test(v);
      },
      message: '{VALUE} is not a valid role!'
    },
   set: toLower
  }
});

//setter method to make all characters lowercase to avoid duplicate title
function toLower(v){
  return v.toLowerCase();
}

// setter method to make all characters lowercase to avoid duplicate title
// TODO: make title lowercase before persisting to the database;

roleSchema.pre('create', function(next) {
  var role = this;
  return role.title.toLowerCase();
});

function toLower(title) {
  return title.toLowerCase();
}

// The mongoose API requires the model name and schema to create the model
module.exports = mongoose.model("Role", roleSchema);
