/*!
 * ${copyright}
 */

sap.ui.define(['sap/m/semantic/SemanticButton'], function(SemanticButton) {
	"use strict";

	/**
	 * Constructor for a new PositiveAction.
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Optional initial settings for the new control:  a map/JSON-object with initial property values, event listeners etc. for the new object
	 *
	 * @class
	 * A PositiveAction button has default semantic-specific properties and
	 * is eligible for aggregation content of a {@link sap.m.semantic.SemanticPage}.
	 *
	 * @extends sap.m.semantic.SemanticButton
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30.0
	 * @alias sap.m.semantic.PositiveAction
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var PositiveAction = SemanticButton.extend("sap.m.semantic.PositiveAction", /** @lends sap.m.semantic.PositiveAction.prototype */ {
		metadata: {
			library : "sap.m",
			properties : {

				/**
				 * Button text
				 */
				text: {type: "string", group: "Misc", defaultValue: null}
			}
		}
	});

	return PositiveAction;
});
