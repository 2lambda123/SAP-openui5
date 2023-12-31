/*** List Report Assertions ***/
/*global QUnit */
sap.ui.define(
	["sap/ui/test/matchers/PropertyStrictEquals", "sap/ui/test/matchers/AggregationFilled"],
	function (PropertyStrictEquals, AggregationFilled) {
		"use strict";

		return function (viewName, controlId) {

			return {

				theTableHasASortButton: function () {
					// var SettingsButton = null; // not used
					return this.waitFor({
						controlType: "sap.m.Button",
						check: function (aButtons) {
							return aButtons.filter(function (oButton) {
								if (oButton.getIcon() !== "sap-icon://sort") {
									return false;
								}
								// SettingsButton = oButton;
								return true;
							});
						},
						success: function () {
							QUnit.ok(true, "The page has a sort button.");
						},
						errorMessage: "The page has no sort button."
					});
				},

				theTableHasAGroupButton: function () {
					// var SettingsButton = null; // not used
					return this.waitFor({
						controlType: "sap.m.Button",
						check: function (aButtons) {
							return aButtons.filter(function (oButton) {
								if (oButton.getIcon() !== "sap-icon://group") {
									return false;
								}
								// SettingsButton = oButton;
								return true;
							});
						},
						success: function () {
							QUnit.ok(true, "The page has a sort button.");
						},
						errorMessage: "The page has no sort button."
					});
				},

				theTableOnlyPageHasAViewSettingsDialogOpen: function (sTitle) {
					return this.waitFor({
						controlType: "sap.m.Label",
						matchers: new PropertyStrictEquals({
							name: "text",
							value: sTitle
						}),
						success: function () {
							QUnit.ok(true, "Setting Dialog opened with title : " + sTitle);
						},
						errorMessage: "Setting Dialog not opened with title.: " + sTitle
					});
				},

				theListIsSorted: function (sColumn, bAscendingOrder) {
					return this.waitFor({
						controlType: "sap.m.Table",
						matchers: function (oTable) {
							let iSortColumn = 0;
							const aItems = oTable.getItems(), aCells = aItems[0].getCells();
							let value1, value2;
							for (let i = 0; i < aCells.length; i++) {
								if (aCells[i].getBinding('value').getPath().indexOf(sColumn) > -1) {
									iSortColumn = i;
									break;
								}
							}
							if (iSortColumn === aCells.length) {
								return false;
							}
							for (let i = 0; i < aItems.length - 1; i++) {
								value1 = aItems[i].getCells()[iSortColumn].getValue();
								value2 = aItems[i + 1].getCells()[iSortColumn].getValue();
								if (bAscendingOrder && value1 > value2) {
									return false;
								}
								if (!bAscendingOrder && value1 < value2) {
									return false;
								}
							}
							return true;
						},
						success: function () {
							QUnit.ok(true, "The table is sorted according to column : " + sColumn);
						},
						errorMessage: "The table isn't sorted according to :" + sColumn
					});
				},
				// TODO: try to merge the sorting logic for all the tables
				theGridTableIsSorted : function (sColumn, bAscendingOrder) {
					return this.waitFor({
						controlType: "sap.ui.table.Table",
						matchers: function (oTable) {
							const rowObjects = oTable.getRows();
							let value1, value2;
							for (let i = 0; i < rowObjects.length - 1; i++) {
								value1 = rowObjects[i].getBindingContext().getProperty("Category");
								value2 = rowObjects[i + 1].getBindingContext().getProperty("Category");
								if (bAscendingOrder && value1 > value2) {
									return false;
								}
								if (!bAscendingOrder && value1 < value2) {
									return false;
								}
							}
							return true;
						},
						success: function () {
							QUnit.ok(true, "The table is sorted according to column : " + sColumn);
						},
						errorMessage: "The table isn't sorted according to :" + sColumn
					});
				},

				theGroupHeadersAreSorted: function () {
					return this.waitFor({
						controlType: "sap.m.GroupHeaderListItem",
						check: function (aGroupHeaders) {
							const iGroupHeaders = aGroupHeaders.length - 1;
							let row1 = Math.floor((Math.random() * iGroupHeaders) + 1);
							let row2 = Math.floor((Math.random() * iGroupHeaders) + 1);

							if (row1 > row2) {
								row1 = row1 + row2;
								row2 = row1 - row2;
								row1 = row1 - row2;
							}
							const sGroupName1 = aGroupHeaders[row1].getTitle();
							const sGroupName2 = aGroupHeaders[row2].getTitle();

							if (sGroupName1 <= sGroupName2) {
								return true;
							}
							return false;
						},
						success: function () {
							QUnit.ok(true, "The group headers are sorted ascending order");
						},
						errorMessage: "The group headers aren't sorted ascending order"
					});
				},

				theListIsGrouped: function (sGroupName) {
					return this.waitFor({
						controlType: "sap.m.Table",
						matchers: [
							new AggregationFilled({
								name: "items"
							}), function (oTable) {
								const aItems = oTable.getItems(), aColumns = oTable.getColumns();
								let iIndex1, iGroupColumn;
								for (let i = 0; i < aColumns.length; i++) {
									if (aColumns[i].getId().indexOf(sGroupName) > -1) {
										iGroupColumn = i;
										break;
									}
								}
								for (let i = 0; i < aItems.length; i++) {
									if (aItems[i].getMetadata().getName() === "sap.m.GroupHeaderListItem") {
										iIndex1 = i;
										break;
									}
								}
								const sValue = aItems[iIndex1 + 1].getCells()[iGroupColumn].getValue();
								if (aItems[iIndex1].getTitle().indexOf(sValue) > -1) {
									return true;
								}
								return false;
							}
						],
						success: function () {
							QUnit.ok(true, "The entries are grouped according to " + sGroupName);
						},
						errorMessage: "The list is NOT grouped according to :" + sGroupName
					});
				}
			};
		};
	}
);
