sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("my.component.sample.componentPreload.Main", {
		onInit: function () {
			this.getView().byId("img").setSrc(sap.ui.require.toUrl("my/component/sample/componentPreload/Image.png"));
		}
	});
});