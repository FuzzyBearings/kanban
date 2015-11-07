var async = require('async');

var editorPage = 'editor/bootstrap-editor';
var kanbanPage = 'editor/bootstrap-kanban';

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
			renderDocumentPageProject(req, res, board.projectId, board, column, card, comment);
		}
		else {
			console.log("err: " + err);
			res.send("FATAL ERROR: could not find that board(" + boardId + ") in the database");
		}
	});
}

function renderDocumentPageProject(req, res, projectId, board, column, card, comment) {
	if (!res.targetPage) {
		res.targetPage = editorPage;
	}
	var db = req.db;
	var table = db.get('projects');
	table.findById(projectId, {}, function(err, project) {
		if (project) {
			renderDocumentPageClient(req, res, project.clientId, project, board, column, card, comment);
		}
		else {
			console.log("err: " + err);
			res.send("FATAL ERROR: could not find that project(" + project + ") in the database");
		}
	});
}

function renderDocumentPageClient(req, res, clientId, project, board, column, card, comment) {
	if (!res.targetPage) {
		res.targetPage = editorPage;
	}
	var db = req.db;
	var table = db.get('clients');
	table.findById(clientId, {}, function(err, client) {
		if (client) {
			renderDocumentPageFamily(req, res, client.familyId, client, project, board, column, card, comment);
		}
		else {
			console.log("err: " + err);
			res.send("FATAL ERROR: could not find that client(" + clientId + ") in the database");
		}
	});		
}

