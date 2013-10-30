var request = require('superagent');
var expect = require('expect.js');
var assert = require("assert");
var Match = require("../engine/match.js");
var results = require("../testresults/chessengineresults.js");
describe('Chess Engine', function(){
  describe('#createMatch()', function(){
    it('Asserts true if the match is created properly', function(){
      assert.equal(JSON.stringify(Match.toJSONObj(Match.create())),
      	results.newMatch);
    })
  })
});

describe('Chess Engine', function() {
	describe('#getMoves()', function() {
		it('Asserts true if it gets the proper moves', function() {
			assert.equal(JSON.stringify(Match.getMoves(Match.create(), {x:0,y:1})), results.getMoves);
		});
	});
});
