$('.toggle').click(function (event) {
	alert('go');
	event.preventDefault();
	var target = $(this).attr('href');
	$(target).toggleClass('hidden show');
});

$('.toggle').click(function (event) {
	alert('no');
	event.preventDefault();
	var target = $(this).attr('href');
	$(target).toggleClass('hidden show');
});
