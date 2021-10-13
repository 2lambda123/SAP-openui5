/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/mdc/odata/v4/ValueHelpDelegate",
	"sap/ui/mdc/valuehelp/content/MTable",
	"sap/ui/mdc/valuehelp/content/MDCTable",
	"sap/ui/mdc/valuehelp/content/Conditions",
	"sap/m/Table",
	"sap/base/util/UriParameters",
	"sap/ui/mdc/filterbar/vh/FilterBar",
	"sap/ui/mdc/FilterField",
	'sap/m/library',
	"sap/ui/mdc/table/ResponsiveTableType"
], function(
	ODataV4ValueHelpDelegate,
	MTable,
	MDCTable,
	Conditions,
	Table,
	UriParameters,
	FilterBar,
	FilterField,
	mLibrary,
	ResponsiveTableType
) {
	"use strict";

	var ValueHelpDelegate = Object.assign({}, ODataV4ValueHelpDelegate);

	ValueHelpDelegate.retrieveContent = function (oPayload, oContainer) {
		var oValueHelp = oContainer && oContainer.getParent();

		var oParams = UriParameters.fromQuery(location.search);
		var oParamSuspended = oParams.get("suspended");
		var bSuspended = oParamSuspended ? oParamSuspended === "true" : false;

		var aCurrentContent = oContainer && oContainer.getContent();
		var oCurrentContent = aCurrentContent && aCurrentContent[0];

		var bMultiSelect = oValueHelp.getMaxConditions() === -1;


		if (oContainer.isA("sap.ui.mdc.valuehelp.Popover")) {

			if (!oCurrentContent) {
				oCurrentContent = new MTable(oValueHelp.getId() + "--MTable", {keyPath: "ID", descriptionPath: "name"});
				oContainer.addContent(oCurrentContent);
			}

			if (!oCurrentContent.getTable()) {
				oCurrentContent.setTable(new Table(oCurrentContent.getId() + "--popover-mTable", {
					width: "30rem",
					mode: bMultiSelect ? mLibrary.ListMode.MultiSelect : mLibrary.ListMode.SingleSelectLeft,
					columns: [
						new sap.m.Column({header: new sap.m.Text({text : "ID"})}),
						new sap.m.Column({header: new sap.m.Text({text : "Name"})})
					],
					items: {
						path : "/Authors",
						length: 10,
						suspended: bSuspended,
						template : new sap.m.ColumnListItem({
							type: "Active",
							cells: [
								new sap.m.Text({text: "{path: 'ID', type:'sap.ui.model.odata.type.String'}"}),
								new sap.m.Text({text: "{path: 'name', type:'sap.ui.model.odata.type.String'}"})
							]
						})
					}
				}));
			}
		}

		if (oContainer.isA("sap.ui.mdc.valuehelp.Dialog")) {

			if (!oCurrentContent) {

				oCurrentContent = new MDCTable({title: "Select from List", keyPath: "ID", descriptionPath: "name", filterFields: "$search", collectiveSearchItems: [
					new sap.ui.core.Item({text: "Default Search Template", key: "default"}),
					new sap.ui.core.Item({text: "Search Template 1", key: "template1"})
				]});

				oCurrentContent.setFilterBar(
					new FilterBar({
						liveMode: false,
						delegate: {
							name: "sap/ui/mdc/filterbar/vh/GenericFilterBarDelegate",
							payload: {}
						},
						basicSearchField: new FilterField({
							delegate: {
								name: "sap/ui/mdc/odata/v4/FieldBaseDelegate",
								payload: {}
							},
							dataType: "Edm.String",
							conditions: "{$filters>/conditions/$search}",
							width: "50%",
							maxConditions: 1,
							placeholder: "Search"
						}),
						filterItems: [
							new FilterField({
								delegate: {
									name: "sap/ui/mdc/odata/v4/FieldBaseDelegate",
									payload: {}
								},
								label: "Name",
								conditions: "{$filters>/conditions/name}"
							})
						]
					})
				);

				oContainer.addContent(oCurrentContent);

				if (bMultiSelect) {
					var oAdditionalContent = new Conditions({
						title:"Define Conditions",
						shortTitle:"Conditions",
						label:"Label of Field"
					});
					oContainer.addContent(oAdditionalContent);
				}
			}

			var sCollectiveSearchKey = oCurrentContent.getCollectiveSearchKey() || "";

			var oCurrentTable = oCurrentContent.getTable();

			if (oCurrentTable) {
				oCurrentContent.setTable();
				oCurrentTable.destroy();
			}


			var oCollectiveSearchContent;

			switch (sCollectiveSearchKey) {
				case "template1":
					oCollectiveSearchContent = new sap.ui.mdc.Table(oValueHelp.getId() + "--mdcTable--template1", {
						header: "",
						p13nMode: ['Column','Sort'],
						autoBindOnInit: !bSuspended,
						showRowCount: true,
						width: "100%",
						height: "100%",
						type: new ResponsiveTableType({growingMode: "Scroll"}),
						delegate: {
							name: "sap/ui/v4demo/delegate/ResponsiveTable.delegate",
							payload: {
								collectionName: "Authors"
							}
						},
						columns: [
							new sap.ui.mdc.table.Column({importance: "High", header: "ID", dataProperty: "ID", template: new sap.ui.mdc.Field({value: "{ID}", editMode: "Display"})}),
							new sap.ui.mdc.table.Column({importance: "High", header: "Name", dataProperty: "name", template: new sap.ui.mdc.Field({value: "{name}", editMode: "Display"})}),
							new sap.ui.mdc.table.Column({importance: "Low", header: "Country", dataProperty: "countryOfOrigin_code", template: new sap.ui.mdc.Field({value: "{countryOfOrigin_code}", additionalValue: "{countryOfOrigin/descr}", display: "Description", editMode: "Display"})}),
							new sap.ui.mdc.table.Column({importance: "Low", header: "Region", dataProperty: "regionOfOrigin_code", template: new sap.ui.mdc.Field({value: "{regionOfOrigin_code}", additionalValue: "{regionOfOrigin/text}", display: "Description", editMode: "Display"})}),
							new sap.ui.mdc.table.Column({importance: "Low", header: "City", dataProperty: "cityOfOrigin_city", template: new sap.ui.mdc.Field({value: "{cityOfOrigin_city}", additionalValue: "{cityOfOrigin/text}", display: "Description", editMode: "Display"})})
						]
					});
					break;
				default:
					oCollectiveSearchContent = new sap.ui.mdc.Table(oValueHelp.getId() + "--mdcTable--default", {
						header: "",
						p13nMode: ['Column','Sort'],
						autoBindOnInit: !bSuspended,
						showRowCount: true,
						width: "100%",
						height: "100%",
						type: new ResponsiveTableType({growingMode: "Scroll"}),
						delegate: {
							name: "sap/ui/v4demo/delegate/ResponsiveTable.delegate",
							payload: {
								collectionName: "Authors"
							}
						},
						columns: [
							new sap.ui.mdc.table.Column({importance: "High", header: "ID", dataProperty: "ID", template: new sap.ui.mdc.Field({value: "{ID}", editMode: "Display"})}),
							new sap.ui.mdc.table.Column({importance: "High", header: "Name", dataProperty: "name", template: new sap.ui.mdc.Field({value: "{name}", editMode: "Display"})})
						]
					});
					break;
			}
			oCurrentContent.setTable(oCollectiveSearchContent);
		}

		return Promise.resolve();
	};

	return ValueHelpDelegate;
});
