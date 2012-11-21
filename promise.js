(function(exports) {

	var slice = Array.prototype.slice;
	var states = {UNFULFILLED: 0, FULFILLED: 1, FAILED: 2};

	function Promise() {
		this._state = states.UNFULFILLED;
		this._value = null;
		this._handlers = [];
	}

	Promise.defer = typeof process != 'undefined' ? process.nextTick : function(fn) {
		setTimeout(fn, 0);
	};

	Promise.prototype.fulfill = function(value) {
		var self = this;
		if (this._state) return;
		this._value = value;
		this._state = states.FULFILLED;
		Promise.defer(function() { self._runHandlers(); });
		return;
	};

	Promise.prototype.fail = function(error) {
		var self = this;
		if (this._state) return;
		this._value = error;
		this._state = states.FAILED;
		Promise.defer(function() { self._runHandlers(); });
		return;
	};

	Promise.prototype.then = function(fulfilledHandler, failedHandler) {
		var self = this;
		var promise = new Promise();
		this._handlers.push({
			fulfilled: fulfilledHandler,
			failed: failedHandler,
			promise: promise
		});
		if (this._state !== states.UNFULFILLED)
			Promise.defer(function() { self._runHandlers(); });
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

	Promise.prototype.pipe = function(promise) {
		this.then(function(value) {
			promise.fulfill(value);
		}, function(error) {
			promise.fail(error);
		});
		return this;
	};

	Promise.prototype._runHandlers = function() {
		var value = this._value;
		if (this._state == states.UNFULFILLED) return;
		var fulfilled = this._state === states.FULFILLED;
		var handlers = this._handlers.splice(0);
		for (var i = 0, l = handlers.length; i < l; i++) {
			var handler = handlers[i];
			var callback = handler[fulfilled ? 'fulfilled' : 'failed'];
			var promise = handler.promise;
			if (!callback) {
				if (fulfilled) promise.fulfill(value);
				else promise.fail(value);
				continue;
			}
			try {
				var returnValue = callback(value);
			} catch (e) {
				promise.fail(e);
				continue;
			}
			if (returnValue instanceof Promise) {
				returnValue.pipe(promise);
			} else {
				if (!fulfilled && returnValue === undefined) {
					promise.fail(returnValue);
				} else {
					promise.fulfill(returnValue);
				}
			}
		}
	};

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

	exports.Promise = Promise;

})(typeof exports != 'undefined' ? exports : this);
