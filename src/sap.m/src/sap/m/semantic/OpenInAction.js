/*!
 * ${copyright}
 */

sap.ui.define(['sap/m/semantic/SemanticButton'], function(SemanticButton) {
	"use strict";

	/**
	 * Constructor for a new OpenInAction.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Optional initial settings for the new control:  a map/JSON-object with initial property values, event listeners etc. for the new object
	 *
	 * @class
	 * An OpenInAction button has default semantic-specific properties and is
	 * eligible for aggregation content of a {@link sap.m.semantic.SemanticPage}.
	 *
	 * @extends sap.m.semantic.SemanticButton
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30.0
	 * @alias sap.m.semantic.OpenInAction
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var OpenInAction = SemanticButton.extend("sap.m.semantic.OpenInAction", /** @lends sap.m.semantic.OpenInAction.prototype */ {
		metadata: {
			library: "sap.m"
		}
	});

	return OpenInAction;

});
