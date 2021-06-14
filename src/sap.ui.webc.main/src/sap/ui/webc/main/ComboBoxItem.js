/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.ComboBoxItem.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/ComboBoxItem"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>ComboBoxItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * @extends sap.ui.webc.common.WebComponent
	 *
	 * The <code>sap.ui.webc.main.ComboBoxItem</code> represents the item for a <code>sap.ui.webc.main.ComboBox</code>.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimantal Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.ComboBoxItem
	 * @implements sap.ui.webc.main.IComboBoxItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ComboBoxItem = WebComponent.extend("sap.ui.webc.main.ComboBoxItem", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-cb-item-ui5",
			interfaces: [
				"sap.ui.webc.main.IComboBoxItem"
			],
			properties: {

				/**
				 * Defines the additional text of the component.
				 */
				additionalText: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the text of the component.
				 */
				text: {
					type: "string",
					defaultValue: ""
				}
			}
		}
	});

	return ComboBoxItem;
});