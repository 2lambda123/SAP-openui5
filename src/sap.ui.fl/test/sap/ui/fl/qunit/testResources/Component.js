sap.ui.define(["sap/ui/core/UIComponent"], function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.fl.PreprocessorImpl.testResources.Component", {
		init(...aArgs) {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, aArgs);
		},
		metadata: {
		}
	});

	return Component;
});
