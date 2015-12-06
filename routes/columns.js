var express = require('express');
var router = express.Router();

router.put('/:docId', function(req, res) {
	
	var boardId = req.body.boardId;
	var columnId = req.body.columnId;
	var siblingId = req.body.siblingId;
	
	console.log('boardId: ' + boardId + ', columnId: ' + columnId + ', siblingId: ' + siblingId);
	
	var db = req.db;
	var docsTable = db.get('columns');
	
	res.send("Sweet");	
});

module.exports = router;
