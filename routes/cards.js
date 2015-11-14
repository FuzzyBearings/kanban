var express = require('express');
var router = express.Router();

router.put('/:docId', function(req, res) {
	// var docId = req.params.docId;
	var cardId = req.body.cardId;
	var cardName = req.body.name;
	var columnId = req.body.columnId;
	var sortOrder = req.body.sortOrder;
	console.log("request body cardId: " + cardId + ", columnId: " + columnId);
	
	var db = req.db;
	var docsTable = db.get('cards');
	docsTable.findById(cardId, function(err, card) {
		if (cardName) {
			card.name = cardName;
		}
		if (sortOrder) {
			card.sortOrder = sortOrder;			
		}
		if (columnId) {
			card.columnId = columnId;			
		}
		docsTable.findAndModify({
			"query" : { "_id" : cardId },
			"update" : card,
			"new" : true,		// no workie?
			"upsert" : false	// no workie?
		}, function(err, oldDoc) {
			if (err) {
				res.send({ retval: -1, message: err });
			}
			else {
				res.send({ retval: 0, message: "Success!" });
			}
		});
	});

});

router.get('/:docId', function(req, res) {
	var docId = req.params.docId;
	res.render('index', { title: 'Baker' });
});

module.exports = router;
