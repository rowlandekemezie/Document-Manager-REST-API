"use strict";

var config = require('./../../config/admin');
/**
 * [verifyAdmin Middleware to protect roles route(Authorization)]
 * @param  {[http request]}   req  [takes the userName of the the request params]
 * @param  {[http response]}   res  [response to user based on outcome of request]
 * @param  {control tranfer} next [tranfer control to the next middleware in the stack]
 * @return {[access privilege]}        [Json response]
 */
module.exports = function(req, res, next){
   if(req.params.userName !== config.admin){
    res.status(401).json({
        success: false,
        message: 'Access denied'
      });
   } else{
      next();
    }
};