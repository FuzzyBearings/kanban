var express = require('express');
var router = express.Router();

router.post('/:docId', function(req, res) {
	var docId = req.params.docId;
	var cardId = req.body.cardId;
	var cardName = req.body.name;
	var columnId = req.body.columnId;
	console.log("request body cardId: " + cardId + ", columnId: " + columnId);
	res.render('index', { title: 'Baker' });
});

router.get('/:docId', function(req, res) {
	var docId = req.params.docId;
	res.render('index', { title: 'Baker' });
});

module.exports = router;
