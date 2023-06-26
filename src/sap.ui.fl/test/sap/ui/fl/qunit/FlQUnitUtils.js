sap.ui.define([], function() {
	"use strict";

	var FlQUnitUtils = {};

	/**
	 * Stubs the function sap.ui.require. The aStubInformation property expects an object with the following properties:
	 * name: this path will be stubbed in the sap.ui.require. Can be a string (sync request) or array
	 * stub: the new return value for that path. Can be an object directly or an array in case of multiple paths
	 * error: only valid for async case. If set the error function is used instead of the success function
	 *
	 * @param {object} sandbox - Sinon or sandbox instance
	 * @param {object[]} aStubInformation - Information about the needed stubs
	 * @returns {object} The stub
	 */
	FlQUnitUtils.stubSapUiRequire = function(sandbox, aStubInformation) {
		var oRequireStub = sandbox.stub(sap.ui, "require");
		aStubInformation.forEach(function(oStubInformation) {
			oRequireStub
			.withArgs(oStubInformation.name)
			.callsFake(function(sModuleName, fnSuccess, fnError) {
				// the function can be called synchronously, then there is no success / error function
				// and the stub has to be returned directly
				if (!fnSuccess) {
					return oStubInformation.stub;
				}
				if (oStubInformation.error) {
					fnError(oStubInformation.stub);
				} else {
					fnSuccess(oStubInformation.stub);
				}
			});
		});
		oRequireStub.callThrough();
		return oRequireStub;
	};

	/**
	 * Stubs the sap.ui.require function and calls the check function with every path that is requested.
	 * If that function returns true the call is stubbed and the passed stub is returned.
	 * Otherwise the original require function is called.
	 *
	 * @param {object} sandbox - Sinon or sandbox instance
	 * @param {function} fnCheck - Check function
	 * @param {object} oStub - Stub to be returned by sap.ui.define
	 * @returns {object} The Stub
	 */
	FlQUnitUtils.stubSapUiRequireDynamically = function(sandbox, fnCheck, oStub) {
		var oRequireStub = sandbox.stub(sap.ui, "require");
		oRequireStub.callsFake(function(vModuleName, fnSuccess) {
			if (fnCheck(vModuleName)) {
				if (oStub) {
					fnSuccess(oStub);
				} else {
					fnSuccess();
				}
			} else {
				oRequireStub.wrappedMethod.apply(this, arguments);
			}
		});
		return oRequireStub;
	};

	/**
	 * Returns a stub handler to be used with callsFake
	 * It will return a promise which will resolve after a timeout of 0
	 * This ensures that all microtasks like resolved promise handlers would be processed before
	 * and allows testing that the result is properly awaited
	 * Additionally it does not allow concurrent calls while the promise has not resolved
	 *
	 * @param {object} assert - QUnit Assert
	 * @param {any} [result] - Optional result to resolve with
	 * @returns {function} The stub function
	 */
	FlQUnitUtils.resolveWithDelayedCallWhichMustNotBeInParallel = function(assert, result) {
		var inProgress = false;
		return function() {
			return new Promise(function(resolve) {
				// Delay resolution to simulate a slow call
				assert.notOk(inProgress, "Should not do concurrent calls but wait for each other");
				inProgress = true;
				setTimeout(function() {
					inProgress = false;
					resolve(result);
				}, 0);
			});
		};
	};

	return FlQUnitUtils;
});
