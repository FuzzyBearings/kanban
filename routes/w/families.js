var express = require('express');
var router = express.Router();

var docsName = 'families';
var docsListPage = 'families/list';
var docsEditPage = 'families/edit';

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

router.get('/', function(req, res) {
	var db = req.db;
	var docsTable = db.get(docsName);
	docsTable.find({}, { sort: { "sortOrder" : 1, "name" : 1 }}, function(e, docs) {
		res.render(docsListPage, {
			"docs" : docs
		});
	});
});

module.exports = router;
