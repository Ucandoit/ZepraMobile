var targetPlatform = "iOS";
//var targetPlatform = "Android";

/**
 * convert the date string to French format
 */
var convertToFrenchDate = function(dateString) {
	// invert month and day, the format must be MM/dd/yyyy, if not, the
	// string is invalid
	var dateArray = dateString.split("/");
	var date = new Date(dateArray[1] + "/" + dateArray[0] + "/" + dateArray[2]);
	var day = [ "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi",
			"Dimanche" ];
	var month = [ "janv.", "f&eacute;vr.", "mars", "avr.", "mai", "juin",
			"juill.", "ao&ucirc;t", "sept.", "oct.", "nov.", "d&eacute;c." ];
	var frenchDate = day[date.getDay()] + " " + date.getDate() + " "
			+ month[date.getMonth()] + " " + date.getFullYear();
	return frenchDate;
};

/**
 * return false if the field contains non alphanumerical character
 */
var validate = function(field) {
	var re = /[^a-zA-Z0-9]/;
	return !re.test(field);
};