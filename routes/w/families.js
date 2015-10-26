var express = require('express');
var router = express.Router();

var docsName = 'families';
var docsListPageRedirect = '/w/families';
var docsListPage = 'families/list';
var docsEditPage = 'families/edit';
var docsViewPage = 'families/view';

var childDocsName = 'groups';
var childDocsParentIdName = 'familyId';

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
		presentDocPage(db, docId, res, page);
	}

});

router.post('/update', function(req, res) {
	
	var db = req.db;	
	
	var docName = req.body.name;
	var sortOrder = req.body.sortOrder;
	var docId = req.body.docId;
	var docsTable = db.get(docsName);
	
	var page = docsViewPage;
	
	if (docId.length > 1) {
		// UPDATE
		docsTable.findAndModify({
			"query" : { "_id" : docId },
			"update" : { "name" : docName, "sortOrder" : sortOrder },
			"new" : true,		// no workie?
			"upsert" : false	// no workie?
		}, function(err, oldDoc) {
			presentDocPage(db, docId, res, docsViewPage);
		});
	}
	else {
		// CREATE
		docsTable.insert({ "name" : docName, "sortOrder" : sortOrder }, function(err, doc) {
			if (doc) {
				res.render(docsViewPage, { "remoteDoc" : doc });				
			}
			else {
				res.send("There was a problem adding that document to the database.");
			}
		});
	}
});

router.get('/', function(req, res) {
	var db = req.db;
	var docsTable = db.get(docsName);
	var page = docsListPage;
	docsTable.find({}, { sort: { "sortOrder" : 1, "name" : 1 }}, function(err, docs) {
		if (docs) {
			res.render(page, { "remoteDocs" : docs });
		}
		else {
			console.log("FATAL ERROR: could not fetch " + docsName + ".");
		}
	});
});

function presentDocPage(db, docId, res, page) {
	if (docId === "0") {
		res.render(page, { });
	}
	else {
		var docsTable = db.get(docsName);
		docsTable.findById(docId, {}, function(err, doc) {
			if (doc) {
				var childrenTable = db.get(childDocsName);
				childrenTable.find({ childDocsParentIdName : docId }, { sort : { "sortOrder" : 1, "name" : 1 }}, function(err2, children) {
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
