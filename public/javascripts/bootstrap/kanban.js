// https://github.com/bevacqua/dragula
var drake = dragula([document.querySelector('#columns-container')], {
	moves: function(el, source, handle, sibling) {
		var isValid = handle.className.contains('drag-handle');
		console.log('isValid: ' + isValid);
		return isValid;
	},
	direction: 'horizontal'
});

drake.on('drop', function(el, target, source, sibling) {
	alert('drop');	
});


// http://www.w3schools.com/html/html5_draganddrop.asp
// var columnIdKey = "columnId";
//
// function allowDrop(ev) {
//     ev.preventDefault();
// 	console.log('allowDrop(ev) ' + ev);
// }
//
// function drag(ev) {
// 	var columnIdValue = ev.target.getAttribute(columnIdKey);
//     ev.dataTransfer.setData(columnIdKey, columnIdValue);
// 	console.log('drag(ev) ' + ev + ', columnIdValue ' + columnIdValue);
// }
//
// function drop(ev) {
//     ev.preventDefault();
//     var columnId = ev.dataTransfer.getData(columnIdKey);
// 	console.log('columnId: ' + columnId);
//     // ev.target.appendChild(document.getElementById(data));
// 	console.log('drop(ev) ' + ev);
// }

// http://stackoverflow.com/questions/1601827/jquery-ui-sortable-how-to-determine-current-location-and-new-location-in-update
// http://stackoverflow.com/questions/16082519/updating-sort-order-during-sort-change-event-jquery-ui
// var columndDict = { };
// $(function() {
// 	$('ul.sortableColumns').sortable({
// 		connectWith: '.sortableColumns',
// 		placeholder: 'columnPlaceholder',
// 		forcePlaceholderSize: true,
// 		items: "li:not(.dontMove)"
// 	});
// });

var cardDict = { };
$(function() {
	$('ul.sortableCards').sortable({
		connectWith: '.sortableCards',
		placeholder: "cardPlaceholder",
		revert: true,
		forcePlaceholderSize: true,
		remove: function(event, ui) {
			cardDict.source = event.target;
			// console.log("REMOVED! from list " + event.target);
		},
		receive: function(event, ui) {
			cardDict.destination = event.target;
			// console.log("RECEIVED! into list " + event.target);
		},
		start: function(event, ui) {
			cardDict.source = event.target;
			cardDict.destination = event.target;
			// console.log('STARTED! for list ' + event.target);
			cardDict.start = ui.item.index();
			cardDict.stop = 0;
			cardDict.update = false;
			// console.log('STARTED: index(' + ui.item.index() + ') sender(' + ui.sender + ')');
		},
		stop: function(event, ui) {
			if (cardDict.update) {
				var columnId = cardDict.destination.id;
				var cardId = ui.item.get(0).id;
				var json = { cardId: cardId, columnId: columnId, startIndex: parseInt(cardDict.start), stopIndex: parseInt(cardDict.stop) };
				var url = "/cards/" + cardId;
				// console.log('STOPPED! card.id: ' + cardId + ', source { column: ' + cardDict.source.id + ', sortOrder: ' + cardDict.start + ' } destination { column: ' + columnId + ', sortOrder: ' + cardDict.stop + '}');

				var jqXHR = $.ajax({
					type: "PUT",
					url: url,
					data: json
				})
				.done(function(data, textStatus, jqXHR) {
					// console.log("done (" + textStatus + ") data (" + JSON.stringify(data) + ")");
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					// console.log("fail: " + errorThrown);
				})
				.always(function(data_or_jqXHR, textStatus, jqXHR_or_errorThrown) {
					// console.log("always");
				});
				// console.log('STOPPED: index(' + ui.item.index() + ') sender(' + ui.sender + ')');				
			}
		},
		update: function(event, ui) {
			cardDict.update = true;
			cardDict.stop = ui.item.index();
			// var sender = ui.sender;
			// sender = sender ? sender.get(0) : null;
			// console.log('UPDATED: index(' + ui.item.index() + ') sender(' + ui.sender + ')');
		}
	});
	$('#cardModal').on('show.bs.modal', function (event) {
		
		var button = $(event.relatedTarget);
		var cardId = button.data('cardid');
		var cardSortOrder = button.data('cardsortorder');
		var cardName = button.data('name');
		var columnId = button.data('columnid');

		// var msg = cardId + ", " + cardSortOrder + ", " + cardName + ", " + columnId;
		// alert(msg);

		var modal = $(this);
		
	  // var button = $(event.relatedTarget) // Button that triggered the modal
	  // var recipient = button.data('whatever') // Extract info from data-* attributes
	  // // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
	  // // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
	  // modal.find('.modal-title').text('New message to ' + recipient)
	  // modal.find('.modal-body input').val(recipient)
	})
});
