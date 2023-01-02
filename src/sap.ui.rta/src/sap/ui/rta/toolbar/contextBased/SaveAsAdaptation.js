/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/base/Log",
	"sap/base/strings/formatMessage",
	"sap/ui/core/Fragment",
	"sap/ui/fl/Layer",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/write/api/ContextSharingAPI",
	"sap/ui/rta/Utils",
	"sap/ui/model/Binding",
	"sap/ui/model/json/JSONModel"
], function(
	ManagedObject,
	Log,
	formatMessage,
	Fragment,
	Layer,
	ContextBasedAdaptationsAPI,
	ContextSharingAPI,
	Utils,
	Binding,
	JSONModel
) {
	"use strict";

	/**
	 * Controller for the <code>sap.ui.rta.toolbar.contextBased.SaveAsAdaptation</code> controls.
	 * Contains implementation of context-based-adaptation functionality.
	 *
	 * @class
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.110
	 * @alias sap.ui.rta.toolbar.contextBased.SaveAsAdaptation
	 */
	var SaveAsAdaptation = ManagedObject.extend("sap.ui.rta.toolbar.contextBased.SaveAsAdaptation", {
		metadata: {
			properties: {
				toolbar: {
					type: "any" // "sap.ui.rta.toolbar.Base"
				}
			}
		},
		constructor: function() {
			ManagedObject.prototype.constructor.apply(this, arguments);
			this.oTextResources = this.getToolbar().getTextResources();
		}
	});

	SaveAsAdaptation.prototype.openAddAdaptationDialog = function(sLayer) {
		if (!this._oAddAdaptationDialogPromise) {
			this._oAddAdaptationDialogPromise = Fragment.load({
				name: "sap.ui.rta.toolbar.contextBased.SaveAsAdaptationDialog",
				id: this.getToolbar().getId() + "_fragment--sapUiRta_addAdaptationDialog",
				controller: {
					onAdaptationTitleChange: onAdaptationTitleChange.bind(this),
					onSaveAsAdaptation: onSaveAsAdaptation.bind(this),
					onCancelAdaptationDialog: onCancelAdaptationDialog.bind(this),
					onPriorityChange: onPriorityChange.bind(this)
				}
			}).then(function(oDialog) {
				this._oAddAdaptationDialog = oDialog;
				this._oAddAdaptationDialog.attachBeforeClose(clearComponent.bind(this));
				oDialog.addStyleClass(Utils.getRtaStyleClassName());
				this.getToolbar().addDependent(this._oAddAdaptationDialog);
			}.bind(this));
		} else {
			this.getToolbar().getControl("addAdaptationDialog--saveAdaptation-title-input").setValue("");
		}
		return this._oAddAdaptationDialogPromise.then(function() {
			return createContextSharingComponent.call(this, sLayer);
		}.bind(this)).then(function() {
			var oRtaInformation = this.getToolbar().getRtaInformation();
			return ContextBasedAdaptationsAPI.load({
				control: oRtaInformation.rootControl, layer: oRtaInformation.flexSettings.layer
			});
		}.bind(this)).catch(function(oError) {
			Log.error(oError.stack);
			return new JSONModel({ adaptations: [] });
		}).then(function(oAdaptationsModel) {
			return openDialog.call(this, oAdaptationsModel);
		}.bind(this));
	};

	// ------ open dialog -----
	function openDialog(oAdaptationsModelData) {
		formatPriorityText.call(this, oAdaptationsModelData.getData());
		return this._oAddAdaptationDialog.open();
	}

	// ------ formatting ------
	function formatPriorityText(oAdaptationsModelData) {
		var aItems = [{ key: 0, title: this.oTextResources.getText("TXT_SELECT_FIRST_PRIO") }];
		var sPriorityTextTemplate = this.oTextResources.getText("TXT_SELECT_PRIO");
		oAdaptationsModelData.adaptations.forEach(function(oAdaptation, iIndex) {
			aItems.push({
				key: (iIndex + 1).toString(),
				title: formatMessage(sPriorityTextTemplate, [oAdaptation.title, iIndex + 2])
			});
		});
		this.oPrioritySelectionModel = new JSONModel({
			selected: this.oTextResources.getText("TXT_SELECT_FIRST_PRIO"),
			priority: aItems
		});
		this._oAddAdaptationDialog.setModel(this.oPrioritySelectionModel, "prioritySelectionModel");
	}

	function onAdaptationTitleChange(oEvent) {
		this.sAdaptationTitle = oEvent.getParameter("value");
		enableSaveAsButton.call(this);
	}

	function onCancelAdaptationDialog() {
		this._oAddAdaptationDialog.close();
	}

	function onSaveAsAdaptation() {
		var oContextBasedAdaptation = {};
		oContextBasedAdaptation.title = getAdaptationTitle.call(this);
		oContextBasedAdaptation.contexts = this._oContextComponentInstance.getSelectedContexts();
		oContextBasedAdaptation.priority = getAdaptationPriority.call(this);
		var oRtaInformation = this.getToolbar().getRtaInformation();
		ContextBasedAdaptationsAPI.create({
			control: oRtaInformation.rootControl,
			layer: oRtaInformation.flexSettings.layer,
			contextBasedAdaptation: oContextBasedAdaptation
		}).catch(function(oError) {
			Log.error(oError.stack);
			var sMessage = "MSG_LREP_TRANSFER_ERROR";
			var oOptions = { titleKey: "SAC_DIALOG_HEADER" };
			oOptions.details = oError.userMessage;
			Utils.showMessageBox("error", sMessage, oOptions);
		});
		this._oAddAdaptationDialog.close();
	}

	function onPriorityChange(oEvent) {
		this.sPriority = oEvent.getParameters().selectedItem.getProperty("key");
	}

	function createContextSharingComponent(sLayer) {
		var mPropertyBag = { layer: sLayer || Layer.CUSTOMER };
		return ContextSharingAPI.createComponent(mPropertyBag).then(function(oContextSharingComponent) {
			this._oContextComponent = oContextSharingComponent;
			this._oContextComponentInstance = oContextSharingComponent.getComponentInstance();
			this._oContextComponentInstance.resetSelectedContexts();
			this._oAddAdaptationDialog.addContent(this._oContextComponent);
			var oSelectedContextsModel = this._oContextComponentInstance.getSelectedContextsModel();
			this.oSelectedContextsBinding = new Binding(oSelectedContextsModel, "/", oSelectedContextsModel.getContext("/"));
			this.oSelectedContextsBinding.attachChange(enableSaveAsButton.bind(this));
			this._oContextComponentInstance.showMessageStrip(false);
		}.bind(this));
	}

	function getAdaptationTitle() {
		return this.sAdaptationTitle || "";
	}

	function getAdaptationPriority() {
		return Number(this.sPriority) || 0;
	}

	function enableSaveAsButton() {
		var bEnable = getAdaptationTitle.call(this).length > 0 && this._oContextComponentInstance.getSelectedContexts().role.length > 0;
		this.getToolbar().getControl("addAdaptationDialog--saveAdaptation-saveButton").setEnabled(bEnable);
	}

	function clearComponent() {
		if (this._oContextComponentInstance) {
			this._oContextComponentInstance.showMessageStrip(true);
			this._oContextComponentInstance.resetSelectedContexts();
		}
	}
	return SaveAsAdaptation;
});