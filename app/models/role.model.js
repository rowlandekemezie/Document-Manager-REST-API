var mongoose = require('mongoose');

var roleSchema = new mongoose.Schema({
 title: {
  type: String,
  required: true,
  validate: {
   validator: function(title) {
    return /[a-zA-Z]/.test(title);
   },
   message: '{VALUE} is not a valid role!'
  }
 }
});

// The mongoose API requires the model name and schema to create the model
module.exports = mongoose.model("Role", roleSchema);
