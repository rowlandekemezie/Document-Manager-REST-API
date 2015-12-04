var model = require('./../models');

exports.createRole = function(req, res) {
 model.Role.create(req.body, function(err, role) {
  if (err) {
   res.send(err);
  } else if (!role) {
   res.status(403).json({
    succes: false,
    message: 'Please provide role'
   });
  } else {
   res.status(200).json({
    success: true,
    message: 'role created'
   });
  }
 });
};
