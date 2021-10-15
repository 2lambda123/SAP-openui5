/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV2",
	"sap/ui/table/rowmodes/AutoRowMode",
	"sap/ui/table/Table",
	"sap/ui/Device"
], function(TableQUnitUtils, AutoRowMode, Table, Device) {
	"use strict";

	var iDeviceHeight = 550;
	var iComputedRequestLength = 22;

	QUnit.module("Get contexts", {
		before: function() {
			this.oMockServer = TableQUnitUtils.startMockServer();
			this.oDataModel = TableQUnitUtils.createODataModel();
			this.oGetContextsSpy = sinon.spy(Table.prototype, "_getContexts");
			this.iOriginalDeviceHeight = Device.resize.height;
			Device.resize.height = iDeviceHeight;

			TableQUnitUtils.setDefaultSettings({
				rowMode: new AutoRowMode(),
				rows: {path : "/Products"},
				models: this.oDataModel
			});

			return this.oDataModel.metadataLoaded();
		},
		beforeEach: function() {
			this.oGetContextsSpy.reset();
		},
		after: function() {
			this.oMockServer.destroy();
			this.oDataModel.destroy();
			this.oGetContextsSpy.restore();
			Device.resize.height = this.iOriginalDeviceHeight;
			TableQUnitUtils.setDefaultSettings();
		}
	});

	QUnit.test("Initialization if metadata not yet loaded", function(assert) {
		var oTable = TableQUnitUtils.createTable({models: TableQUnitUtils.createODataModel(null, true)});
		var oGetContextsSpy = this.oGetContextsSpy;

		// auto rerender, refreshRows, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(oGetContextsSpy.callCount, 3, "Method to get contexts called 3 times");
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, iComputedRequestLength, 100),
				"The first call considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(0, iComputedRequestLength, 100),
				"The second call considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(2).calledWithExactly(0, oTable.getRowMode().getComputedRowCounts().count, 100),
				"The third call considers the row count");
			assert.notEqual(oTable.getRowMode().getComputedRowCounts().count, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
			oTable.destroy();
		});
	});

	QUnit.test("Initialization if metadata not yet loaded; Variable row heights", function(assert) {
		var oTable = TableQUnitUtils.createTable({
			models: TableQUnitUtils.createODataModel(null, true),
			_bVariableRowHeightEnabled: true
		});
		var oGetContextsSpy = this.oGetContextsSpy;

		// auto rerender, refreshRows, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(oGetContextsSpy.callCount, 3, "Method to get contexts called 3 times");
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, iComputedRequestLength, 100),
				"The first call considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(0, iComputedRequestLength, 100),
				"The second call considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(2).calledWithExactly(0, oTable.getRowMode().getComputedRowCounts().count + 1, 100),
				"The third call considers the row count");
			assert.notEqual(oTable.getRowMode().getComputedRowCounts().count, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
			oTable.destroy();
		});
	});

	QUnit.test("Initialization if metadata already loaded", function(assert) {
		var oTable = TableQUnitUtils.createTable();
		var oGetContextsSpy = this.oGetContextsSpy;

		// refreshRows, auto rerender, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(oGetContextsSpy.callCount, 3, "Method to get contexts called 3 times");
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, iComputedRequestLength, 100),
				"The first call considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(0, iComputedRequestLength, 100),
				"The second call considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(2).calledWithExactly(0, oTable.getRowMode().getComputedRowCounts().count, 100),
				"The third call considers the row count");
			assert.notEqual(oTable.getRowMode().getComputedRowCounts().count, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
			oTable.destroy();
		});
	});

	QUnit.test("Initialization if metadata already loaded; Variable row heights", function(assert) {
		var oTable = TableQUnitUtils.createTable({_bVariableRowHeightEnabled: true});
		var oGetContextsSpy = this.oGetContextsSpy;

		// refreshRows, auto rerender, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(oGetContextsSpy.callCount, 3, "Method to get contexts called 3 times");
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, iComputedRequestLength, 100),
				"The first call considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(0, iComputedRequestLength, 100),
				"The second call considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(2).calledWithExactly(0, oTable.getRowMode().getComputedRowCounts().count + 1, 100),
				"The third call considers the row count");
			assert.notEqual(oTable.getRowMode().getComputedRowCounts().count + 1, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
			oTable.destroy();
		});
	});

	QUnit.test("Initialization if metadata already loaded; Bound on initialization; threshold = 1", function(assert) {
		var oTable = TableQUnitUtils.createTable({threshold: 1});
		var oGetContextsSpy = this.oGetContextsSpy;

		// refreshRows, auto rerender, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			var iComputedRowCount = oTable.getRowMode().getComputedRowCounts().count;

			assert.equal(oGetContextsSpy.callCount, 3, "Method to get contexts called 3 times");
			// Threshold is 100, because binding is initialized before 'threshold' property is set (see ManagedObject#applySettings).
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, iComputedRequestLength, 100),
				"The first call considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(0, iComputedRequestLength, iComputedRowCount),
				"The second call considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(2).calledWithExactly(0, iComputedRowCount, iComputedRowCount),
				"The third call considers the row count");
			assert.notEqual(iComputedRowCount, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
			oTable.destroy();
		});
	});

	QUnit.test("Initialization if metadata already loaded; Bound on initialization; Variable row heights; threshold = 1", function(assert) {
		var oTable = TableQUnitUtils.createTable({threshold: 1, _bVariableRowHeightEnabled: true});
		var oGetContextsSpy = this.oGetContextsSpy;

		// refreshRows, auto rerender, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			var iComputedRowCount = oTable.getRowMode().getComputedRowCounts().count;

			assert.equal(oGetContextsSpy.callCount, 3, "Method to get contexts called 3 times");
			// Threshold is 100, because binding is initialized before 'threshold' property is set (see ManagedObject#applySettings).
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, iComputedRequestLength, 100),
				"The first call considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(0, iComputedRequestLength, iComputedRowCount + 1),
				"The second call considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(2).calledWithExactly(0, iComputedRowCount + 1, iComputedRowCount + 1),
				"The third call considers the row count");
			assert.notEqual(iComputedRowCount, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
			oTable.destroy();
		});
	});

	QUnit.test("Initialization if metadata already loaded; Bound between initialization and rendering; threshold = 1", function(assert) {
		var oTable = TableQUnitUtils.createTable({threshold: 1, rows: undefined}, function(oTable) {
			oTable.bindRows({path : "/Products"});
		});
		var oGetContextsSpy = this.oGetContextsSpy;

		// refreshRows, auto rerender, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			var iComputedRowCount = oTable.getRowMode().getComputedRowCounts().count;

			assert.equal(oGetContextsSpy.callCount, 3, "Method to get contexts called 3 times");
			// Threshold is 5, because of the value of the "minRowCount" property.
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, iComputedRequestLength, 5),
				"The first call considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(0, iComputedRequestLength, iComputedRowCount),
				"The second call considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(2).calledWithExactly(0, iComputedRowCount, iComputedRowCount),
				"The third call considers the row count");
			assert.notEqual(iComputedRowCount, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
			oTable.destroy();
		});
	});

	QUnit.test("Initialization if metadata already loaded; Bound after rendering; threshold = 1", function(assert) {
		var oTable = TableQUnitUtils.createTable({threshold: 1, rows: undefined});
		var oGetContextsSpy = this.oGetContextsSpy;

		oTable.bindRows({path : "/Products"});

		// refreshRows, auto rerender, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			var iComputedRowCount = oTable.getRowMode().getComputedRowCounts().count;

			assert.equal(oGetContextsSpy.callCount, 3, "Method to get contexts called 3 times");
			// Threshold is 5, because of the value of the "minRowCount" property.
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, iComputedRequestLength, 5),
				"The first call considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(0, iComputedRequestLength, iComputedRowCount),
				"The second call considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(2).calledWithExactly(0, iComputedRowCount, iComputedRowCount),
				"The third call considers the device height for the length");
			assert.notEqual(iComputedRowCount, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
			oTable.destroy();
		});
	});

	QUnit.test("Resize", function(assert) {
		var oTable = TableQUnitUtils.createTable();
		var oGetContextsSpy = this.oGetContextsSpy;

		return oTable.qunit.whenRenderingFinished().then(function() {
			oGetContextsSpy.reset();
		}).then(oTable.qunit.$resize({height: "756px"})).then(function() {
			assert.equal(oGetContextsSpy.callCount, 1, "Method to get contexts called once");
			assert.ok(oGetContextsSpy.calledWithExactly(0, oTable.getRowMode().getComputedRowCounts().count, 100),
				"The call considers the row count");
			oGetContextsSpy.reset();

		}).then(oTable.qunit.resetSize).then(function() {
			assert.equal(oGetContextsSpy.callCount, 1, "Method to get contexts called once");
			assert.ok(oGetContextsSpy.calledWithExactly(0, oTable.getRowMode().getComputedRowCounts().count, 100),
				"The call considers the row count");
			oTable.destroy();
		});
	});

	QUnit.test("Refresh", function(assert) {
		var oTable = TableQUnitUtils.createTable();
		var oGetContextsSpy = this.oGetContextsSpy;

		return oTable.qunit.whenRenderingFinished().then(function() {
			oGetContextsSpy.reset();
			oTable.getBinding().refresh();
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oGetContextsSpy.callCount, 2, "Method to get contexts called 2 times"); // refreshRows, updateRows
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, iComputedRequestLength, 100),
				"The first call considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(0, oTable.getRowMode().getComputedRowCounts().count, 100),
				"The second call considers the row count");
			assert.notEqual(oTable.getRowMode().getComputedRowCounts().count, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
			oTable.destroy();
		});
	});

	QUnit.test("Refresh; Variable row heights", function(assert) {
		var oTable = TableQUnitUtils.createTable({_bVariableRowHeightEnabled: true});
		var oGetContextsSpy = this.oGetContextsSpy;

		return oTable.qunit.whenRenderingFinished().then(function() {
			oGetContextsSpy.reset();
			oTable.getBinding().refresh();
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oGetContextsSpy.callCount, 2, "Method to get contexts called 2 times"); // refreshRows, updateRows
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, iComputedRequestLength, 100),
				"The first call considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(0, oTable.getRowMode().getComputedRowCounts().count + 1, 100),
				"The second call considers the row count");
			assert.notEqual(oTable.getRowMode().getComputedRowCounts().count + 1, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
			oTable.destroy();
		});
	});
});