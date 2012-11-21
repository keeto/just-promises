var Promise = require('./promise').Promise;

exports.fulfilled = function(value) {
	var promise = new Promise();
	promise.fulfill(value);
	return promise;
};

exports.rejected = function(error) {
	var promise = new Promise();
	promise.fail(error);
	return promise;
};

exports.pending = function() {
	var promise = new Promise();
	return {
		promise: promise,
		fulfill: promise.fulfill.bind(promise),
		reject: promise.fail.bind(promise)
	};
};
