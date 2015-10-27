var express = require('express');
var router = express.Router();
var sharedRoutes = require('./sharedRoutes');

router.get('/:docId', function(req, res) {
	
	var db = req.db;
	
	var docsTable = db.get(docsName);
	var docId = req.params.docId;
	var action = req.query.action;
	
	var page = "";
	if (action === 'delete') {
		// DELETE
		page = docsListPageRedirect;
		docsTable.remove({ "_id" : docId }, function(err) {
			res.redirect(page);
		});
	}
	else {
		if (action === 'edit' || docId === "0") {
			page = docsEditPage;
		}
		else {
			page = docsViewPage;
		}
		renderDocumentPage(db, docId, res, page);
	}

});

router.post('/update', function(req, res) {
	
	var db = req.db;	
	
	var docName = req.body.name;
	var sortOrder = req.body.sortOrder;
	var docId = req.body.familyId;
	var docsTable = db.get('family');

	if (docId.length > 1) {
		// UPDATE
		docsTable.findAndModify({
			"query" : { "_id" : docId },
			"update" : { "name" : docName, "sortOrder" : sortOrder },
			"new" : true,		// no workie?
			"upsert" : false	// no workie?
		}, function(err, oldDoc) {
			sharedRoutes.renderDocumentPageFamily(req, res, docId);
		});
	}
	else {
		// CREATE
		docsTable.insert({ "name" : docName, "sortOrder" : sortOrder }, function(err, doc) {
			if (doc) {
				sharedRoutes.renderDocumentPageFamily(req, res, doc._id);
			}
			else {
				res.send("There was a problem adding that document to the database.");
			}
		});
	}
});

router.get('/', function(req, res) {
	sharedRoutes.renderDocumentPageFamily(req, res, null);
});

function renderDocumentPage(db, docId, res, page) {
	if (docId === "0") {
		res.render(page, { });
	}
	else {
		var docsTable = db.get(docsName);
		docsTable.findById(docId, {}, function(err, doc) {
			console.log("doc: " + doc + ", " + childDocsName);
			if (doc) {
				var childrenTable = db.get(childDocsName);
				childrenTable.find({ "parentId" : docId }, { sort : { "sortOrder" : 1, "name" : 1 }}, function(err2, children) {
					console.log("len: " + children.length);
					if (children) {
						res.render(page, { "remoteDoc" : doc, "remoteChildren" : children });
					}
					else {
						res.send("There was a problem finding that document's children in the database.");							
					}
				});
			}
			else {
				res.send("There was a problem finding that document in the database.");
			}
		});
	}
}

module.exports = router;
