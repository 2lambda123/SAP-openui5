/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/odata/v2/_CreatedContextsCache",
	"sap/ui/test/TestUtils"
], function (Log, _CreatedContextsCache, TestUtils) {
	/*global QUnit, sinon*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v2._CreatedContextsCache", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		},

		afterEach : function (assert) {
			return TestUtils.awaitRendering();
		}
	});

	//*********************************************************************************************
	QUnit.test("constructor", function (assert) {
		var oCache = new _CreatedContextsCache();

		assert.deepEqual(oCache.mCache, {});
	});

	//*********************************************************************************************
[
	{sListID : "", sPath : "/bar", aResult : []},
	{sListID : "", sPath : "/foo", aResult : ["~oContext1", "~oContext0"]},
	{sListID : "id", sPath : "/foo", aResult : ["~oContextId0"]},
	{sListID : "baz", sPath : "/foo", aResult : []}
].forEach(function (oFixture) {
	var sTitle = "getContexts: " + oFixture.sPath
			+ (oFixture.sListID ? ", sListID=" + oFixture.sListID : "");

	QUnit.test(sTitle, function (assert) {
		var aContexts0, aContexts1,
			oCache = new _CreatedContextsCache();

		oCache.mCache = {
			"/foo" : {"" : ["~oContext1", "~oContext0"], "id" : ["~oContextId0"]}
		};

		// code under test
		aContexts0 = oCache.getContexts(oFixture.sPath, oFixture.sListID);

		// code under test
		aContexts1 = oCache.getContexts(oFixture.sPath, oFixture.sListID);

		assert.deepEqual(aContexts0, oFixture.aResult);
		assert.deepEqual(aContexts1, oFixture.aResult);
		assert.notStrictEqual(aContexts0, aContexts1); // cloned
	});
});

	//*********************************************************************************************
[{
	sListID : "",
	sPath : "/bar",
	oResult : {
		"/bar" : {"" : ["~oNewContext"]},
		"/foo" : {"" : ["~oContext"], "id" : ["~oContextId"]}
	}
}, {
	sListID : "id1",
	sPath : "/bar",
	oResult : {
		"/bar" : {"id1" : ["~oNewContext"]},
		"/foo" : {"" : ["~oContext"], "id" : ["~oContextId"]}
	}
}, {
	sListID : "id1",
	sPath : "/foo",
	oResult : {
		"/foo" : {"" : ["~oContext"], "id" : ["~oContextId"], "id1" : ["~oNewContext"]}
	}
}, {
	sListID : "",
	sPath : "/foo",
	oResult : {
		"/foo" : {"" : ["~oNewContext", "~oContext"], "id" : ["~oContextId"]}
	}
}, {
	sListID : "id",
	sPath : "/foo",
	oResult : {
		"/foo" : {"" : ["~oContext"], "id" : ["~oNewContext", "~oContextId"]}
	}
}].forEach(function (oFixture) {
	var sTitle = "addContext: " + oFixture.sPath
			+ (oFixture.sListID ? ", key=" + oFixture.sListID : "");

	QUnit.test(sTitle, function (assert) {
		var oCache = new _CreatedContextsCache();

		oCache.mCache = {
			"/foo" : {"" : ["~oContext"], "id" : ["~oContextId"]}
		};

		// code under test
		oCache.addContext("~oNewContext", oFixture.sPath, oFixture.sListID);

		assert.deepEqual(oCache.mCache, oFixture.oResult);
	});
});

	//*********************************************************************************************
	QUnit.test("findAndRemoveContext:", function (assert) {
		var oCache = new _CreatedContextsCache(),
			oCacheMock = this.mock(oCache),
			oContext = {};

		oCache.mCache = {
			"/foo" : {"": [{/*any V2 context*/}]},
			"/bar" : {
				"" : [{/*any V2 context*/}, {/*any V2 context*/}],
				"qux" : [{/*any V2 context*/}, oContext, {/*any V2 context*/}]
			}
		};

		oCacheMock.expects("removeContext").never();

		// code under test
		oCache.findAndRemoveContext({/*unknown context*/});

		oCacheMock.expects("removeContext")
			.withExactArgs(sinon.match.same(oContext), "/bar", "qux");

		// code under test
		oCache.findAndRemoveContext(oContext);
	});

	//*********************************************************************************************
[{
	oContext : "~oContext1",
	sListID : "",
	sPath : "/foo",
	oResult : {
		"/baz" : {"" : ["~oContext5"]},
		"/foo" : {"" : ["~oContext2", "~oContext0"], "id" : ["~oContext3"]},
		"/quz" : {"id" : ["~oContext6"]}
	}
}, {
	oContext : "~oContext3",
	sListID : "id",
	sPath : "/foo",
	oResult : {
		"/baz" : {"" : ["~oContext5"]},
		"/foo" : {"" : ["~oContext2", "~oContext1", "~oContext0"]},
		"/quz" : {"id" : ["~oContext6"]}
	}
}, {
	oContext : "~oContext5",
	sListID : "",
	sPath : "/baz",
	oResult : {
		"/foo" : {"" : ["~oContext2", "~oContext1", "~oContext0"], "id" : ["~oContext3"]},
		"/quz" : {"id" : ["~oContext6"]}
	}
}, {
	oContext : "~oContext6",
	sListID : "id",
	sPath : "/quz",
	oResult : {
		"/baz" : {"" : ["~oContext5"]},
		"/foo" : {"" : ["~oContext2", "~oContext1", "~oContext0"], "id" : ["~oContext3"]}
	}
}].forEach(function (oFixture, i) {
	var sTitle = "removeContext: " + oFixture.oContext + " from " + oFixture.sPath
			+ (oFixture.sListID ? ", key=" + oFixture.sListID : "") + "; #" + i;

	QUnit.test(sTitle, function (assert) {
		var oCache = new _CreatedContextsCache();

		oCache.mCache = {
			"/baz" : {"" : ["~oContext5"]},
			"/foo" : {"" : ["~oContext2", "~oContext1", "~oContext0"], "id" : ["~oContext3"]},
			"/quz" : {"id" : ["~oContext6"]}
		};

		// code under test
		oCache.removeContext(oFixture.oContext, oFixture.sPath, oFixture.sListID);

		assert.deepEqual(oCache.mCache, oFixture.oResult);
	});
});

	//*********************************************************************************************
["", "id"].forEach(function (sListID) {
	var sTitle = "integrative: addContext, getContexts, removeContext; sListID='" + sListID + "'";

	QUnit.test(sTitle, function (assert) {
		var oCache = new _CreatedContextsCache();

		// code under test
		assert.deepEqual(oCache.getContexts("/foo", sListID), []);

		// code under test
		oCache.addContext("~oContext0", "/foo", sListID);

		assert.deepEqual(oCache.getContexts("/foo", sListID), ["~oContext0"]);

		// code under test
		oCache.removeContext("~oContext0", "/foo", sListID);

		assert.deepEqual(oCache.getContexts("/foo", sListID), []);
	});
});
});