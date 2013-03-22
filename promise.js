(function(exports) {

	var states = {UNFULFILLED: 0, FULFILLED: 1, FAILED: 2};

	function pipe(first, second) {
		first.then(function(object) {
			second.fulfill(object);
		}, function(error) {
			second.fail(error);
		});
	}

	function Promise() {
		this._state = states.UNFULFILLED;
		this._value = null;
		this._handlers = [];
		this._deferred = false;
	}

	Promise.defer = typeof process !== 'undefined' &&
		typeof process.nextTick === 'function'
			? process.nextTick
			: function(fn) { setTimeout(fn, 0); };

	Promise.prototype.fulfill = function(value) {
		var self = this;
		if (this._state !== states.UNFULFILLED) return;
		this._value = value;
		this._state = states.FULFILLED;
		if (!this._deferred) {
			Promise.defer(function() { self._runHandlers(); });
			this._deferred = true;
		}
		return;
	};

	Promise.prototype.fail = function(error) {
		var self = this;
		if (this._state !== states.UNFULFILLED) return;
		this._value = error;
		this._state = states.FAILED;
		if (!this._deferred) {
			Promise.defer(function() { self._runHandlers(); });
			this._deferred = true;
		}
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
		if (this._state !== states.UNFULFILLED && !this._deferred) {
			Promise.defer(function() { self._runHandlers(); });
			this._deferred = true;
		}
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
		this._deferred = false;
		var value = this._value;
		if (this._state == states.UNFULFILLED) return;
		var fulfilled = this._state === states.FULFILLED;
		var handlers = this._handlers.splice(0);
		for (var i = 0, l = handlers.length; i < l; i++) {
			var handler = handlers[i];
			var callback = handler[fulfilled ? 'fulfilled' : 'failed'];
			var promise = handler.promise;
			if (!callback || typeof callback != 'function') {
				if (value && typeof value.then == 'function') {
					pipe(value, promise);
				} else {
					if (fulfilled) {
						promise.fulfill(value);
					} else {
						promise.fail(value);
					}
				}
				continue;
			}
			try {
				var returnValue = callback(value);
			} catch (e) {
				promise.fail(e);
				continue;
			}
			if (returnValue && typeof returnValue.then == 'function') {
				pipe(returnValue, promise);
			} else {
				promise.fulfill(returnValue);
			}
		}
	};

	exports.Promise = Promise;

})(typeof exports != 'undefined' ? exports : this);
