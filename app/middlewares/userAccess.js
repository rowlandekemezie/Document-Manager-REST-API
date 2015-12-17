(function() {
 'use strict';

 var Document = require('./../models/document.model'),
  config = require('./../../config/admin');
 module.exports = function(req, res, next) {
  Document.findById(req.params.id, function(err, doc) {
    //console.log(doc);
   if (err) {
    res.status(500).send(err);
   } else {
    if (!doc) {
     res.status(404).json({
      success: false,
      message: 'Document not available'
     });
    } else {

     if (req.decoded._id !== doc.ownerId &&
      req.decoded.role !== config.role && req.decoded.role !== 'Documentarian') {
      res.status(401).json({
       success: false,
       message: 'Not authorized'
      });
     } else {
      next();
     }
    }
   }
  });
 };
})();