var editorPage = 'editor';

function renderDocumentPageFamily(req, res, familyId) {
	var db = req.db;
	var familyTable = db.get('family');
	familyTable.find({}, { sort: { "sortOrder" : 1, "name" : 1 }}, function(err, families) {
		if (families) {
			if (familyId && familyId.length > 1) {
				familyTable.findById(familyId, {}, function(err, family) {
					if (family) {
						res.render(editorPage, { "remoteFamily" : family, "remoteFamilies" : families });
						// var childrenTable = db.get(childDocsName);
						// childrenTable.find({ "parentId" : docId }, { sort : { "sortOrder" : 1, "name" : 1 }}, function(err2, children) {
						// 	console.log("len: " + children.length);
						// 	if (children) {
						// 		res.render(page, { "remoteDoc" : doc, "remoteChildren" : children });
						// 	}
						// 	else {
						// 		res.send("There was a problem finding that document's children in the database.");
						// 	}
						// });
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

//
// OLD
//
function renderDocumentPage(db, res, objectGraph) {
	if (docId === "0") {
		res.render(page, { });
	}
	else {
		var docsTable = db.get(docsName);
		docsTable.findById(docId, {}, function(err, doc) {
			console.log("doc: " + doc + ", " + childDocsName);
			if (doc) {
				var childrenTable = db.get(childDocsName);
				childrenTable.find({ "parentId" : docId }, { sort : { "sortOrder" : 1, "name" : 1 }}, function(err2, children) {
					console.log("len: " + children.length);
					if (children) {
						res.render(page, { "remoteDoc" : doc, "remoteChildren" : children });
					}
					else {
						res.send("There was a problem finding that document's children in the database.");							
					}
				});
			}
			else {
				res.send("There was a problem finding that document in the database.");
			}
		});
	}
}

exports.renderDocumentPageFamily = renderDocumentPageFamily;
