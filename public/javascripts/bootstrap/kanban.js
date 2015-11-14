
// http://stackoverflow.com/questions/1601827/jquery-ui-sortable-how-to-determine-current-location-and-new-location-in-update
// http://stackoverflow.com/questions/16082519/updating-sort-order-during-sort-change-event-jquery-ui

var dict = { };
$(function() {
	$('ul.sortable').sortable({
		connectWith: '.sortable',
		placeholder: "card-placeholder",
		revert: true,
		forcePlaceholderSize: true,
		remove: function(event, ui) {
			dict.source = event.target;
			// console.log("REMOVED! from list " + event.target);
		},
		receive: function(event, ui) {
			dict.destination = event.target;
			// console.log("RECEIVED! into list " + event.target);
		},
		start: function(event, ui) {
			dict.start = ui.item.index();
			dict.stop = null;
			dict.source = null;
			dict.destination = null;
			// console.log('STARTED: index(' + ui.item.index() + ') sender(' + ui.sender + ')');
		},
		stop: function(event, ui) {
			if (dict.source && dict.destination) {
				var cardId = ui.item.get(0).id;
				console.log('card.id: ' + cardId + ', source { column: ' + dict.source.id + ', sortOrder: ' + dict.start + ' } destination { column: ' + dict.destination.id + ', sortOrder: ' + dict.stop + '}');
				var json = { cardId: cardId, sortOrder: dict.stop, columnId: dict.destination.id };
				var url = "/cards/" + cardId;

				// var jqxhr = $.post(url, json).done(function() {
				// 	console.log("done");
				// }).fail(function() {
				// 	console.log("fail");
				// }).always(function() {
				// 	console.log("always");
				// });

				// $.ajax({
				// 	type: "POST",
				// 	url: url,
				// 	data: json,
				// 	success: function(data, textStatus, jqXHR) {
				// 		console.log("Success!");
				// 	},
				// 	error: function(data, textStatus, jqXHR) {
				// 		console.log("Error!");
				// 	}
				// });

				var jqXHR = $.ajax({
					type: "PUT",
					url: url,
					data: json
				})
				.done(function(data, textStatus, jqXHR) {
					console.log("done (" + textStatus + ") data (" + JSON.stringify(data) + ")");
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					console.log("fail: " + errorThrown);
				})
				.always(function(data_or_jqXHR, textStatus, jqXHR_or_errorThrown) {
					console.log("always");
				});
				
			}
			else {
				console.log('card.id: ' + ui.item.get(0).id + ', (' + dict.start + ') ' + '(' + dict.stop + ')');
			}
			// console.log('STOPPED: index(' + ui.item.index() + ') sender(' + ui.sender + ')');
		},
		update: function(event, ui) {
			dict.stop = ui.item.index();
			// var sender = ui.sender;
			// sender = sender ? sender.get(0) : null;
			console.log('UPDATED: index(' + ui.item.index() + ') sender(' + ui.sender + ')');
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
