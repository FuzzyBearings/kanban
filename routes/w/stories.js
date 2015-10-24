var express = require('express');
var router = express.Router();

router.get('/:storyId', function(req, res) {
	
	var db = req.db;
	var storiesTable = db.get('stories');
	var storyId = req.params.storyId;
	var action = req.query.action;
	
	var columnsTable = db.get('columns');
	storiesTable.findById(storyId, {}, function(e, story) {
		if (story) {
			var columnId = story.columnId;
			var page = 'columns/view';
			if (action === "delete") {
				storiesTable.remove({ "_id" : storyId }, function(err) {
					renderColumn(db, columnId, res, 'columns/view');
				});
			}
			else {
				page = 'stories/view';
				if (action == "edit") {
					page = 'stories/edit';
				}
				columnsTable.findById(story.columnId, {}, function(err, column) {
					if (err) {
						console.log("*** ERROR: could not find column (id=" + columnId + ") for story.");
						res.redirect('/w/boards');
					}
					else if (column) {
						res.render(page, { "column" : column, "story" : story });
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
	var columnId = req.body.columnId;
	var storiesTable = db.get('stories');
	
	// column
	storiesTable.find({ "columnId" : columnId }, { sort : { "sortOrder" : 1 }}, function(err, stories) {
	
		var storyName = req.body.storyName;
	
		if (req.body.storyId && req.body.storyId.length > 1) {
			var storyId = req.body.storyId;
			if (req.body.storyName && req.body.storyName.length > 0) {			
				var sortOrder = parseInt(req.body.sortOrder);
				storiesTable.findAndModify({
					"query" : { "_id" : columnId },
					"update" : { "columnId" : columnId, "name" : storyName, "sortOrder" : sortOrder },
					"new" : true,		// no workie?
					"upsert" : false	// no workie?
				}, function(err, oldColumn) {
					if (err) {
						res.send("*** ERROR: there was a problem modifying that story in the database.");
						res.redirect('/w/boards');					
					}
					else {
						if (req.body.source === 'columns/edit') {
							renderColumn(db, boardId, res, 'columns/edit');
						}
						else {
							renderStory(db, columnId, res, 'story/view');
						}
					}
				});
			}
			else {
				storiesTable.remove({ "_id" : storyId }, function(err) {
					renderColumn(db, columnId, res, 'columns/edit');
				});
			}
		}
		else {
			if (req.body.storyName && req.body.storyName.length > 0) {
				var sortOrder = req.body.sortOrder ? parseInt(req.body.sortOrder) : stories.length;
				storiesTable.insert({ "columnId" : columnId, "name" : storyName, "sortOrder" : sortOrder }, function(err, story) {
					if (err) {
						res.send("*** ERROR: there was a problem adding that story to the database.");
						res.redirect('/w/boards');
					}
					else {
						renderColumn(db, columnId, res, 'columns/edit');
					}
				});
			}
			else {
				renderColumn(db, columnId, res, 'columns/edit');
			}
		}
	});
});

function renderBoard(db, boardId, res, page) {
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

function renderColumn(db, columnId, res, page) {
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
					res.render(page, { "board" : board, "column" : column });
				}
			});
		}
		else {
			console.log("*** ERROR: could not find column (id=" + columnId + ") for column.");
			res.redirect('/w/boards');
		}
	});
}

function renderStory(db, storyId, res, page) {
	var storiesTable = db.get('columns');
	storiesTable.findById(storyId, {}, function(err, story) {
		if (story) {
			var columnsTable = db.get('columns');
			columnsTable.findById(story.columnId, {}, function(err, column) {
				if (err) {
					console.log("*** ERROR: could not find column (id=" + story.columnId + ") for story.");
					res.redirect('/w/boards');
				}
				else if (column) {
					res.render(page, { "column" : column, "story" : story });
				}
			});
		}
		else {
			console.log("*** ERROR: could not find story (id=" + storyId + ") for story.");
			res.redirect('/w/boards');
		}
	});
}

module.exports = router;
