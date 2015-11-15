var express = require('express');
var router = express.Router();
var sharedRoutes = require('./sharedRoutes');

router.get('/:docId', function(req, res) {	
	var docId = req.params.docId;
	sharedRoutes.renderDocumentPageCard(req, res, docId);
});

router.post('/update', function(req, res) {
	
	var db = req.db;
	var docName = req.body.name;
	var sortOrder = parseInt(req.body.sortOrder);
	var columnId = req.body.columnId;
	var docId = req.body.cardId;
	var docsTable = db.get('cards');

	if (docId.length > 1) {
		if (docName && docName.length > 0) {
			docsTable.findAndModify({
				"query" : { "_id" : docId },
				"update" : { "name" : docName, "sortOrder" : sortOrder, "columnId" : columnId },
				"new" : true,		// no workie?
				"upsert" : false	// no workie?
			}, function(err, oldDoc) {
				sharedRoutes.renderDocumentPageCard(req, res, docId);
			});			
		}
		else {
			docsTable.remove({ "_id" : docId }, function(err) {
				if (err) {
					res.send("There was a problem removing that document from the database.");					
				}
				else {
					sharedRoutes.renderDocumentPageColumn(req, res, columnId);					
				}
			});			
		}
	}
	else if (docName && docName.length > 0) {
		docsTable.insert({ "name" : docName, "sortOrder" : sortOrder, "columnId" : columnId }, function(err, doc) {
			if (doc) {
				sharedRoutes.renderDocumentPageCard(req, res, doc._id);
			}
			else {
				res.send("There was a problem adding that document to the database.");
			}
		});
	}
	else {
		sharedRoutes.renderDocumentPageColumn(req, res, columnId);					
	}
});

module.exports = router;
