(function(exports) {

var extend = function(Promise) {

	var slice = Array.prototype.slice;

	Promise.all = function(array) {
		var values = [];
		var promise = new Promise();
		var counter = array.length;
		var done = false;
		for (var i = 0, l = array.length; i < l; i++) {
			var item = array[i];
			if (!(item instanceof Promise)) {
				var _item = new Promise();
				_item.fulfill(item);
				item = _item;
			}
			item.then(function(object) {
				if (done) return;
				values.push(object);
				if (values.length !== counter) return;
				done = true;
				promise.resolve(values);
			}, function(error) {
				if (done) return;
				done = true;
				promise.fail(error);
			});
		}
		return promise;
	};

	Promise.prototype.rescue = function(failedHandler) {
		return this.then(null, failedHandler);
	};

	Promise.prototype.get = function(propery) {
		var promise = new Promise();
		this.then(function(object) {
			promise.fulfill(object[property]);
		}, function(error) {
			promise.fail(error);
		});
		return promise;
	};

	Promise.prototype.call = function(method) {
		var args = slice.call(arguments, 1);
		var promise = new Promise();
		this.then(function(object) {
			try { promise.fulfill(object[method].apply(object, args)); }
			catch (e) { promise.fail(e); }
		}, function(error) {
			promise.fail(error);
		});
		return promise;
	};

};

if (typeof exports.Promise == 'function') extend(this.Promise);
exports.extend = extend;

})(typeof exports != 'undefined' ? exports : this);
