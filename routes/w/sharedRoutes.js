var editorPage = 'editor';

function renderDocumentPageGroup(req, res, groupId) {
	var db = req.db;
	var groupTable = db.get('groups');
	groupTable.findById(groupId, {}, function(err, group) {
		if (group) {
			renderDocumentPage(req, res, group.familyId, group._id);
		}
		else {
			res.send("FATAL ERROR: could not find that group(" + groupId + ") in the database");
		}
	});
}

function renderDocumentPageFamily(req, res, familyId) {
	renderDocumentPage(req, res, familyId);
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

exports.renderDocumentPageGroup = renderDocumentPageGroup;
exports.renderDocumentPageFamily = renderDocumentPageFamily;
