var express = require('express');
var router = express.Router();

router.put('/:docId', function(req, res) {
	res.send("Sweet");	
});

module.exports = router;
