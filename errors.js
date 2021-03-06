// __Dependencies__
var deco = require('deco');

// __Private Module Members__
var setMessage = function (message) { this.message = message || '' };

// __Module Definition__
var errors = module.exports = {
  Configuration: deco(setMessage),
  Deprecated: deco(setMessage),
  BadRequest: deco(setMessage),
  Forbidden: deco(setMessage),
  MethodNotAllowed: deco(setMessage),
  ValidationError: deco(setMessage),
  UnsupportedMediaType: deco(function (message) {
    this.message = message || 'Could not parse that content type.';
  }),
  NotFound: deco(function (message) {
    this.message = message || 'No documents matched that query.';
  }),
  LockConflict: deco(function (message) {
    this.message = message || 'The version of the document to update did not match.';
  })
};

Object.keys(errors).forEach(function (name) {
  var BaucisError = errors[name];
  errors[name].inherit(Error);
  errors[name].container(errors);
});
