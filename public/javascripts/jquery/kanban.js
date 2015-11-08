$(function() {
	$("#families-menu").selectmenu({

	    select : function(event, ui) {
	        if($(this).val() != '') {
	            window.location = $(this).val();
	        }
	    }
		
		// , select: function(event, ui) { alert('select'); }
		
	});
});