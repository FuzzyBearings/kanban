var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	var db = req.db;
	var boards = db.get('boards');
	boards.find({}, { sort: { "sortOrder" : 1, "name" : 1 }}, function(e, docs) {
		res.render('boards/list', {
			"boards" : docs
		});
	});
});

router.post('/update', function(req, res) {
	var db = req.db;
	
	var boardName = req.body.boardName;
	var boardId = req.body.boardId;
	var boards = db.get('boards');
	var sortOrder = boards.length;
	if (boardId.length > 1 && boardName.length > 0) {
		boards.findAndModify({
			"query" : { "_id" : boardId },
			"update" : { "name" : boardName, "sortOrder" : sortOrder },
			"new" : true,		// no workie?
			"upsert" : false	// no workie?
		}, function(err, oldBoard) {
			boards.findById(boardId, {}, function(e, board) {
				if (board) {
					var columns = db.get('columns');
					columns.find({ "boardId" : boardId }, { sort : { "sortOrder" : 1 }}, function(e, columns) {
						res.render('boards/view', { "board" : board, "columns" : columns });
					});
				}
				else {
					res.redirect('/w/boards');
				}
			});
		});
	}
	else {
		boards.insert({ "name" : boardName }, function(err, board) {
			if (err) {
				res.send("There was a problem adding that board to the database.");
			}
			else {
				res.render('boards/view', { "board": board });
			}
		});
	}
});

router.get('/:boardId', function(req, res, next) {
	var db = req.db;
	var boards = db.get('boards');
	var boardId = req.params.boardId;
	var action = req.query.action;

	if (boardId === "0") {
		res.render('boards/edit', {});
		return;
	}
	
	if (action === "delete") {
		boards.remove({ "_id" : boardId }, function(err) {
			res.redirect('/w/boards');
		});
		return;
	}

	var page = 'boards/view';
	if (action == "edit") {
		page = 'boards/edit';
	}
	
	boards.findById(boardId, {}, function(e, board) {
		var columns = db.get('columns');
		if (board) {
			columns.find({ "boardId" : boardId }, { sort : { "sortOrder" : 1 }}, function(e, columns) {
				res.render(page, { "board" : board, "columns" : columns });
			});
		}
	});	
});

module.exports = router;

// router.get('/:boardId', function(req, res, next) {
// 	var db = req.db;
// 	var boardId = req.params.boardId;
// 	var collection = db.get('boards');
// 	collection.find({ "_id" : boardId }, {}, function(e, docs) {
// 		if (docs.length == 1) {
// 			res.render('boards/board', {
// 				"board" : docs[0]
// 			});
// 		}
// 		else {
// 			// TODO: no board found!
// 			res.render('boards/board', { });
// 		}
// 	});
// });

// else {
// 	res.redirect('/w/boards/');
	
// 	boards.update({ "_id" : boardId }, { "name", boardName });
// 	boards.findById(boardId, {}, function(e, board) {
// 		if (board) {
// 			var page = 'boards/board';
// 			if (req.query.action === "edit") {
// 				page = 'boards/edit';
// 			}
// 			res.render(page, {
// 				"board" : board
// 			});
// 		}
// 		else {
// 			// TODO: no board found! Render a different page!
// 			res.render('boards/board', {});
// 		}
// 	});
// }
// else {
// 	console.log("inserting new!")
// 	boards.insert({ "name" : boardName }, function(err, doc) {
// 		if (err) {
// 			res.send("There was a problem adding that board to the database.");
// 		}
// 		else {
// 			res.redirect('/w/boards/');
// 		}
// 	});	