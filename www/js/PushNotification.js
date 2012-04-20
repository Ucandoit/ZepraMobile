var PushNotification = function() {
};

PushNotification.prototype.register = function(senderEmail, eventCallBack,
		successCallback, failureCallback) {
	return PhoneGap.exec(successCallback, failureCallback,
			"PushNotificationPlugin", "register",
			[ senderEmail, eventCallBack ]);
};

PushNotification.prototype.unregister = function(successCallback,
		failureCallback) {
	return PhoneGap.exec(successCallback, failureCallback,
			"PushNotificationPlugin", "unregister", []);
};

PhoneGap.addConstructor(function() {
	PhoneGap.addPlugin("PushNotification", new PushNotification());
});