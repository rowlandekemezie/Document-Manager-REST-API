var models = require('./../models');

var User = models.User;
var Role = models.Role;
var Document = models.Document;

module.exports = {

 // method to create document
createDocument : function(req, res){
 Role.findOne({title: res.body.role}, function(err, role){
  if(err){
   res.send(err);
  }else {
   if(!role){
    res.json({
     succes: false,
     message: 'invalid role'
    });
   }else if(role){
    User.findOne({})
   }
  }
 })
};

};
