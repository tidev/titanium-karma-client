const http = {
	getString: url => {
		return new Promise((resolve, reject) => {
			var client = Ti.Network.createHTTPClient({
				onload: function () {
					resolve(this.responseText);
				},
				onerror: e => {
					reject(e.error);
				}
			});
			client.open('GET', url);
			client.send();
		});
	},

	getJson: url => {
		return http.getString(url)
			.then(responseText => {
				try {
					return JSON.parse(responseText);
				} catch (e) {
					return e;
				}
			});
	}
};

export default http;
