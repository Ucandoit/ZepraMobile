ZepraMobile.controller = function($, dataContext) {

	// selectors
	var userEditorSelector = "#user-editor";
	var codeEditorSelector = "#code-editor";
	var rppsEditorSelector = "#rpps-editor";
	var emailEditorSelector = "#email-editor";
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
    var loadImageSelector = "#load-image";

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
	var webServiceUrl = "http://ext1.sword-group.com/ZepraMobile/DocumentService.svc/";
	//var webServiceUrl = "http://10.0.2.2:50458/DocumentService.svc/";
	var pdfUrlPrefix = "http://ext1.sword-group.com/ZepraMobilePDF/Default.aspx";

	/**
	 * render the exchanges list
	 */
	var renderExchangesList = function(exchangesList) {
		console.log("render the exchanges list.");

		var view = $(exchangesListContentSelector);
        view.empty();
		
        var exchangesCount = exchangesList.length;
		
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

			if (exchangeId == exchange.ExchangeId) {
                // display the metadatas
				$(exchangeReceptionDateEditorSelector).text(
						exchange.ReceptionDate);
				$(exchangeAuthorEditorSelector).text(exchange.AuthorName);
				$(exchangePatientEditorSelector).text(exchange.PatientName);
				$(exchangeHealthStructureEditorSelector).text(
						exchange.HealthStructureName);

				// display the documents list
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
					var url = pdfUrlPrefix + "?guid=" + document.Guid
							+ "&localId=" + document.LocalId + "&siteId="
							+ document.SiteId;
					liArray
							.push("<li class=\"document-link\">"
									+ "<a href=\""
									+ url
									+ "\" data-url=\"" + url + "\" data-role=\"button\">Document "
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
	var getCodeFromServer = function(login, email) {
		var ws = new WebServiceCaller(webServiceUrl);
		ws.onDone = function() {
			if (ws.result === "Error") {
				displayErrorDialog(connextionErrorMsg);
			}
		};
		ws.call("GetOTP", '{"login":"' + login + '","email":"' + email + '"}',
				true);
	};

	/**
	 * try to connect to the server.
	 */
	var connectToServer = function(login, code, rpps, deviceId, success, fail) {
        
        $(loadImageSelector).show();
        
		var ws = new WebServiceCaller(webServiceUrl);
		ws.onDone = function() {
			if (ws.result !== "Error") {
				var exchangesList = ws.result.GetDocumentsMetadataResult;
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
            $(loadImageSelector).hide();
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
		var email = $(emailEditorSelector).val();

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

		dataContext.setEmail(email);
		getCodeFromServer(login, email);
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
				$(emailEditorSelector).val(dataContext.getEmail());
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
			// markAsRead(login, rpps, exchangeId);
		}

		$.mobile.changePage("#" + exchangePageId);
		renderSelectedExchange(exchangeId);
	};

	var pushSuccess = function() {
	};

	var pushFail = function(e) {
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
            // register to urban airship
            registerUA(e.regid);
            
			break;
		case "unregistered":
			console.log("unregister from server: [device id:" + deviceId + "]");
			unregisterFromServer(deviceId);
			break;
		}
	};
    
    var registerUA = function(deviceToken){
        var request = new XMLHttpRequest();
        var appKey = "F6PvqT5hRuGylaBt9obOdw";
        var appSecret = "0wCR6t1fTqiOv2aWoK6PzQ";
        
        // open the client and encode our URL
        request.open("PUT", "https://go.urbanairship.com/api/device_tokens/"+deviceToken, true, appKey, appSecret);
        
        // callback when request finished
        request.onload = function() {
            
            if(this.status == 200 || this.status == 201) {
                // register UA push success
                console.log("UA push service successfully registered.");
            } else {
                // error
                console.log("Error when registering UA push service.<br>error: "+this.statusText);
            }
        };
        request.send();
        
    }

	/**
	 * Event fired when the slider is changed
	 */
	var onPushNotificationChanged = function() {
		console.log("slider changed");

		if ($(this).val() == "on") {
			// register
            if (targetPlatform === "iOS"){
                window.plugins.PushNotification.register(pushSuccess,pushFail);
            }else{
                window.plugins.PushNotification.register("xzdykerik@gmail.com",
                        "ZepraMobile.controller.pushEvent", null, null /*pushSuccess, pushFail*/);
            }
		} else {
			// unregister
            if (targetPlatform === "iOS"){
                var deviceId = device.uuid;
                unregisterFromServer(deviceId);
            }else{
                window.plugins.PushNotification.unregister(
                        "ZepraMobile.controller.pushEvent", null, null /*pushSuccess, pushFail*/);
            }
		}
	};

    /**
     * Used to test the push notification
     */
	var onPushTapped = function() {
		console.log("push tapped");

        var deviceId = device.uuid;
        var ws = new WebServiceCaller(webServiceUrl);
        ws.onDone = function() {
            if (ws.result === "Error") {
                displayErrorDialog(connextionErrorMsg);
            }
            if (!ws.result.TestSendPushNotificationResult){
                displayErrorDialog("<div>Not registered</div>");
            }
        };
        ws.call("TestSendPushNotification", '{"deviceId":"' + deviceId + '"}',
                true);    
		
	};
    
    // 
    var onDocumentLinkTapped = function(e) {
        console.log("document tapped");
        
        e.preventDefault();
        
        var url = $(this).find("a").attr("data-url");
        var ch=ChildBrowser.install();
        window.plugins.childBrowser.showWebPage(url);
    }

	/**
	 * initialize all events
	 */
	var init = function() {
		// $.mobile.defaultPageTransition = "none";
		$.support.cors = true;
		$.mobile.allowCrossDomainPages = true;
		$(document).bind("pagechange", onPageChange);
		$(document).delegate(connectButtonSelector, "click",
				onConnectButtonTapped);
		$(document).delegate(getCodeButtonSelector, "tap",
				onGetCodeButtonTapped);
		$(document).delegate(refreshButtonSelector, "tap",
				onRefreshButtonTapped);
		$(document).delegate(".exchange", "tap", onExchangeTapped);
        if (targetPlatform === "iOS"){
            $(document).delegate(".document-link", "tap", onDocumentLinkTapped);
        }
		$(document).delegate(pushNotificationSelector, "change",
				onPushNotificationChanged);
		$(document).delegate("#push-button", "click", onPushTapped);
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
