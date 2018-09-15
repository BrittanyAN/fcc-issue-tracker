/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var mongoose = require('mongoose'); // mongoose added for schema/db manipulation

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});


module.exports = function (app) {

     mongoose.connect(CONNECTION_STRING);
    
    // Setting up DB models
    var Schema = mongoose.Schema;
    var issueSchema = new Schema({
      issue_title: {
        type: String,
        required: true
      },
      issue_text: {
        type: String,
        required: true
      },
      created_on: {
        type: Date,
        required: true
      },
      updated_on: {
        type: Date,
        required: true
      },
      created_by: {
        type: String,
        required: true
      },
      assigned_to: {
        type: String,
        required: false
      },
      open: {
        type: Boolean,
        required: true
      },
      status_text: {
        type: String,
        required: false
      }
    });
    var projectSchema = new Schema({
      projectname: String,
      issues: [issueSchema]
    });
    var Project = mongoose.model('Project', projectSchema);

    // Routes
    app.route('/api/issues/:project')

      .get(function (req, res){
        var project = req.params.project;
      // for given project, return all issues as an array  
        Project.findOne({projectname: project}, function(err, projectFound) {
          if (err || projectFound == [] || projectFound == null) {
            // Case where an error occurs or there are no projects/issues found
            res.send("error: no projects found")
          } else {
            // if query terms are entered, filter results by query, else return all results
            var searchQuery = req.query;
            var searchType = Object.keys(searchQuery);
            var results = [];
            var validResult = true;
            if (searchType.length > 0) {
              for (var i = 0; i < projectFound.issues.length; i++) {
                validResult = true;
                for (var j = 0; j < searchType.length; j++) {
                  if (projectFound.issues[i][searchType[j]] != searchQuery[searchType[j]]) {
                    validResult = false;
                  }
                }
                
                if (validResult) {
                  results.push(projectFound.issues[i]);
                }
                
              }
            } else {
              results = projectFound.issues;
            }
            
            res.json(results);
            
          }
        });

      })

      .post(function (req, res){
        var project = req.params.project;
        // get form data from req.body
        // post issue to given project
        // create new project if project doesn't exist
        Project.findOne({projectname: project}, function(err, projectFound) {
          if (projectFound == null) {
            var newProject = new Project({projectname: project});
            //newProject.issues = [];
            newProject.issues.push({
              //post new issue
              issue_title: req.body.issue_title,
              issue_text: req.body.issue_text,
              created_by: req.body.created_by,
              created_on: new Date(),
              updated_on: new Date(),
              open: true,
              assigned_to: req.body.assigned_to,
              status_text: req.body.status_text
            })
            newProject.save(function(err) {
              if (err) {
                res.send("error: " + err);
              } else {
                res.json(newProject.issues);
              }
            });
          } else {
            projectFound.issues.push({
              // post new issue
              issue_title: req.body.issue_title,
              issue_text: req.body.issue_text,
              created_by: req.body.created_by,
              created_on: new Date(),
              updated_on: new Date(),
              open: true,
              assigned_to: req.body.assigned_to,
              status_text: req.body.status_text
            });
            projectFound.save(function(err) {
              if (err) {
                console.log("error: " + err);
              } else {
                res.json(projectFound.issues);
              }
            });
          }
        });
      })

      .put(function (req, res){
        var project = req.params.project;
        // for given project, update an existing issue's information
        // need id from form and update data from form
        Project.findOne({projectname: project}, function(err, projectFound) {
          var issue = projectFound.issues.id(req.body._id);
          var allowedProps = ["issue_title", "issue_text", "created_by", "assigned_to", "status_text", "open"];
          var i = 0; // counter
          // update params of issue and save projectFound
          for (var prop in req.body) {
            if (allowedProps.indexOf(prop) != -1) {
              issue[prop] = req.body[prop];
              i++;
            }
          }
          // handle no updated fields case
          if (i == 0) {
            res.send("no updated fields sent");
          } else {
            issue.updated_on = new Date();
            projectFound.save(function(err) {
              if (err) { res.send("could not update " + req.body._id); }
              res.send("successfully updated " + req.body._id);
            })
          }
        });
      })

      .delete(function (req, res){
        var project = req.params.project;
        // find an issue for given project by req.body._id and delete it
        Project.findOne({projectname: project}, function(err, projectFound) {
          if (req.body._id == '') {
            res.send("_id error");
          } else {
            projectFound.issues.id(req.body._id).remove();
            projectFound.save(function(err) {
              if (err) {
                res.send("could not delete " + req.body._id);
              } else {
                res.send("deleted " + req.body._id);
              }
            });
          }
        });
      });
    
};
