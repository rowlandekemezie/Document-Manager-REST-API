var model = require('./../models');
var config = require('./../config/admin');

/**
 * [createRole method]
 * @param  {[http request]} req [request body]
 * @param  {[http response]} res [response on request]
 * @return {[status]}     [response]
 */
exports.createRole = function(req, res) {
  var adminRole = req.body;
  if (req.body.title) {
    model.Role.findOne({
      title: adminRole.title
    }, function(err, roles) {
      if (roles) {
        res.status(401).json({
          success: false,
          message: 'Role already exist'
        });
      } else {
        model.Role.create({
          title: adminRole.title
        }, function(err, success) {
          if (err) {
            res.send(err);
          } else {
            res.status(200).json({
              success: true,
              message: 'Role successfuly created'
            });
          }
        });
      }
    });
  } else {
    res.status(403).json({
      success: false,
      message: 'Please, provide role to continue'
    });
  }
};

/**
 * [getAllRoles method]
 * @param  {[http request]} req [http request on the Roles Model]
 * @param  {[http response]} res [response on request]
 * @return {[JSON]}     [result of the search]
 */
exports.getAllRoles = function(req, res){
  model.Role.find({})
  .exec(function(err, roles){
    if(err){
      res.send(err);
    }else{
      res.json(roles);
    }
  });
};

/**
 * [updateRole method]
 * @param  {[http request]} req [takes the userId paramter to be updated]
 * @param  {[http response]} res [response on request]
 * @return {[status]}     [response]
 */
exports.updateRole = function(req, res){
  model.Role.findByIdAndUpdate(req.params.id, req.body, function(err, success){
    if(err){
      res.send(err);
    }else{
      res.status(200).json({
        success: true,
        message: 'Successfully updated'
      });
    }
  });
};

/**
 * [deleteRole method]
 * @param  {[http request]} req [takes userId as parameter]
 * @param  {[http response]} res [response on the request]
 * @return {[status]}     [response]
 */
exports.deleteRole = function (req, res){
  model.Role.findByIdAndRemove(req.params.id, function(err, success){
    if(err){
      res.send(err);
    }else{
      res.status(200).json({
        success: true,
        message:'Successfully deleted'
      });
    }
  });
};

/**
 * [verifyAdmin Middleware to protect SuperAdmin route(Authorization)]
 * @param  {[http request]}   req  [takes the userName of the the request params]
 * @param  {[http response]}   res  [response to user based on outcome of request]
 * @param  {control tranfer} next [tranfer control to the next middleware in the stack]
 * @return {[access privilege]}        [response]
 */
exports.verifyAdmin = function(req, res, next){
   if(req.params.userName !== config.admin){
    res.status(401).json({
        success: false,
        message: 'Access denied'
      });
   } else{
      next();
    }
};