// __Dependencies__
var deco = require('deco');

// __Module Definition__
var middleware = module.exports = deco(__dirname, [
  'initialize',
  'request',
  'query',
  'documents',
  'send'
]);
