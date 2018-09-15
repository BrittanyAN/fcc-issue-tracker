/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          // checks that each field returns correct input. checks that dates exist.
          assert.equal(res.body.issue_title, 'Title', "incorrect title");
          assert.equal(res.body.issue_text, 'text', "incorrect text");
          assert.equal(res.body.created_by, 'Functional Test - Every field filled in', "incorrect creator");
          assert.equal(res.body.assigned_to, 'Chai and Mocha', "incorrect assigned to");
          assert.equal(res.body.status_text, 'In QA', "incorrect status text");
          assert.exists(res.body.created_on, "created on does not exist");
          assert.exists(res.body.updated_on, "updated on does not exist");
          assert.equal(res.body.open, true, "open status incorrect");
          var testingId = res.body._id;
          done();
        });
      });
      
      test('Required fields filled in', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Required fields'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Title', "incorrect title");
          assert.equal(res.body.issue_text, 'text', "incorrect text");
          assert.equal(res.body.created_by, 'Functional Test - Required fields', "incorrect creator");
          assert.exists(res.body.created_on, "created on does not exist");
          assert.exists(res.body.updated_on, "updated on does not exist");
          assert.equal(res.body.open, true, "open status incorrect");
          assert.equal(res.body.assigned_to, "", "incorrect assigned to");
          assert.equal(res.body.status_text, "", "incorrect status text");
          done();
        });
      });
      
      test('Missing required fields', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: "Missing Required Fields"
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.include(res.text, 'error: ', "error not given");
          done();
        });
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', function() {
      
      test('No body', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({_id: testingId})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'no updated fields sent');
          done();
        });
      });
      
      test('One field to update', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: testingId,
          issue_text: 'one field to update'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.include(res.text, 'successfully updated');
          done();
        });  
      });
      
      test('Multiple fields to update', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: testingId,
          issue_text: 'multiple fields to update',
          assigned_to: 'tester'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.include(res.text, 'successfully updated');
          done();
        });  
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({open: true})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          assert.equals(res.body[0].open, true);
          done();
        });
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({
          open: true,
          issue_text: "text"
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          assert.equal(res.body[0].open, true);
          assert.equal(res.body[0].issue_text, "text");
          done();
        });
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      
      test('No _id', function(done) {
        chai.request(server)
        .delete('/api/issues/test')
        .send({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.include(res.text, 'error');
          done();
        });  
      });
      
      test('Valid _id', function(done) {
        chai.request(server)
        .delete('/api/issues/test')
        .send({_id: testingId})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.include(res.text, 'deleted');
          done();
        });  
      });
      
    });

});
