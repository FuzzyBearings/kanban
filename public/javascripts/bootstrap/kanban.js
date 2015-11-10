$(function() {
	$('ul.sortable').sortable({
		connectWith: '.sortable',
		placeholder: "card-placeholder",
		revert: true,
		forcePlaceholderSize: true
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
