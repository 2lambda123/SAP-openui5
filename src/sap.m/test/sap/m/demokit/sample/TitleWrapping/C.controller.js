sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/mvc/Controller"
], function (Element, Controller) {
	"use strict";

	return Controller.extend("sap.m.sample.TitleWrapping.C", {

		onSliderMoved: function (oEvent) {
			var fValue = oEvent.getParameter("value");
			this.byId("containerLayout").setWidth(fValue + "%");
		},

		onWrappingChange: function () {
			var oTitle = Element.getElementById(this.getView().getId() + "--WrappingTitle");
			oTitle.setWrapping(!oTitle.getWrapping());
		},

		onHyphenationChange: function (oEvent) {
			var oTitle = this.byId("WrappingTitle");
			var sWrappingType = oEvent.getParameter("state") ? "Hyphenated" : "Normal";
			oTitle.setWrappingType(sWrappingType);
		}

	});
});