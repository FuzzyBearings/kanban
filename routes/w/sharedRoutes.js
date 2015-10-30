// var editorPage = 'editor/portrait1';
// var kanbanPage = 'editor/portrait2';
// var editorPage = 'viewer/portrait';
// var kanbanPage = 'viewer/portrait';
var editorPage = 'kanban/kanban';
var kanbanPage = 'kanban/kanban';

function renderDocumentPageComment(req, res, commentId) {
	res.targetPage = kanbanPage;
	var db = req.db;
	var table = db.get('comments');
	table.findById(commentId, {}, function(err, comment) {
		if (comment) {
			renderDocumentPageCard(req, res, comment.cardId, comment);
		}
		else {
			console.log("err: " + err);
			res.send("FATAL ERROR: could not find that comment(" + commentId + ") in the database");
		}
	});
}

function renderDocumentPageCard(req, res, cardId, comment) {
	res.targetPage = kanbanPage;
	var db = req.db;
	var table = db.get('cards');
	table.findById(cardId, {}, function(err, card) {
		if (card) {
			renderDocumentPageColumn(req, res, card.columnId, card, comment);
		}
		else {
			console.log("err: " + err);
			res.send("FATAL ERROR: could not find that card(" + cardId + ") in the database");
		}
	});
}

function renderDocumentPageColumn(req, res, columnId, card, comment) {
	if (!res.targetPage) {
		res.targetPage = kanbanPage;
	}
	var db = req.db;
	var table = db.get('columns');
	table.findById(columnId, {}, function(err, column) {
		if (column) {
			renderDocumentPageBoard(req, res, column.boardId, column, card, comment);
		}
		else {
			console.log("err: " + err);
			res.send("FATAL ERROR: could not find that column(" + columnId + ") in the database");
		}
	});
}

function renderDocumentPageBoard(req, res, boardId, column, card, comment) {
	if (!res.targetPage) {
		res.targetPage = kanbanPage;
	}
	var db = req.db;
	var table = db.get('boards');
	table.findById(boardId, {}, function(err, board) {
		if (board) {
			renderDocumentPageGroup(req, res, board.groupId, board, column, card, comment);
		}
		else {
			console.log("err: " + err);
			res.send("FATAL ERROR: could not find that board(" + boardId + ") in the database");
		}
	});
}

function renderDocumentPageGroup(req, res, groupId, board, column, card, comment) {
	if (!res.targetPage) {
		res.targetPage = editorPage;
	}
	var db = req.db;
	var table = db.get('groups');
	table.findById(groupId, {}, function(err, group) {
		if (group) {
			renderDocumentPageFamily(req, res, group.familyId, group, board, column, card, comment);
		}
		else {
			console.log("err: " + err);
			res.send("FATAL ERROR: could not find that group(" + groupId + ") in the database");
		}
	});		
}

function renderDocumentPageFamily(req, res, familyId, group, board, column, card, comment) {
	if (!res.targetPage) {
		res.targetPage = editorPage;		
	}
	var db = req.db;
	var familyTable = db.get('families');
	familyTable.find({}, { sort: { "sortOrder" : 1, "name" : 1 }}, function(err1, families) {
		if (families) {
			if (familyId && familyId.length > 1) {
				familyTable.findById(familyId, {}, function(err2, family) {
					if (family) {
						findGroupsForFamily(db, res, family, group, board, column, card, comment, families);
					}
					else {
						console.log("err: " + err2);
						res.send("FATAL ERROR: could not find that family(" + familyId + ") in the database.");
					}
				});
			}
			else {
				res.render(editorPage, { "remoteFamilies" : families });
			}
		}
		else {
			console.log("err: " + err1);
			res.send("FATAL ERROR: could not fetch families.");
		}
	});
}

//
// PRIVATE
//

function findGroupsForFamily(db, res, family, group, board, column, card, comment, families) {
	if (family) {
		var table = db.get('groups');
		table.find({ "familyId" : family._id.toString() }, { sort: { "sortOrder" : 1,  "name" : 1 }}, function(err1, groups) {
			if (groups) {
				findBoardsforGroup(db, res, family, group, board, column, card, comment, families, groups);
			}
			else {
				res.send("FATAL ERROR : could not fetch groups.");
			}
		});		
	}
	else {
		res.render(res.targetPage, { "remoteFamilies" : families });
	}
}

