// __Dependencies__
var errors = require('../../../errors');

// __Module Definition__
var decorator = module.exports = function () {
  this.query('collection', '*', function (request, response, next) {
    var Model = request.baucis.controller.get('model');
    request.baucis.query = Model.find(request.baucis.conditions);
    next();
  });

  this.query('instance', '*', function (request, response, next) {
    var Model = request.baucis.controller.get('model');
    request.baucis.query = Model.findOne(request.baucis.conditions);
    next();
  });
};
