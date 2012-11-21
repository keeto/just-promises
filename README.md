Almost
======

A barebones implementation of the [CommonJS Promises/A proposal][promise-a].


Features
--------

- Contains just the bare-minumum stuff needed to comply with the Promises/A proposal.
- Passes all the tests from the [Promise-Tests project][promise-tests].
- Assured asynchronousity, no need to worry about resolution race-conditions.
- Implemented as a JavaScript class and supports quick extensibility.
- Extras for those who really want them.


Usage
-----

The library exposes a single class called `Promise`. To create a new promise, simply create a new instance of this class:

	var promise = new Promise();

The value of a promise can be fulfilled using the `fulfill` method:

	var promise = new Promise();
	promise.fulfill('Hello'); // the promise is now resolved.

A promise can be failed using the `fail` method:

	var promise = new Promise();
	promise.fail(new Error()); // the promise is now failed.

As directed by the Promise/A spec, all promises have a `then` method that accepts three callbacks: a fulfilled callback, a fail callback and a progress callback--all of them optional.

	var promise = new Promise();
	promise.then(fulfilledFn, failFn, progressFn);

The fulfilled and the fail callbacks are called when the promise is fulfilled or failed, respectively. Progress handlers are, consciously, ignored for now.

There is only one "utility" method included in the main library called `join`. This method can be used to pipe the results of one promise to another.

	var promiseA = new Promise();
	promiseA.then(function(value) {
		console.log(value); // logs 'Hello'
	});

	var promiseB = new Promise();
	promiseB.fulfill('Hello');

	promiseB.join(promiseA);


Copyright and License
---------------------

Copyright 2012, Mark "Keeto" Obcena <keetology.com>. Released under an MIT-Style License.

[promise-a]: http://wiki.commonjs.org/wiki/Promises/A
[promise-tests]: https://github.com/domenic/promise-tests
