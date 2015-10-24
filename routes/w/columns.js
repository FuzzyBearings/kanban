var express = require('express');
var router = express.Router();

router.get('/:columnId', function(req, res) {	
	var db = req.db;
	var columnsTable = db.get('columns');
	var columnId = req.params.columnId;
	var action = req.query.action;
	
	if (columnId === "0") {
		res.render('columns/edit', {});
		return;
	}
	
	var boardsTable = db.get('boards');
	columnsTable.findById(columnId, {}, function(e, column) {
		if (column) {
			var boardId = column.boardId;
			var page = 'boards/view';
			if (action === "delete") {
				columnsTable.remove({ "_id" : columnId }, function(err) {
					refreshBoards(db, boardId, res, 'boards/view');
				});
			}
			else {
				page = 'columns/view';
				if (action == "edit") {
					page = 'columns/edit';
				}
				boardsTable.findById(column.boardId, {}, function(err, board) {
					if (err) {
						console.log("*** ERROR: could not find board (id=" + boardId + ") for column.");
						res.redirect('/w/boards');
					}
					else if (board) {
						res.render(page, { "board" : board, "column" : column });
					}
				});				
			}
		}
		else {
			res.redirect('/w/boards');
		}
	});	
});

router.post('/update', function(req, res, next) {
	
	var db = req.db;
	
	// boards
	var boardId = req.body.boardId;
	var columnsTable = db.get('columns');
	
	// column
	columnsTable.find({ "boardId" : boardId }, { sort : { "sortOrder" : 1 }}, function(err, columns) {
	
		var columnName = req.body.columnName;
	
		if (req.body.columnId && req.body.columnId.length > 1) {
			var columnId = req.body.columnId;
			if (req.body.columnName && req.body.columnName.length > 0) {			
				var sortOrder = parseInt(req.body.sortOrder);
				columnsTable.findAndModify({
					"query" : { "_id" : columnId },
					"update" : { "boardId" : boardId, "name" : columnName, "sortOrder" : sortOrder },
					"new" : true,		// no workie?
					"upsert" : false	// no workie?
				}, function(err, oldColumn) {
					if (err) {
						res.send("*** ERROR: there was a problem modifying that column in the database.");
						res.redirect('/w/boards');					
					}
					else {
						refreshColumnsView(db, columnId, res);
					}
				});
			}
			else {
				columnsTable.remove({ "_id" : columnId }, function(err) {
					refreshColumnsView(db, columnId, res);
				});
			}
		}
		else {
			if (req.body.columnName && req.body.columnName.length > 0) {
				var sortOrder = req.body.sortOrder ? parseInt(req.body.sortOrder) : columns.length;
				columnsTable.insert({ "boardId" : boardId, "name" : columnName, "sortOrder" : sortOrder }, function(err, column) {
					if (err) {
						res.send("*** ERROR: there was a problem adding that column to the database.");
						res.redirect('/w/boards');
					}
					else {
						refreshBoards(db, boardId, res, 'boards/edit');
					}
				});
			}
			else {
				refreshBoards(db, boardId, res, 'boards/edit');
			}
		}
	});
});

function refreshBoards(db, boardId, res, page) {
	var boardsTable = db.get('boards');
	boardsTable.findById(boardId, {}, function(err, board) {
		if (err) {
			console.log("*** ERROR: could not find board (id=" + boardId + ") for column.");
			res.redirect('/w/boards');
			return;
		}
		else if (board) {
			var columnsTable = db.get('columns');
			columnsTable.find({ "boardId" : boardId }, { sort : { "sortOrder" : 1 }}, function(e, columns) {
				res.render(page, { "board" : board, "columns" : columns });
			});
			return;
		}
	});	
}

// function refreshBoardsEdit(db, boardId, res) {
// 	var boardsTable = db.get('boards');
// 	boardsTable.findById(boardId, {}, function(err, board) {
// 		if (err) {
// 			console.log("*** ERROR: could not find board (id=" + boardId + ") for new column.");
// 			res.redirect('/w/boards');
// 		}
// 		else if (board) {
// 			var columnsTable = db.get('columns');
// 			columnsTable.find({ "boardId" : boardId }, { sort : { "sortOrder" : 1 }}, function(e, columns) {
// 				res.render('boards/edit', { "board" : board, "columns" : columns });
// 			});
// 		}
// 	});
// }

function refreshColumnsView(db, columnId, res) {
	var columnsTable = db.get('columns');
	columnsTable.findById(columnId, {}, function(err, column) {
		if (column) {
			var boards = db.get('boards');
			boards.findById(column.boardId, {}, function(err, board) {
				if (err) {
					console.log("*** ERROR: could not find board (id=" + column.boardId + ") for column.");
					res.redirect('/w/boards');
				}
				else if (board) {
					res.render('columns/view', { "board" : board, "column" : column });
				}
			});
		}
		else {
			console.log("*** ERROR: could not find board (id=" + boardId + ") for new column.");
			res.redirect('/w/boards');
		}
	});
}

module.exports = router;
