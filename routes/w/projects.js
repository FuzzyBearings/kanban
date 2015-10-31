var express = require('express');
var router = express.Router();
var sharedRoutes = require('./sharedRoutes');

router.get('/:docId', function(req, res) {	
	var docId = req.params.docId;
	sharedRoutes.renderDocumentPageProject(req, res, docId);
});

router.post('/update', function(req, res) {
	
	var db = req.db;
	var docName = req.body.name;
	var sortOrder = req.body.sortOrder;
	var docId = req.body.projectId;
	var groupId = req.body.groupId;
	var docsTable = db.get('projects');

	if (docId.length > 1) {
		if (docName && docName.length > 0) {
			docsTable.findAndModify({
				"query" : { "_id" : docId },
				"update" : { "name" : docName, "sortOrder" : sortOrder, "groupId" : groupId },
				"new" : true,		// no workie?
				"upsert" : false	// no workie?
			}, function(err, oldDoc) {
				sharedRoutes.renderDocumentPageProject(req, res, docId);
			});			
		}
		else {
			docsTable.remove({ "_id" : docId }, function(err) {
				if (err) {
					res.send("There was a problem removing that document from the database.");					
				}
				else {
					sharedRoutes.renderDocumentPageGroup(req, res, groupId);
				}
			});			
		}
	}
	else if (docName && docName.length > 0) {
		docsTable.insert({ "name" : docName, "sortOrder" : sortOrder, "groupId" : groupId }, function(err, doc) {
			if (doc) {
				sharedRoutes.renderDocumentPageProject(req, res, doc._id);
			}
			else {
				res.send("There was a problem adding that document to the database.");
			}
		});
	}
	else {
		sharedRoutes.renderDocumentPageGroup(req, res, groupId);
	}
});

module.exports = router;
