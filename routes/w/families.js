var express = require('express');
var router = express.Router();

var docsName = 'families';
var docsListPage = 'families/list';
var docsEditPage = 'families/edit';
var docsViewPage = 'families/view';

router.get('/:docId', function(req, res) {
	
	var db = req.db;
	
	var docsTable = db.get(docsName);
	var docId = req.params.docId;
	var action = req.query.action;
	
	var page = docsEditPage;
	res.render(page, {});

	// if (boardId === "0") {
	// 	res.render('boards/edit', {});
	// 	return;
	// }
	//
	// if (action === "delete") {
	// 	boards.remove({ "_id" : boardId }, function(err) {
	// 		res.redirect('/w/boards');
	// 	});
	// 	return;
	// }
	//
	// var page = 'boards/view';
	// if (action == "edit") {
	// 	page = 'boards/edit';
	// }
	//
	// boards.findById(boardId, {}, function(e, board) {
	// 	var columns = db.get('columns');
	// 	if (board) {
	// 		columns.find({ "boardId" : boardId }, { sort : { "sortOrder" : 1 }}, function(e, columns) {
	// 			res.render(page, { "board" : board, "columns" : columns });
	// 		});
	// 	}
	// });
});

router.post('/update', function(req, res) {
	
	var db = req.db;	
	
	var docName = req.body.name;
	var sortOrder = req.body.sortOrder;
	var docId = req.body.docId;
	var docsTable = db.get(docsName);
	
	if (docId.length > 1) {
		
	// 	boards.findAndModify({
	// 		"query" : { "_id" : boardId },
	// 		"update" : { "name" : boardName, "sortOrder" : sortOrder },
	// 		"new" : true,		// no workie?
	// 		"upsert" : false	// no workie?
	// 	}, function(err, oldBoard) {
	// 		boards.findById(boardId, {}, function(e, board) {
	// 			if (board) {
	// 				var columns = db.get('columns');
	// 				columns.find({ "boardId" : boardId }, { sort : { "sortOrder" : 1 }}, function(e, columns) {
	// 					res.render('boards/view', { "board" : board, "columns" : columns });
	// 				});
	// 			}
	// 			else {
	// 				res.redirect('/w/boards');
	// 			}
	// 		});
	// 	});
	// }
	}
	else {
		console.log("docName: " + docName + ", sortOrder: " + sortOrder);
		docsTable.insert({ "name" : docName, "sortOrder" : sortOrder }, function(err, doc) {
			if (err) {
				res.send("There was a problem adding that document to the database.");
			}
			else {
				res.render(docsViewPage, { "remoteDoc" : doc });
			}
		});
	}
});

router.get('/', function(req, res) {
	var db = req.db;
	var docsTable = db.get(docsName);
	docsTable.find({}, { sort: { "sortOrder" : 1, "name" : 1 }}, function(err, docs) {
		if (docs) {
			for (i in docs) {
				console.log("name: " + docs[i].name + ", " + docs[i].sortOrder);
			}
			res.render(docsListPage, {
				"remoteDocs" : docs
			});
		}
		else {
			console.log("FATAL ERROR: could not fetch " + docsName + ".");
		}
	});
});

module.exports = router;
