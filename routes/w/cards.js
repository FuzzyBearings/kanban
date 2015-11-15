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
	var docId = req.body.cardId;
	var docsTable = db.get('cards');

	if (docId.length > 1) {
		if (docName && docName.length > 0) {
			docsTable.findById(docId, function(err, card) {
				card.name = docName;				
				docsTable.findAndModify({
					"query" : { "_id" : docId },
					"update" : card,
					"new" : false,		// no workie?
					"upsert" : false	// no workie?
				}, function(err, oldDoc) {
					sharedRoutes.renderDocumentPageCard(req, res, docId);
				});			
			});
		}
		else {
			docsTable.findById(docId, function(err, card) {
				var columnId = card.columnId;
				docsTable.remove({ "_id" : docId }, function(err) {
					if (err) {
						res.send("There was a problem removing that document from the database.");					
					}
					else {
						sharedRoutes.renderDocumentPageColumn(req, res, columnId);					
					}
				});
			});
		}
	}
	else if (docName && docName.length > 0) {
		var columnId = req.body.columnId;
		var sortOrder = 0.0;
		docsTable.find({ "columnId" : columnId }, { sort: { "sortOrder" : -1, "name" : 1 }}, function(err, cards) {
			if (cards && cards.length > 0) {
				for (var i = 0; i < cards.length; ++i) {
					console.log('cards[' + i + '] ' + cards[i].name + ", " + cards[i].sortOrder);
				}
				console.log('have cards!');
				console.log('card name: ' + cards[0].name);
				sortOrder = Number(cards[0].sortOrder) + 1.0;
			}
			docsTable.insert({ "name" : docName, "sortOrder" : sortOrder, "columnId" : columnId }, function(err, doc) {
				if (doc) {
					sharedRoutes.renderDocumentPageCard(req, res, doc._id);
				}
				else {
					res.send("There was a problem adding that document to the database.");
				}
			});
		});
	}
	else {
		sharedRoutes.renderDocumentPageColumn(req, res, columnId);					
	}
});

module.exports = router;