function renderDocumentPageFamily(req, res, familyId, client, project, board, column, card, comment) {
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
						findClientsForFamily(db, res, family, client, project, board, column, card, comment, families);
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

function findClientsForFamily(db, res, family, client, project, board, column, card, comment, families) {
	if (family) {
		var table = db.get('clients');
		table.find({ "familyId" : family._id.toString() }, { sort: { "sortOrder" : 1,  "name" : 1 }}, function(err1, clients) {
			if (clients) {
				findProjectsForClient(db, res, family, client, project, board, column, card, comment, families, clients);
			}
			else {
				res.send("FATAL ERROR : could not fetch clients.");
			}
		});		
	}
	else {
		res.render(res.targetPage, { "remoteFamilies" : families });
	}
}

function findProjectsForClient(db, res, family, client, project, board, column, card, comment, families, clients) {
	if (client) {
		var table = db.get('projects');
		table.find({ "clientId" : client._id.toString() }, { sort: { "sortOrder" : 1,  "name" : 1 }}, function(err1, projects) {
			if (projects) {
				findBoardsForProject(db, res, family, client, project, board, column, card, comment, families, clients, projects);
			}
			else {
				res.send("FATAL ERROR : could not fetch projects.");
			}
		});		
	}
	else {
		res.render(res.targetPage, { "remoteFamilies" : families, "remoteFamily" : family, "remoteClients" : clients });		
	}
}

function findBoardsForProject(db, res, family, client, project, board, column, card, comment, families, clients, projects) {
	if (project) {
		var table = db.get('boards');
		table.find({ "projectId" : project._id.toString() }, { sort: { "sortOrder" : 1,  "name" : 1 }}, function(err1, boards) {
			if (boards) {
				findColumnsForBoard(db, res, family, client, project, board, column, card, comment, families, clients, projects, boards);
			}
			else {
				res.send("FATAL ERROR : could not fetch boards.");
			}
		});		
	}
	else {
		res.render(res.targetPage, { "remoteFamilies" : families, "remoteFamily" : family, "remoteClients" : clients, "remoteClient" : client, "remoteProjects" : projects });		
	}
}

function findColumnsForBoard(db, res, family, client, project, board, column, card, comment, families, clients, projects, boards) {
	if (board) {
		var table = db.get('columns');
		table.find({ "boardId" : board._id.toString() }, { sort: { "sortOrder" : 1,  "name" : 1 }}, function(err1, columns) {
			if (columns) {
				var columnsDictionary = { "columns" : columns };
				if (column) {
					findCardsForColumns(db, res, family, client, project, board, column, card, comment, families, clients, projects, boards, columnsDictionary);
				}
				else {
					findCardsForColumns(db, res, family, client, project, board, column, card, comment, families, clients, projects, boards, columnsDictionary);
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
									 "remoteClients" : clients,
									 "remoteClient" : client,
									 "remoteProjects" : projects,
									 "remoteProject" : project,
									 "remoteBoards" : boards
		});
	}
}

function findCardsForColumns(db, res, family, client, project, board, column, card, comment, families, clients, projects, boards, columnsDictionary) {
	var table = db.get('cards');
	columnsDictionary.cards = [];
	var numberOfColumns = columnsDictionary.columns.length;
	
	async.each(columnsDictionary.columns, function(element, callback) {
		var columnId = element._id.toString();
		table.find({ "columnId" : columnId }, { sort: { "sortOrder" : 1, "name" : 1 }}, function(err, cards) {
			columnsDictionary.cards[columnId] = cards;
			callback();
		});
	}, function(err) {
		res.render(res.targetPage, { "remoteFamilies" : families,
									 "remoteFamily" : family,
									 "remoteClients" : clients,
									 "remoteClient" : client,
									 "remoteProjects" : projects,
									 "remoteProject" : project,
									 "remoteBoards" : boards,
									 "remoteBoard" : board,
									 "remoteColumns" : columnsDictionary
		});
	});
}

function findCardsForColumn(db, res, family, client, project, board, column, card, comment, families, clients, projects, boards, columnsDictionary) {
	if (column) {
		var table = db.get('cards');
		table.find({ "columnId" : column._id.toString() }, { sort: { "sortOrder" : 1,  "name" : 1 }}, function(err1, cards) {
			if (cards) {
				findCommentsForCard(db, res, family, client, project, board, column, card, comment, families, clients, projects, boards, columnsDictionary, cards);
			}
			else {
				res.send("FATAL ERROR : could not fetch columns.");
			}
		});		
	}
	else {
		res.render(res.targetPage, { "remoteFamilies" : families, 
		                         	 "remoteFamily" : family, 
									 "remoteClients" : clients,
									 "remoteClient" : client,
									 "remoteProjects" : projects,
									 "remoteProject" : project,
									 "remoteBoards" : boards,
									 "remoteBoard" : board,
									 "remoteColumns" : columnsDictionary
		});
	}
}

function findCommentsForCard(db, res, family, client, project, board, column, card, comment, families, clients, projects, boards, columnsDictionary, cards) {
	if (card) {
		var table = db.get('comments');
		table.find({ "cardId" : card._id.toString() }, { sort: { "sortOrder" : 1,  "name" : 1 }}, function(err1, comments) {
			if (comments) {
				if (comment) {
					res.render(res.targetPage, { "remoteFamilies" : families, 
				                         	 "remoteFamily" : family, 
										 	 "remoteClients" : clients,
										 	 "remoteClient" : client,
											 "remoteProjects" : projects,
											 "remoteProject" : project,
										 	 "remoteBoards" : boards,
										 	 "remoteBoard" : board,
										 	 "remoteColumns" : columnsDictionary,
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
											 "remoteClients" : clients,
											 "remoteClient" : client,
											 "remoteProjects" : projects,
											 "remoteProject" : project,
											 "remoteBoards" : boards,
											 "remoteBoard" : board,
											 "remoteColumns" : columnsDictionary,
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
								 	"remoteClients" : clients,
								 	"remoteClient" : client,
									"remoteProjects" : projects,
									"remoteProject" : project,
									"remoteBoards" : boards,
									"remoteBoard" : board,
									"remoteColumns" : columnsDictionary,
									"remoteColumn" : column,
									"remoteCards" : cards
		});
	}
}

exports.renderDocumentPageComment = renderDocumentPageComment;
exports.renderDocumentPageCard = renderDocumentPageCard;
exports.renderDocumentPageColumn = renderDocumentPageColumn;
exports.renderDocumentPageProject = renderDocumentPageProject;
exports.renderDocumentPageBoard = renderDocumentPageBoard;
exports.renderDocumentPageClient = renderDocumentPageClient;
exports.renderDocumentPageFamily = renderDocumentPageFamily;
