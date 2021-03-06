var expect = require('expect.js');
var request = require('request');

var fixtures = require('./fixtures');

describe('GET plural', function () {
  before(fixtures.vegetable.init);
  beforeEach(fixtures.vegetable.create);
  after(fixtures.vegetable.deinit);

  it('should set etag and Last-Modified ... if possible');

  it("should return 'em all", function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables',
      json: true
    };
    request.get(options, function (err, response, body) {
      if (err) return done(err);
      expect(response).to.have.property('statusCode', 200);
      body.forEach( function(doc, i) {
      	var found = vegetables.some(function (vege) {
      	  return vege._id.toString() === doc._id;
      	});
      	expect(found).to.be(true);
      });
      done();
    });
  });

  it("should return an array even for one document match", function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables?limit=1',
      json: true
    };
    request.get(options, function (err, response, body) {
      if (err) return done(err);
      expect(response).to.have.property('statusCode', 200);
      body.forEach(function(doc, i) {
        var found = vegetables.some(function (vege) {
          return vege._id.toString() === doc._id;
        });
        expect(found).to.be(true);
      });
      done();
    });
  });

  it('should not set Location header', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.headers).not.to.have.property('location');
      done();
    });
  });

  it('should use JSON content type', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.headers).to.have.property('content-type');
      expect(response.headers['content-type']).to.contain('application/json');
      done();
    });
  });
});
