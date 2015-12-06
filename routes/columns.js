var express = require('express');
var router = express.Router();
var async = require('async');

router.put('/:docId', function(req, res) {
	
	var boardId = req.body.boardId;
	var columnId = req.body.columnId;
	var siblingId = req.body.siblingId;
	console.log('boardId: ' + boardId + ', columnId: ' + columnId + ', siblingId: ' + siblingId);
	
	var db = req.db;
	var docsTable = db.get('columns');
	var finalSortOrder = -1;
	var done = false;

	docsTable.find({ "boardId" : boardId }, { sort: { "sortOrder" : 1, "name" : 1 }}, function(err, columns) {
		
		if (err) {
			
		} else {

			var count = columns.length;
			// console.log('count: ' + count);

			if (!siblingId) {
				var column = columns[count-1];
				finalSortOrder = Number(column.sortOrder) + 1;
				done = true;
			} else {
				for (var i = 0; !done && i < count; ++i) {
					var column = columns[i];
					if (column._id.toString() == siblingId) {
						if (i == 0) {
							finalSortOrder = Number(column.sortOrder) - 1;
						} else {
							var previousColumn = columns[i - 1];
							var temp = Number(previousColumn.sortOrder) + Number(column.sortOrder);
							finalSortOrder = temp / 2.0;
						}
						done = true;
					}
				}
			}

			// console.log('done! ' + done + ', finalSortOrder: ' + finalSortOrder);
			
			if (done) {
				docsTable.findById(columnId, function(err, column) {
		
					if (err) {
			
					} else {
						column.sortOrder = finalSortOrder;
						docsTable.findAndModify({
							"query" : { "_id" : column._id },
							"update" : column,
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
					}		
				});
				
			}
			
		}

	});
});

module.exports = router;
