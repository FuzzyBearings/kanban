var express = require('express');
var router = express.Router();

router.post('/update', function(req, res, next) {
	
	var db = req.db;
	
	// boards
	var boardName = req.body.boardName;
	var boardId = req.body.boardId;
	var columnsTable = db.get('columns');
	
	// column
	columnsTable.find({ "boardId" : boardId }, { "sort" : "sortOrder" }, function(err, columns) {
	
		var columnName = req.body.columnName;
	
		if (req.body.columnId && req.body.columnId.length > 1 && req.body.columnName && req.body.columnName.length > 0) {
			
			var columnId = req.body.columnId;
			var sortOrder = req.body.sortOrder;
			
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
					refresh(db, boardId, res);
				}
			});
		}
		else {
			columnsTable.insert({ "boardId" : boardId, "name" : columnName, "sortOrder" : columns.length }, function(err, column) {
				if (err) {
					res.send("*** ERROR: there was a problem adding that column to the database.");
					res.redirect('/w/boards');
				}
				else {
					refresh(db, boardId, res);
				}
			});
		}
	});
});

function refresh(db, boardId, res) {
	var boards = db.get('boards');
	boards.findById(boardId, {}, function(err, board) {
		if (err) {
			console.log("*** ERROR: could not find board (id=" + boardId + ") for new column.");
			res.redirect('/w/boards');
		}
		else if (board) {
			columnsTable = db.get('columns');
			columnsTable.find({ "boardId" : boardId }, { "sort" : "sortOrder" }, function(e, columns) {
				res.render('boards/edit', { "board" : board, "columns" : columns });
			});
		}
	});	
}

module.exports = router;