function findBoardsforGroup(db, res, family, group, board, column, card, comment, families, groups) {
	if (group) {
		var table = db.get('boards');
		table.find({ "groupId" : group._id.toString() }, { sort: { "sortOrder" : 1,  "name" : 1 }}, function(err1, boards) {
			if (boards) {
				findColumnsForBoard(db, res, family, group, board, column, card, comment, families, groups, boards);
			}
			else {
				res.send("FATAL ERROR : could not fetch boards.");
			}
		});		
	}
	else {
		res.render(res.targetPage, { "remoteFamilies" : families, "remoteFamily" : family, "remoteGroups" : groups });		
	}
}

function findColumnsForBoard(db, res, family, group, board, column, card, comment, families, groups, boards) {
	if (board) {
		var table = db.get('columns');
		table.find({ "boardId" : board._id.toString() }, { sort: { "sortOrder" : 1,  "name" : 1 }}, function(err1, columns) {
			if (columns) {
				findCardsForColumn(db, res, family, group, board, column, card, comment, families, groups, boards, columns);
			}
			else {
				res.send("FATAL ERROR : could not fetch columns.");
			}
		});		
	}
	else {
		res.render(res.targetPage, { "remoteFamilies" : families, 
		                         	"remoteFamily" : family, 
									 "remoteGroups" : groups,
									 "remoteGroup" : group,
									 "remoteBoards" : boards
		});
	}
}

function findCardsForColumn(db, res, family, group, board, column, card, comment, families, groups, boards, columns) {
	if (column) {
		var table = db.get('cards');
		table.find({ "columnId" : column._id.toString() }, { sort: { "sortOrder" : 1,  "name" : 1 }}, function(err1, cards) {
			if (cards) {
				findCommentsForCard(db, res, family, group, board, column, card, comment, families, groups, boards, columns, cards);
			}
			else {
				res.send("FATAL ERROR : could not fetch columns.");
			}
		});		
	}
	else {
		res.render(res.targetPage, { "remoteFamilies" : families, 
		                         	 "remoteFamily" : family, 
									 "remoteGroups" : groups,
									 "remoteGroup" : group,
									 "remoteBoards" : boards,
									 "remoteBoard" : board,
									 "remoteColumns" : columns
		});
	}
}

function findCommentsForCard(db, res, family, group, board, column, card, comment, families, groups, boards, columns, cards) {
	if (card) {
		var table = db.get('comments');
		table.find({ "cardId" : card._id.toString() }, { sort: { "sortOrder" : 1,  "name" : 1 }}, function(err1, comments) {
			if (comments) {
				if (comment) {
					res.render(res.targetPage, { "remoteFamilies" : families, 
				                         	 "remoteFamily" : family, 
										 	 "remoteGroups" : groups,
										 	 "remoteGroup" : group,
										 	 "remoteBoards" : boards,
										 	 "remoteBoard" : board,
										 	 "remoteColumns" : columns,
										 	 "remoteColumn" : column,
										 	 "remoteCards" : cards,
											 "remoteCard" : card,
											 "remoteComments" : comments,
											 "remoteComment" : comment
					});
				}
				else {
					res.render(res.targetPage, { "remoteFamilies" : families, 
			        						 "remoteFamily" : family, 
											 "remoteGroups" : groups,
											 "remoteGroup" : group,
											 "remoteBoards" : boards,
											 "remoteBoard" : board,
											 "remoteColumns" : columns,
											 "remoteColumn" : column,
											 "remoteCards" : cards,
											 "remoteCard" : card,
											 "remoteComments" : comments
					});
				}
			}
			else {
				res.send("FATAL ERROR : could not fetch columns.");
			}
		});		
	}
	else {
		res.render(res.targetPage, { "remoteFamilies" : families, 
		                         	"remoteFamily" : family, 
								 	"remoteGroups" : groups,
								 	"remoteGroup" : group,
									"remoteBoards" : boards,
									"remoteBoard" : board,
									"remoteColumns" : columns,
									"remoteColumn" : column,
									"remoteCards" : cards
		});
	}
}

exports.renderDocumentPageComment = renderDocumentPageComment;
exports.renderDocumentPageCard = renderDocumentPageCard;
exports.renderDocumentPageColumn = renderDocumentPageColumn;
exports.renderDocumentPageBoard = renderDocumentPageBoard;
exports.renderDocumentPageGroup = renderDocumentPageGroup;
exports.renderDocumentPageFamily = renderDocumentPageFamily;
