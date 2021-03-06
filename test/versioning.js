var expect = require('expect.js');
var express = require('express');
var request = require('request');
var baucis = require('..');

var fixtures = require('./fixtures');

describe('Versioning', function () {
  before(fixtures.versioning.init);
  beforeEach(baucis.empty.bind(baucis));
  after(fixtures.versioning.deinit);

  it('should use the highest release if no request version is specified', function (done) {
    var options = {
      url: 'http://localhost:8012/api/versioned/parties',
      json: true
    };
    request.get(options, function (err, response, body) {
      if (err) return done(err);
      expect(response.headers).to.have.property('api-version', '3.0.1');
      done();
    });
  });

  it('should cause an error when an invalid release is specified', function (done) {
    var fn = baucis.bind(baucis, { releases: [ '1.0.0', 'abc', '2.0.1' ] });
    expect(fn).to.throwException(/^Invalid semver API release version.$/);
    done();
  });

  it('should use the highest valid release in the requested version range', function (done) {
    var options = {
      url: 'http://localhost:8012/api/versioned/parties',
      json: true,
      headers: { 'API-Version': '<3' }
    };
    request.get(options, function (err, response, body) {
      if (err) return done(err);
      expect(response.headers).to.have.property('api-version', '2.1.0');
      done();
    });
  });

  it('should use the requested release if specific version is given', function (done) {
    var options = {
      url: 'http://localhost:8012/api/versioned/parties',
      json: true,
      headers: { 'API-Version': '1.0.0' }
    };
    request.get(options, function (err, response, body) {
      if (err) return done(err);
      expect(response.headers).to.have.property('api-version', '1.0.0');
      done();
    });
  });

  it("should 404 if the requested release range can't be satisfied", function (done) {
    var options = {
      url: 'http://localhost:8012/api/versioned/parties',
      json: true,
      headers: { 'API-Version': '>3.0.1' }
    };
    request.get(options, function (err, response, body) {
      if (err) return done(err);
      expect(response.headers).not.to.have.property('api-version');
      done();
    });
  });

  it('should catch controllers that are added twice to overlapping API dependencies', function (done) {
    baucis.rest({ singular: 'party', versions: '>0.0.0' });
    baucis.rest({ singular: 'party', versions: '<2' });
    expect(baucis.bind(baucis)).to.throwException(/^Controller "parties" exists more than once in a release.$/);
    done();
  });

  it('should catch controllers that are added twice to the same release', function (done) {
    baucis.rest({ singular: 'party', versions: '0.0.1' });
    baucis.rest({ singular: 'party', versions: '0.0.1' });
    expect(baucis.bind(baucis)).to.throwException(/^Controller "parties" exists more than once in a release.$/);
    done();
  });

  it('should catch controllers with invalid version range', function (done) {
    var fn = baucis.rest.bind(baucis, { singular: 'party', versions: 'abc' });
    expect(fn).to.throwException(/^Controller version range was not a valid semver range.$/);
    done();
  });

  it('should cause an error whne a release has no controllers', function (done) {
    baucis.rest({ singular: 'party', versions: '1.5.7' });
    var fn = baucis.bind(baucis, { releases: [ '0.0.1', '1.5.7' ]});
    expect(fn).to.throwException(/^There are no controllers in release "0.0.1".$/);
    done();
  });

  it("should catch controllers where the API version range doesn't satisfy any releases", function (done) {
    baucis.rest({ singular: 'party', versions: '0.0.1' });
    baucis.rest({ singular: 'party', versions: '1.4.6' });
    expect(baucis.bind(baucis)).to.throwException(/^The controller version range "1.4.6" doesn't satisfy any API release.$/);
    done();
  });

  it('should work seamlessly when no versioning info is supplied', function (done) {
    var options = {
      url: 'http://localhost:8012/api/unversioned/dungeons',
      json: true
    };
    request.get(options, function (err, response, body) {
      if (err) return done(err);
      expect(response.headers).to.have.property('api-version', '0.0.1');
      done();
    });
  });

  it('should set the `Vary` header', function (done) {
    var options = {
      url: 'http://localhost:8012/api/unversioned/dungeons',
      json: true
    };
    request.get(options, function (err, response, body) {
      if (err) return done(err);
      expect(response.headers).to.have.property('vary', 'API-Version, Accept');
      done();
    });
  });


  it('should send "409 Conflict" if there is a version conflict', function (done) {
    var options = {
      url: 'http://localhost:8012/api/versioned/liens',
      json: true,
      body: { title: 'Franklin' }
    };
    request.post(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(201);

      var options = {
        url: 'http://localhost:8012/api/versioned/liens/' + body._id,
        json: true,
        body: { title: 'Ranken', __v: 0 }
      };

      request.put(options, function (error, response, body) {
        if (error) return done(error);

        expect(response.statusCode).to.be(200);

        request.put(options, function (error, response, body) {
          if (error) return done(error);
          expect(response.statusCode).to.be(409);
          done();
        });
      });
    });
  });

  it('should send "409 Conflict" if there is a version conflict (greater than)', function (done) {
    var options = {
      url: 'http://localhost:8012/api/versioned/liens',
      json: true,
      body: { title: 'Smithton' }
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);

      var options = {
        url: 'http://localhost:8012/api/versioned/liens/' + body[1]._id,
        json: true,
        body: { __v: body[1].__v + 10 }
      };
      request.put(options, function (error, response, body) {
        if (error) return done(error);
        expect(response.statusCode).to.be(409);
        done();
      });
    });
  });

  it('should not send "409 Conflict" if there is no version conflict (equal)', function (done) {
    var options = {
      url: 'http://localhost:8012/api/versioned/liens',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);

      var options = {
        url: 'http://localhost:8012/api/versioned/liens/' + body[1]._id,
        json: true,
        body: { __v: body[1].__v }
      };
      request.put(options, function (error, response, body) {
        if (error) return done(error);
        expect(response.statusCode).to.be(200);
        done();
      });
    });
  });

  it('should cause an error if locking is enabled and no version is selected on the doc', function (done) {
    var options = {
      url: 'http://localhost:8012/api/versioned/liens',
      json: true,
      body: { title: 'Forest Expansion' }
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);

      var options = {
        url: 'http://localhost:8012/api/versioned/liens/' + body[0]._id,
        json: true
      };
      request.put(options, function (error, response, body) {
        if (error) return done(error);
        expect(response.statusCode).to.be(400);
        done();
      });
    });
  });

});
