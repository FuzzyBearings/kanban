var express = require('express');
var router = express.Router();
var async = require('async');

router.put('/:docId', function(req, res) {
	// var docId = req.params.docId;
	var cardId = req.body.cardId;
	var cardName = req.body.name;
	var columnId = req.body.columnId;
	var screenIndex = req.body.screenIndex;
	if (screenIndex) {
		screenIndex = parseInt(screenIndex);
	}
	// console.log("request body cardId: " + cardId + ", columnId: " + columnId + ", screenIndex: " + screenIndex);
	
	var db = req.db;
	var docsTable = db.get('cards');
	docsTable.find({ "columnId" : columnId }, { sort: { "sortOrder" : 1, "name" : 1 }}, function(err, cards) {
		
		// TODO: this method should handle updates that do NOT upate sortOrder
		// be smart, put this sorting logic in another method
		
		// console.log(' find by column id: ' + columnId);
		
		var i = -1;
		var currentSortOrder = 0.0;
		var lastSortOrder = 0.0;
		var tweenSortOrder = 0.0;
		var done = false;
		async.each(cards, function(card, callback) {

			++i;
			// console.log('did we make it here?');
			currentSortOrder = Number(card.sortOrder);

			if (!done) {			
				if (i == screenIndex) {
					if (screenIndex == 0) {
						tweenSortOrder = currentSortOrder - 1.0;
						done = true;
						// console.log('i == 0');
					}
					else {
						tweenSortOrder = (lastSortOrder + currentSortOrder) / 2.0;
						done = true;
						// console.log('i == sortOrder');
					}
				}
				else {
					lastSortOrder = currentSortOrder;
					tweenSortOrder = currentSortOrder + 1.0;
					// console.log('last sort order: ' + lastSortOrder);
				}				
			}
			
			// console.log(lastSortOrder + "(" + tweenSortOrder + ")" + currentSortOrder);
			callback();
			
		}, function(err) {

			// console.log('final function ... ');

		    docsTable.findById(cardId, function(err, card) {
				// TODO: for now, assume we always upate sort order
				card.sortOrder = tweenSortOrder;

				if (cardName) {
					// is this check valid?
					card.name = cardName;
				}

				if (columnId && columnId.length > 1) {
					// is this check valid?
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
		
	});
	// docsTable.findById(cardId, function(err, card) {
	// 	if (cardName) {
	// 		card.name = cardName;
	// 	}
	// 	if (sortOrder) {
	// 		card.sortOrder = sortOrder;
	// 	}
	// 	if (columnId) {
	// 		card.columnId = columnId;
	// 	}
	// 	console.log("card sortOrder: " + card.sortOrder);
	// 	docsTable.findAndModify({
	// 		"query" : { "_id" : cardId },
	// 		"update" : card,
	// 		"new" : true,		// no workie?
	// 		"upsert" : false	// no workie?
	// 	}, function(err, oldDoc) {
	// 		if (err) {
	// 			res.send({ retval: -1, message: err });
	// 		}
	// 		else {
	// 			res.send({ retval: 0, message: "Success!" });
	// 		}
	// 	});
	// });
});

router.get('/:docId', function(req, res) {
	var docId = req.params.docId;
	res.render('index', { title: 'Baker' });
});

module.exports = router;
