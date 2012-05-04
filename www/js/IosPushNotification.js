var IosPushNotification = function() {
};

IosPushNotification.prototype.register = function(successCallback, failureCallback) {
	return PhoneGap.exec(successCallback, failureCallback,
			"PushNotificationPlugin", "registerPush",
			["ZepraMobile.controller.pushEvent"]);
};

PhoneGap.addConstructor(function() {
    if (!window.plugins)
    {
        window.plugins = {};
    }
    window.plugins.PushNotification = new IosPushNotification();
});