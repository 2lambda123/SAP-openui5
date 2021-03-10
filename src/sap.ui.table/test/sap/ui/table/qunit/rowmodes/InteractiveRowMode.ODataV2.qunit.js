/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV2",
	"sap/ui/table/rowmodes/InteractiveRowMode",
	"sap/ui/model/odata/v2/ODataListBinding"
], function(TableQUnitUtils, InteractiveRowMode, ODataListBinding) {
	"use strict";

	QUnit.module("Get contexts", {
		before: function() {
			this.oMockServer = TableQUnitUtils.startMockServer();
			this.oDataModel = TableQUnitUtils.createODataModel();
			this.oGetContextsSpy = sinon.spy(ODataListBinding.prototype, "getContexts");

			return this.oDataModel.metadataLoaded();
		},
		beforeEach: function() {
			this.oGetContextsSpy.reset();
		},
		afterEach: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
		},
		after: function() {
			this.oMockServer.destroy();
			this.oDataModel.destroy();
			this.oGetContextsSpy.restore();
		},
		createTable: function(oModel) {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new InteractiveRowMode(),
				rows: {path : "/Products"},
				models: oModel ? oModel : this.oDataModel
			});

			return this.oTable;
		}
	});

	QUnit.test("Initialization if metadata not yet loaded", function(assert) {
		var oTable = this.createTable(TableQUnitUtils.createODataModel(null, true));
		var oGetContextsSpy = this.oGetContextsSpy;
		var pReady = oTable.qunit.whenBindingChange()
						   .then(oTable.qunit.whenRenderingFinished);

		// render, refreshRows, updateRows
		return pReady.then(function() {
			assert.equal(oGetContextsSpy.callCount, 3, "Binding#getContexts called 3 times");
			assert.ok(oGetContextsSpy.alwaysCalledWithExactly(0, 10, 100, undefined), "All calls to Binding#getContexts consider the row count");
		});
	});

	QUnit.test("Initialization if metadata already loaded", function(assert) {
		var oTable = this.createTable();
		var oGetContextsSpy = this.oGetContextsSpy;
		var pReady = oTable.qunit.whenBindingChange()
						   .then(oTable.qunit.whenRenderingFinished);

		// refreshRows, render, updateRows
		return pReady.then(function() {
			assert.equal(oGetContextsSpy.callCount, 3, "Binding#getContexts called 3 times");
			assert.ok(oGetContextsSpy.alwaysCalledWithExactly(0, 10, 100, undefined), "All calls to Binding#getContexts consider the row count");
		});
	});
});
