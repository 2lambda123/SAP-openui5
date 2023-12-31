/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/rta/command/FlexCommand"], function(FlexCommand) {
	"use strict";

	/**
	 * CustomAdd Command
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.62
	 * @alias sap.ui.rta.command.CustomAdd
	 */
	var CustomAdd = FlexCommand.extend("sap.ui.rta.command.CustomAdd", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				index: {
					type: "int",
					group: "content"
				},
				addElementInfo: {
					type: "object",
					group: "content"
				},
				aggregationName: {
					type: "string",
					group: "content"
				},
				customItemId: {
					type: "string",
					group: "content"
				}
			}
		}
	});

	return CustomAdd;
});
