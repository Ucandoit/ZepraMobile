function WebServiceCaller(url) {
	this.url = url;
	this.result = "";
}

// call async
WebServiceCaller.prototype.onDone = function() {
};

WebServiceCaller.prototype.call = function(methodName, body, async) {
	var client = new XMLHttpRequest();
	client.open("POST", this.url + methodName, async);
	
	// set timeout for the request
	setTimeout(function() {
		console.log("timeout");
		client.abort();
	}, 20000);
	
	client.setRequestHeader("Content-type", "application/json");
	
	var parentThis = this;
	
	client.onreadystatechange = function() {
		if (client.readyState == 4) {
			//this refers to variable client here, that's why we need to use parentThis instead
			if (client.status == 200) {
				console.log("get response");
				parentThis.result = client.responseText;
			} else {
				console.log(client.status+client.responseText);
				parentThis.result = "Error";
			}
			if (parentThis.onDone && typeof (parentThis.onDone) == "function") {
				parentThis.onDone();
			}
		}
	};
	client.send(body);
};