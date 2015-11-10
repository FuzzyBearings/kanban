$(function() {
	// $('ul.sortable').each(function(index) {
	// 	$(this).sortable({
	// 		revert: true,
	// 		// placeholder: "ui-state-highlight",
	// 		placeholder: "card-sorting-highlight",
	// 		forcePlaceholderSize: true
	// 	});
	// 	$(this).disableSelection();
	// });
	$('ul.sortable').sortable({
		connectWith: '.sortable',
		placeholder: "card-placeholder"
	});
});
