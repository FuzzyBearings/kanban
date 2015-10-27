var express = require('express');
var router = express.Router();
var sharedRoutes = require('./sharedRoutes');

router.get('/:docId', function(req, res) {	
	var docId = req.params.docId;
	sharedRoutes.renderDocumentPageGroup(req, res, docId);
});

router.post('/update', function(req, res) {
	
	var db = req.db;
	var docName = req.body.name;
	var sortOrder = req.body.sortOrder;
	var docId = req.body.groupId;
	var familyId = req.body.familyId;
	var docsTable = db.get('groups');

	if (docId.length > 1) {
		if (docName && docName.length > 0) {
			docsTable.findAndModify({
				"query" : { "_id" : docId },
				"update" : { "name" : docName, "sortOrder" : sortOrder, "familyId" : familyId },
				"new" : true,		// no workie?
				"upsert" : false	// no workie?
			}, function(err, oldDoc) {
				sharedRoutes.renderDocumentPageGroup(req, res, docId);
			});			
		}
		else {
			docsTable.remove({ "_id" : docId }, function(err) {
				if (err) {
					res.send("There was a problem removing that document from the database.");					
				}
				else {
					sharedRoutes.renderDocumentPageGroup(req, res, null);					
				}
			});			
		}
	}
	else {
		docsTable.insert({ "name" : docName, "sortOrder" : sortOrder, "familyId" : familyId }, function(err, doc) {
			if (doc) {
				sharedRoutes.renderDocumentPageGroup(req, res, doc._id);
			}
			else {
				res.send("There was a problem adding that document to the database.");
			}
		});
	}
});

module.exports = router;
