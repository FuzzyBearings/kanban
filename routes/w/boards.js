var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	var db = req.db;
	var boards = db.get('boards');
	boards.find({}, { sort: { "name" : 1 }}, function(e, docs) {
		res.render('boards/list', {
			"boards" : docs
		});
	});
});

// Get new form
// - order is important! (before /:board)
router.get('/edit', function(req, res, next) {
  res.render('boards/edit', { title: 'Express' });
});

// Post new board
router.post('/addboard', function(req, res) {
	var db = req.db;
	var boardName = req.body.boardName;
	var boards = db.get('boards');
	boards.insert({ "name" : boardName }, function(err, doc) {
		if (err) {
			res.send("There was a problem adding that board to the database.");
		}
		else {
			res.redirect('/w/boards/');
		}
	})
});

// Board details
router.get('/:boardId', function(req, res, next) {
	var db = req.db;
	var boards = db.get('boards');
	var boardId = req.params.boardId;
	boards.findById(boardId, {}, function(e, board) {
		if (board) {
			var page = 'boards/board';
			if (req.query.action === "edit") {
				page = 'boards/edit';
			}
			res.render(page, {
				"board" : board
			});
		}
		else {
			// TODO: no board found! Render a different page!
			res.render('boards/board', {});
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
