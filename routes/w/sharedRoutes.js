var editorPage = 'editor';

function renderDocumentPageComment(req, res, commentId) {
	var db = req.db;
	var table = db.get('comments');
	table.findById(commentId, {}, function(err, comment) {
		if (comment) {
			renderDocumentPageCard(req, res, comment.cardId, comment._id);
		}
		else {
			res.send("FATAL ERROR: could not find that comment(" + commentId + ") in the database");
		}
	});
}

function renderDocumentPageCard(req, res, cardId, commentId) {
	var db = req.db;
	var table = db.get('cards');
	table.findById(cardId, {}, function(err, card) {
		if (card) {
			renderDocumentPageColumn(req, res, card.columnId, card._id, commentId);
		}
		else {
			res.send("FATAL ERROR: could not find that card(" + cardId + ") in the database");
		}
	});
}

function renderDocumentPageColumn(req, res, columnId, cardId, commentId) {
	var db = req.db;
	var table = db.get('columns');
	table.findById(columnId, {}, function(err, column) {
		if (column) {
			renderDocumentPageBoard(req, res, column.boardId, column._id, cardId, commentId);
		}
		else {
			res.send("FATAL ERROR: could not find that column(" + columnId + ") in the database");
		}
	});
}

function renderDocumentPageBoard(req, res, boardId, columnId, cardId, commentId) {
	var db = req.db;
	var table = db.get('boards');
	table.findById(boardId, {}, function(err, board) {
		if (board) {
			renderDocumentPageGroup(req, res, board.groupId, board._id, columnId, cardId, commentId);
		}
		else {
			res.send("FATAL ERROR: could not find that board(" + boardId + ") in the database");
		}
	});
}

function renderDocumentPageGroup(req, res, groupId, boardId, columnId, cardId, commentId) {
	var db = req.db;
	var table = db.get('groups');
	table.findById(groupId, {}, function(err, group) {
		if (group) {
			renderDocumentPage(req, res, group.familyId, group._id, boardId, columnId, cardId, commentId);
		}
		else {
			res.send("FATAL ERROR: could not find that group(" + groupId + ") in the database");
		}
	});
}

function renderDocumentPageFamily(req, res, familyId, groupId, boardId, columnId, cardId, commentId) {
	renderDocumentPage(req, res, familyId, groupId, boardId, columnId, cardId, commentId);
}

function renderDocumentPage(req, res, familyId, groupId, boardId, columnId, cardId, commentId) {
	var db = req.db;
	var familyTable = db.get('families');
	familyTable.find({}, { sort: { "sortOrder" : 1, "name" : 1 }}, function(err1, families) {
		if (families) {
			if (familyId && familyId.length > 1) {
				familyTable.findById(familyId, {}, function(err2, family) {
					if (family) {
						var groupTable = db.get('groups');
						groupTable.find({ "familyId" : familyId }, { sort: { "sortOrder" : 1,  "name" : 1 }}, function(err3, groups) {
							if (groups) {
								if (groupId) {
									groupTable.findById(groupId, {}, function(err4, group) {
										if (group) {
											res.render(editorPage, { "remoteFamily" : family, 
																	 "remoteFamilies" : families, 
																	 "remoteGroup" : group,
																	 "remoteGroups" : groups });											
										}
										else {
											res.send("FATAL ERROR: could not find that group(" + groupId + ") in the database.");											
										}
									});
								}
								else {
									res.render(editorPage, { "remoteFamily" : family, "remoteFamilies" : families, "remoteGroups" : groups });									
								}
							}
							else {
								res.send("FATAL ERROR : could not fetch groups.");
							}
						});
					}
					else {
						res.send("FATAL ERROR: could not find that family(" + familyId + ") in the database.");
					}
				});
			}
			else {
				res.render(editorPage, { "remoteFamilies" : families });
			}
		}
		else {
			res.send("FATAL ERROR: could not fetch families.");
		}
	});
}

exports.renderDocumentPageComment = renderDocumentPageComment;
exports.renderDocumentPageCard = renderDocumentPageCard;
exports.renderDocumentPageColumn = renderDocumentPageColumn;
exports.renderDocumentPageBoard = renderDocumentPageBoard;
exports.renderDocumentPageGroup = renderDocumentPageGroup;
exports.renderDocumentPageFamily = renderDocumentPageFamily;
