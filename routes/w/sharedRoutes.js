var editorPage = 'editor';

function renderDocumentPageFamily(req, res, familyId) {
	var db = req.db;
	var familyTable = db.get('family');
	familyTable.find({}, { sort: { "sortOrder" : 1, "name" : 1 }}, function(err, families) {
		if (families) {
			res.render(editorPage, { "rFamilies" : families });
		}
		else {
			console.log("FATAL ERROR: could not fetch families.");
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
