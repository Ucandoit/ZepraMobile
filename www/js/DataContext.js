var ZepraMobile = ZepraMobile || {};

ZepraMobile.dataContext = function($) {

	var exchangesList = [];
	var exchangesListStorageKey = "ExchangesList";
	var loginKey = "ZepraLogin";
	var storeStatusKey = "ZepraStoreStatus";
	var rppsKey = "ZepraRpps";
	var pushStatusKey = "ZepraPushNotification";

	var loadExchangesFromLocalStorage = function() {
		var storedExchanges = $.jStorage.get(exchangesListStorageKey);
		if (storedExchanges != null) {
			exchangesList = storedExchanges;
		}
	};

	var saveExchangesToLocalStorage = function() {
		$.jStorage.set(exchangesListStorageKey, exchangesList);
	};

	var getExchangesList = function() {
		return exchangesList;
	};

	var setExchangesList = function(list) {
		exchangesList = list;
	};

	var getLogin = function() {
		var storedLogin = $.jStorage.get(loginKey);
		if (storedLogin != null) {
			return storedLogin;
		}
		return "";
	};

	var setLogin = function(login) {
		$.jStorage.set(loginKey, login);
	};

	var setStoreStatus = function(bool) {
		$.jStorage.set(storeStatusKey, bool);
	};

	var getStoreStatus = function() {
		var storeStatus = $.jStorage.get(storeStatusKey);
		if (storeStatus != null) {
			return storeStatus;
		}
		return false;
	};

	var setRpps = function(rpps) {
		$.jStorage.set(rppsKey, rpps);
	};

	var getRpps = function() {
		var rpps = $.jStorage.get(rppsKey);
		if (rpps != null) {
			return rpps;
		}
		return "";
	};

	var setPushStatus = function(pushStatus) {
		$.jStorage.set(pushStatusKey, pushStatus);
	};

	var getPushStatus = function() {
		var pushStatus = $.jStorage.get(pushStatusKey);
		if (pushStatus != null) {
			return pushStatus;
		}
		return false;
	};

	return {
		loadExchangesFromLocalStorage : loadExchangesFromLocalStorage,
		saveExchangesToLocalStorage : saveExchangesToLocalStorage,
		getExchangesList : getExchangesList,
		setExchangesList : setExchangesList,
		getLogin : getLogin,
		setLogin : setLogin,
		setStoreStatus : setStoreStatus,
		getStoreStatus : getStoreStatus,
		setRpps : setRpps,
		getRpps : getRpps,
		setPushStatus : setPushStatus,
		getPushStatus : getPushStatus
	};

}(jQuery);