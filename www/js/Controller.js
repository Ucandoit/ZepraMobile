ZepraMobile.controller = function($, dataContext) {

	// selectors
	var userEditorSelector = "#user-editor";
	var codeEditorSelector = "#code-editor";
	var rppsEditorSelector = "#rpps-editor";
	var saveLoginCheckboxSelector = "#save-login-checkbox";
	var getCodeButtonSelector = "#get-code-button";
	var connectButtonSelector = "#connect-button";
	var refreshButtonSelector = "#refresh-button";
	var exchangesListContentSelector = "#exchanges-list-content";
	var exchangeReceptionDateEditorSelector = "#exchange-reception-date-editor";
	var exchangeAuthorEditorSelector = "#exchange-author-editor";
	var exchangePatientEditorSelector = "#exchange-patient-editor";
	var exchangeHealthStructureEditorSelector = "#exchange-health-structure-editor";
	var documentsListContentSelector = "#documents-list-content";
	var errorDialogSelector = "#error-dialog";
	var errorDialogContent = "#error-dialog-content";
	var pushNotificationSelector = "#flip-push-notification";

	// ids
	var loginPageId = "login-page";
	var optionPageId = "option-page";
	var exchangesListPageId = "exchanges-list-page";
	var exchangePageId = "exchange-page";
	var documentPageId = "document-page";

	// messages
	var noExchangesMsg = "<div>Aucun message</div>";
	var connextionErrorMsg = "<div>La connextion au serveur ne peut pas &ecirc;tre &eacute;tablie. Verifiez votre connextion d'Internet et r&eacute;essayez plus tard.</div>";
	var loginOrCodeErrorMsg = "<div>Le login ou le code SMS n'est pas correct.</div>";
	var loginEmptyMsg = "<div>Le login ne peut pas &ecirc;tre vide.</div>";
	var codeEmptyMsg = "<div>Le code SMS ne peut pas &ecirc;tre vide.</div>";
	var loginInvalidMsg = "<div>Le login contient des caract&egrave;res invalides, il ne doit contenir que des alphabets et des chiffres.</div>";
	var codeInvalidMsg = "<div>Le code SMS contient des caract&egrave;res invalides, il ne doit contenir que des alphabets et des chiffres.</div>";
	var rppsInvalidMsg = "<div>Le rpps contient des caract&egrave;res invalides, il ne doit contenir que des alphabets et des chiffres.</div>";

	// web service url
	var webServiceUrl = "http://10.1.15.14:88/ZepraMobile/DocumentService.svc/";
	// var webServiceUrl = "http://10.0.2.2:50458/DocumentService.svc/";

	/**
	 * set the default login
	 */
	var setSavedLogin = function() {
		var storeStatus = dataContext.getStoreStatus();
		if (storeStatus) {
			var login = dataContext.getLogin();
			$(userEditorSelector).val(login);
			// check the checkbox
			$(saveLoginCheckboxSelector).attr("checked", true);
		}
	};

	/**
	 * render the exchanges list
	 */
	var renderExchangesList = function(exchangesList) {
		console.log("render the exchanges list.");

		var view = $(exchangesListContentSelector);
		var exchangesCount = exchangesList.length;
		view.empty();

		if (exchangesCount === 0) {
			$(noExchangesMsg).appendTo(view);
		} else {
			var i, exchange, exchangeDate, dateGroup = "", liArray = [];
			var ul = $(
					"<ul id=\"exchanges-list\" data-role=\"listview\" data-filter=\"true\" data-filter-placeholder=\"Rechercher\"></ul>")
					.appendTo(view);
			for (i = 0; i < exchangesCount; i++) {
				exchange = exchangesList[i];

				// date divider
				exchangeDate = convertToFrenchDate(exchange.ReceptionDate);
				if (dateGroup !== exchangeDate) {
					liArray.push("<li data-role=\"list-divider\">"
							+ exchangeDate + "</li>");
					dateGroup = exchangeDate;
				}

				var image = exchange.Read ? "email_open.png" : "email.png";
				var divClass = exchange.Read ? "read" : "unread";

				liArray.push("<li class=\"exchange\">"
						+ "<a data-url=\"index.html#exchange-page?exchangeId="
						+ exchange.ExchangeId + "\" href=\"#\">"
						+ "<img class=\"ui-li-icon\" src=\"css/images/" + image
						+ "\">" + "<div class=\"" + divClass + "\">"
						+ "<div class=\"li-exchange\"> De: "
						+ exchange.ExchangeId + exchange.AuthorName + "</div>"
						+ "<div class=\"li-exchange\"> Patient: "
						+ exchange.PatientName + "</div>" + "</div>"
						+ "<span class=\"ui-li-count\">"
						+ exchange.DocumentsMetadata.length + "</span>"
						+ "</a>" + "</li>");
			}
			var listItems = liArray.join("");
			$(listItems).appendTo(ul);
			ul.listview();
		}
	};

	/**
	 * render the selected exchange
	 */
	var renderSelectedExchange = function(exchangeId) {
		console.log("render selected exchange");

		var exchangesList = dataContext.getExchangesList();
		var exchangesCount = exchangesList.length;
		var exchange, i;
		for (i = 0; i < exchangesCount; i++) {
			exchange = exchangesList[i];

			// display the metadatas
			if (exchangeId == exchange.ExchangeId) {
				$(exchangeReceptionDateEditorSelector).text(
						exchange.ReceptionDate);
				$(exchangeAuthorEditorSelector).text(exchange.AuthorName);
				$(exchangePatientEditorSelector).text(exchange.PatientName);
				$(exchangeHealthStructureEditorSelector).text(
						exchange.HealthStructureName);

				// display the documents field
				var documentsView = $(documentsListContentSelector);
				documentsView.empty();
				var documentsCount = exchange.DocumentsMetadata.length;
				$(
						"<label for=\"documents-list\">Pi&egrave;ces jointes:</label>")
						.appendTo(documentsView);
				var ul = $(
						"<ul id=\"documents-list\" data-role=\"listview\" data-inset=\"true\"></ul>")
						.appendTo(documentsView);
				var j, document, liArray = [];
				for (j = 0; j < documentsCount; j++) {
					document = exchange.DocumentsMetadata[j];
					var url = "http://10.1.15.14:88/ZepraMobilePDF/Default.aspx?guid="
							+ document.Guid + "&localId=" + document.LocalId
							+ "&siteId=" + document.SiteId;
					liArray.push("<li>" + "<a data-url=\"" + url + "\" href=\""
							+ url + "\" data-role=\"button\">Document "
							+ (j + 1) + "</a>" + "</li>");
				}
				var listItems = liArray.join("");
				$(listItems).appendTo(ul);
				ul.listview();
				break;
			}
		}
	};

	/**
	 * display the error dialog
	 */
	var displayErrorDialog = function(errorMsg) {
		$(errorDialogContent).empty().append(errorMsg);
		$.mobile.changePage(errorDialogSelector);
	};

	/**
	 * tell the server that the device unregisters for push notification
	 */
	var unregisterFromServer = function(deviceId) {
		var ws = new WebServiceCaller(webServiceUrl);
		ws.onDone = function() {
			if (ws.result === "Error") {
				displayErrorDialog(connextionErrorMsg);
				// set back the slider
				$(pushNotificationSelector).val("on").slider("refresh");
			}
		};
		ws.call("UnregisterForPushNotification", '{"deviceId":"' + deviceId
				+ '"}', true);
	};

	/**
	 * tell the server that the device registers for push notification
	 */
	var registerToServer = function(deviceId, registerId) {
		var ws = new WebServiceCaller(webServiceUrl);
		ws.onDone = function() {
			if (ws.result === "Error") {
				displayErrorDialog(connextionErrorMsg);
				// set back the slider
				$(pushNotificationSelector).val("off").slider("refresh");
			}
		};
		ws.call("RegisterForPushNotification", '{"deviceId":"' + deviceId
				+ '","registerId":"' + registerId + '"}', true);
	};

	/**
	 * mark the exchange as read
	 */
	var markAsRead = function(login, rpps, exchangeId) {
		var ws = new WebServiceCaller(webServiceUrl);
		ws.onDone = function() {
			console.log(ws.result);
		};
		ws.call("MarkAsRead", '{"login":"' + login + '","rpps":"' + rpps
				+ '","exchangeId":"' + exchangeId + '"}', true);
	};

	/**
	 * get the code SMS
	 */
	var getCodeFromServer = function(login) {
		var ws = new WebServiceCaller(webServiceUrl);
		ws.onDone = function() {
			if (ws.result === "Error") {
				displayErrorDialog(connextionErrorMsg);
			}
		};
		ws.call("GetOTP", '{"login":"' + login + '"}', true);
	};

	/**
	 * try to connect to the server.
	 */
	var connectToServer = function(login, code, rpps, deviceId, success, fail) {
		var ws = new WebServiceCaller(webServiceUrl);
		ws.onDone = function() {
			if (ws.result !== "Error") {
				// parse to json object
				eval('var data = ' + ws.result + ';');
				var exchangesList = data.GetDocumentsMetadataResult;
				if (exchangesList) {
					success(exchangesList);
				} else {
					console.log("login or code SMS false.");
					fail(loginOrCodeErrorMsg);
				}
			} else {
				console.log("can't connect to the server.");
				fail(connextionErrorMsg);
			}
		};
		ws.call("GetDocumentsMetaData", '{"login":"' + login + '","smsCode":"'
				+ code + '","rpps":"' + rpps + '","deviceId":"' + deviceId
				+ '"}', true);
	};

	/**
	 * event fired on refresh button tapped
	 */
	var onRefreshButtonTapped = function() {
		console.log("refreshButton tapped");

		var login = $(userEditorSelector).val();
		var code = $(codeEditorSelector).val();
		var rpps = $(rppsEditorSelector).val();

		connectToServer(login, code, rpps, "", onConnexionSuccess,
				onConnexionFail);
	};

	/**
	 * event fired on GetCode button tapped
	 */
	var onGetCodeButtonTapped = function() {
		console.log("getCodeButton tapped");

		// validation
		var login = $(userEditorSelector).val();

		if (login == "") {
			console.log("login vide");
			displayErrorDialog(loginEmptyMsg);
			return;
		}
		if (!validate(login)) {
			console.log("login invalide");
			displayErrorDialog(loginInvalidMsg);
			return;
		}

		getCodeFromServer(login);
	};

	/**
	 * call back when connexion succeeds.
	 */
	var onConnexionSuccess = function(exchangesList) {
		$.mobile.changePage("#" + exchangesListPageId);
		dataContext.setExchangesList(exchangesList);
		renderExchangesList(exchangesList);
	};

	/**
	 * call back when connexion fails.
	 */
	var onConnexionFail = function(errorMsg) {
		displayErrorDialog(errorMsg);
	};

	/**
	 * event fired on Connect button tapped
	 */
	var onConnectButtonTapped = function() {
		console.log("connectButton tapped");

		// validation
		var login = $(userEditorSelector).val();
		var code = $(codeEditorSelector).val();
		var rpps = $(rppsEditorSelector).val();

		if (login == "") {
			console.log("login vide");
			displayErrorDialog(loginEmptyMsg);
			return;
		}
		if (code == "") {
			console.log("code vide");
			displayErrorDialog(codeEmptyMsg);
			return;
		}
		if (!validate(login)) {
			console.log("login invalide");
			displayErrorDialog(loginInvalidMsg);
			return;
		}
		if (!validate(code)) {
			console.log("code invalide");
			displayErrorDialog(codeInvalidMsg);
			return;
		}
		if (!validate(rpps)) {
			console.log("rpps invalide");
			displayErrorDialog(rppsInvalidMsg);
			return;
		}

		// save the login if the checkbox is checked, else clear the saved login
		if ($(saveLoginCheckboxSelector).is(":checked")) {
			dataContext.setStoreStatus(true);
			dataContext.setLogin($(userEditorSelector).val());
		} else {
			dataContext.setStoreStatus(false);
			dataContext.setLogin("");
		}

		// save the rpps
		dataContext.setRpps(rpps);

		connectToServer(login, code, rpps, device.uuid, onConnexionSuccess,
				onConnexionFail);
	};

	/**
	 * event fired on page changed
	 */
	var onPageChange = function(event, data) {
		var toPageId = data.toPage.attr("id");
		var fromPageId = "";
		if (data.options.fromPage) {
			fromPageId = data.options.fromPage.attr("id");
		}
		console.log("PageChange event fired! From page: " + fromPageId
				+ " to page: " + toPageId);

		switch (toPageId) {
		case exchangesListPageId:
			break;
		case loginPageId:
			if (fromPageId === "") {
				setSavedLogin();
				$(rppsEditorSelector).val(dataContext.getRpps());
				$(pushNotificationSelector).val(
						dataContext.getPushStatus() ? "on" : "off");
			} else if (fromPageId === optionPageId) {
				dataContext
						.setPushStatus($(pushNotificationSelector).val() == "on");
			}
			break;
		case exchangePageId:
			break;
		case documentPageId:
			break;
		case optionPageId:
			break;
		}
	};

	/**
	 * event fired on exchange tapped
	 */
	var onExchangeTapped = function() {
		console.log("exchange tapped");

		var login = $(userEditorSelector).val();
		var rpps = $(rppsEditorSelector).val();
		var url = $(this).find("a").attr("data-url");
		var exchangeId = url.split("?")[1].split("=")[1];

		var img = $(this).find("img");
		var unread = img.attr("src") == "css/images/email.png";
		var div = $(this).find("div[class=unread]");

		// if the exchange is not read, then mark it as read
		if (div != null && unread) {
			img.attr("src", "css/images/email_open.png");
			div.removeClass("unread").addClass("read");
			//markAsRead(login, rpps, exchangeId);
		}

		$.mobile.changePage("#" + exchangePageId);
		renderSelectedExchange(exchangeId);
	};

	var pushSuccess = function() {
	};

	var pushFail = function() {
	};

	/**
	 * Callback function from the plugin
	 */
	var pushEvent = function(e) {
		console.log("javascript called by PushNotificationPlugin");

		var deviceId = device.uuid;

		switch (e.event) {
		case "error":
			// reset the slider
			$(pushNotificationSelector).val(
					$(pushNotificationSelector).val() == "on" ? "off" : "on")
					.slider("refresh");
			displayErrorDialog("<div>Echec d'inscription : " + e.msg + "</div>");
			break;
		case "registered":
			console.log("register to server: [device id:" + deviceId
					+ ",registered id:" + e.regid + "]");
			registerToServer(deviceId, e.regid);
			break;
		case "unregistered":
			console.log("unregister from server: [device id:" + deviceId + "]");
			unregisterFromServer(deviceId);
			break;
		}
	};

	/**
	 * Event fired when the slider is changed
	 */
	var onPushNotificationChanged = function() {
		console.log("slider changed");

			if ($(this).val() == "on") {
				// register
				//window.plugins.PushNotification.register("xzdykerik@gmail.com","ZepraMobile.controller.pushEvent", pushSuccess,pushFail);
			} else {
				// unregister
				//window.plugins.PushNotification.unregister(pushSuccess,pushFail);
			}

	};

	/**
	 * initialize all events
	 */
	var init = function() {
        //$.mobile.defaultPageTransition = "flip";
		$(document).bind("pagechange", onPageChange);
		$(document).delegate(connectButtonSelector, "tap",
				onConnectButtonTapped);
		$(document).delegate(getCodeButtonSelector, "tap",
				onGetCodeButtonTapped);
		$(document).delegate(refreshButtonSelector, "tap",
				onRefreshButtonTapped);
		$(document).delegate(".exchange", "tap", onExchangeTapped);
		$(document).delegate(pushNotificationSelector, "change",
				onPushNotificationChanged);
	};

	/**
	 * public function
	 */
	return {
		init : init,
		pushEvent : pushEvent
	};

}(jQuery, ZepraMobile.dataContext);

$(document).bind("mobileinit", function() {
	ZepraMobile.controller.init();
});
