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

// var express = require('express');
// var router = express.Router();
//
// var docsName = 'groups';
// var docsListPageRedirect = '/w/groups';
// var docsListPage = 'groups/list';
// var docsEditPage = 'groups/edit';
// var docsViewPage = 'groups/view';
//
// var childDocsName = 'boards';
// var childDocsParentIdName = 'groupId';
//
// var docsParentIdName = "familyId";
// var parentEditor = 'parent/editor';
// var parentEditorRedirect = '/w/families/';
//
// router.get('/:docId', function(req, res) {
//
// 	var db = req.db;
//
// 	var docsTable = db.get(docsName);
// 	var docId = req.params.docId;
// 	var action = req.query.action;
//
// 	var page = "";
// 	if (action === 'delete') {
// 		// DELETE
// 		page = docsListPageRedirect;
// 		docsTable.remove({ "_id" : docId }, function(err) {
// 			res.redirect(page);
// 		});
// 	}
// 	else {
// 		if (action === 'edit' || docId === "0") {
// 			page = docsEditPage;
// 		}
// 		else {
// 			page = docsViewPage;
// 		}
// 		renderDocumentPage(db, docId, res, page);
// 	}
//
// });
//
// router.post('/update', function(req, res) {
//
// 	var db = req.db;
//
// 	var docName = req.body.name;
// 	var sortOrder = req.body.sortOrder;
// 	var docId = req.body.docId;
// 	var parentDocId = req.body.parentDocId;
// 	var docsTable = db.get(docsName);
//
// 	var page = docsViewPage;
//
// 	if (docId.length > 1) {
// 		// UPDATE
// 		docsTable.findAndModify({
// 			"query" : { "_id" : docId },
// 			"update" : { "name" : docName, "sortOrder" : sortOrder, "parentId" : parentDocId },
// 			"new" : true,		// no workie?
// 			"upsert" : false	// no workie?
// 		}, function(err, oldDoc) {
//
// 			if (req.body.sourcePage === parentEditor) {
// 				var url = parentEditorRedirect + parentDocId + "?action=edit";
// 				console.log('URL: ' + url);
// 				res.redirect(url);
// 			}
// 			else {
// 				// renderColumn(db, columnId, res, 'columns/view');
// 			}
//
// 		});
// 	}
// 	else {
// 		// CREATE
// 		docsTable.insert({ "name" : docName, "sortOrder" : sortOrder, "parentId" : parentDocId }, function(err, doc) {
// 			if (doc) {
//
// 				if (req.body.sourcePage === parentEditor) {
// 					var url = parentEditorRedirect + parentDocId + "?action=edit";
// 					console.log('URL: ' + url);
// 					res.redirect(url);
// 				}
// 				else {
// 					// renderColumn(db, columnId, res, 'columns/view');
// 				}
// 			}
// 			else {
// 				res.send("There was a problem adding that document to the database.");
// 			}
// 		});
// 	}
// });
//
// router.get('/', function(req, res) {
// 	var db = req.db;
// 	var docsTable = db.get(docsName);
// 	var page = docsListPage;
// 	docsTable.find({}, { sort: { "sortOrder" : 1, "name" : 1 }}, function(err, docs) {
// 		if (docs) {
// 			res.render(page, { "remoteDocs" : docs });
// 		}
// 		else {
// 			console.log("FATAL ERROR: could not fetch " + docsName + ".");
// 		}
// 	});
// });
//
// function renderDocumentPage(db, docId, res, page) {
// 	if (docId === "0") {
// 		res.render(page, { });
// 	}
// 	else {
// 		var docsTable = db.get(docsName);
// 		docsTable.findById(docId, {}, function(err, doc) {
// 			if (doc) {
// 				var childrenTable = db.get(childDocsName);
// 				childrenTable.find({ childDocsParentIdName : docId }, { sort : { "sortOrder" : 1, "name" : 1 }}, function(err2, children) {
// 					if (children) {
// 						res.render(page, { "remoteDoc" : doc, "remoteChildren" : children });
// 					}
// 					else {
// 						res.send("There was a problem finding that document's children in the database.");
// 					}
// 				});
// 			}
// 			else {
// 				res.send("There was a problem finding that document in the database.");
// 			}
// 		});
// 	}
// }
