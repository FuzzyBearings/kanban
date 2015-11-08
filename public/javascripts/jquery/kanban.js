function setupDropdown(dropdownElementId, index, array) {
	$(dropdownElementId).selectmenu({
	    select : function(event, ui) {
	        if($(this).val() != '') {
	            window.location = $(this).val();
	        }
	    }
	});	
}

function setupMenu(menuElementId, index, array) {
	$(menuElementId).menu({
	    // select : function(event, ui) {
	    //     if($(this).val() != '') {
	    //         window.location = $(this).val();
	    //     }
	    // }
	});	
}

$(function() {
	
	var dropdowns = ["#families-dropdown", "#clients-dropdown", "#projects-dropdown", "#boards-dropdown"];
	dropdowns.forEach(setupDropdown);
	
	var menus = ["#families-menu", "#clients-menu", "#projects-menu", "#boards-menu"];
	menus.forEach(setupMenu);
	
});
