var express = require('express');
var router = express.Router();

router.get('/:storyId', function(req, res) {
	
	var db = req.db;
	var storyId = req.params.storyId;
	var action = req.query.action;
	
	var storiesTable = db.get('stories');
	storiesTable.findById(storyId, {}, function(e1, story) {
		if (story) {

			var page = 'columns/view';
			if (action === "delete") {
				storiesTable.remove({ "_id" : storyId }, function(e2) {
					renderColumn(db, story.columnId, res, 'columns/view');
				});
			}
			else {
				page = 'stories/view';
				if (action == "edit") {
					page = 'stories/edit';
				}
				
				var columnsTable = db.get('columns');
				columnsTable.findById(story.columnId, {}, function(e3, column) {
					if (column) {
						var boardsTable = db.get('boards');
						boardsTable.findById(column.boardId, {}, function(e4, board) {
							if (board) {
								res.render(page, { "board" : board, "column" : column, "story" : story });
							}
							else {
								console.log("*** ERROR: could not find board (id=" + column.boardId + ") for column.");
								res.redirect('/w/boards');
							}
						});
					}
					else {
						console.log("*** ERROR: could not find column (id=" + story.columnId + ") for story.");
						res.redirect('/w/boards');
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
	
	// column
	var columnId = req.body.columnId;
	
	// storie
	var storiesTable = db.get('stories');
	storiesTable.find({ "columnId" : columnId }, { sort : { "sortOrder" : 1 }}, function(err, stories) {
	
		var storyName = req.body.storyName;
	
		if (req.body.storyId && req.body.storyId.length > 1) {
			var storyId = req.body.storyId;
			if (req.body.storyName && req.body.storyName.length > 0) {			
				var sortOrder = parseInt(req.body.sortOrder);
				storiesTable.findAndModify({
					"query" : { "_id" : storyId },
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
							renderColumn(db, columnId, res, 'columns/edit');
						}
						else {
							renderStory(db, storyId, res, 'stories/view');
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

function renderColumn(db, columnId, res, page) {
	
	var columnsTable = db.get('columns');
	columnsTable.findById(columnId, {}, function(err, column) {
		if (err) {
			console.log("*** ERROR: could not find column (id=" + columnId + ") for column.");
			res.redirect('/w/boards');			
		}
		else if (column) {
			var boardsTable = db.get('boards');
			boardsTable.findById(column.boardId, {}, function(err, board) {
				if (err) {
					console.log("*** ERROR: could not find board (id=" + column.boardId + ") for column.");
					res.redirect('/w/boards');
				}
				else if (board) {
					var storiesTable = db.get('stories');
					storiesTable.find({ "columnId" : columnId }, { sort : { "sortOrder" : 1 }}, function(e, stories) {
						res.render(page, { "board" : board, "column" : column, "stories" : stories });
					});
				}
			});
		}
	});
	
}

function renderStory(db, storyId, res, page) {
	
	var storiesTable = db.get('stories');
	var columnsTable = db.get('columns');
	var boardsTable = db.get('boards');

	storiesTable.findById(storyId, {}, function(e1, story) {
		if (story) {
			columnsTable.findById(story.columnId, {}, function(e2, column) {
				if (column) {
					boardsTable.findById(column.boardId, {}, function(e3, board) {
						if (board) {
							res.render(page, { "board" : board, "column" : column, "story" : story });
						}
						else {
							console.log("*** ERROR: could not find board (id=" + column.boardId + ") for column.");
							res.redirect('/w/boards');
						}
					});
				}
				else {
					console.log("*** ERROR: could not find column (id=" + story.columnId + ") for story.");
					res.redirect('/w/boards');
				}
			});
		}
		else {
			console.log("*** ERROR: could not find story (id=" + storyId + ").");
			res.redirect('/w/boards');			
		}
	});

}

module.exports = router;
