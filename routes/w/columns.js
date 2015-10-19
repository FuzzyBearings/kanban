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
	
		if (req.body.columnId) {
			var columnId = req.body.columnId;
			res.redirect('/w/boards');
		}
		else {
			columnsTable.insert({ "boardId" : boardId, "name" : columnName, "sortOrder" : columns.length }, function(err, column) {
				if (err) {
					res.send("*** ERROR: there was a problem adding that column to the database.");
					res.redirect('/w/boards');
				}
				else {
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
			});
		}
	});
});

module.exports = router;
