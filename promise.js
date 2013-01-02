(function(exports) {

	var states = {UNFULFILLED: 0, FULFILLED: 1, FAILED: 2};

	function Promise() {
		this._state = states.UNFULFILLED;
		this._value = null;
		this._handlers = [];
	}

	Promise.defer = typeof process != 'undefined' && process.nextTick ? process.nextTick : function(fn) {
		setTimeout(fn, 0);
	};

	Promise.prototype.fulfill = function(value) {
		var self = this;
		if (this._state !== states.UNFULFILLED) return;
		this._value = value;
		this._state = states.FULFILLED;
		Promise.defer(function() { self._runHandlers(); });
		return;
	};

	Promise.prototype.fail = function(error) {
		var self = this;
		if (this._state !== states.UNFULFILLED) return;
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

	exports.Promise = Promise;

})(typeof exports != 'undefined' ? exports : this);
