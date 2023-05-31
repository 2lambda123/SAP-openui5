/* global QUnit */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/Log",
	"sap/m/App",
	"sap/m/Button",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Manifest",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/controlVariants/URLHandler",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/Switcher",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/Core"
], function(
	_omit,
	Log,
	App,
	Button,
	JsControlTreeModifier,
	XMLView,
	BusyIndicator,
	ComponentContainer,
	Manifest,
	UIComponent,
	Reverter,
	URLHandler,
	VariantUtil,
	FlexObjectFactory,
	Switcher,
	VariantManagementState,
	FlexState,
	ManifestUtils,
	ChangesController,
	ControlVariantApplyAPI,
	Settings,
	VariantManagement,
	VariantModel,
	ContextBasedAdaptationsAPI,
	FlexControllerFactory,
	LayerUtils,
	Layer,
	Utils,
	sinon,
	oCore
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl");
	var sVMReference = "variantMgmtId1";
	sinon.stub(LayerUtils, "getCurrentLayer").returns(Layer.CUSTOMER);
	sinon.stub(BusyIndicator, "show");
	sinon.stub(BusyIndicator, "hide");
	var oDummyControl = {
		attachManage: sandbox.stub(),
		detachManage: sandbox.stub(),
		openManagementDialog: sandbox.stub()
	};

	function createVariant(mVariantProperties) {
		return FlexObjectFactory.createFlVariant({
			id: mVariantProperties.fileName || mVariantProperties.key,
			reference: mVariantProperties.reference || "myReference",
			layer: mVariantProperties.layer,
			user: mVariantProperties.author,
			variantReference: mVariantProperties.variantReference,
			variantManagementReference: mVariantProperties.variantManagementReference,
			variantName: mVariantProperties.title,
			favorite: mVariantProperties.favorite,
			visible: mVariantProperties.visible,
			executeOnSelection: mVariantProperties.executeOnSelect,
			contexts: mVariantProperties.contexts
		});
	}

	QUnit.module("Given an instance of VariantModel", {
		before: function() {
			return FlexState.initialize({
				reference: "MyComponent",
				componentId: "RTADemoAppMD",
				componentData: {},
				manifest: {}
			});
		},
		beforeEach: function() {
			var oManifestObj = {
				"sap.app": {
					id: "MyComponent",
					applicationVersion: {
						version: "1.2.3"
					}
				}
			};
			var oManifest = new Manifest(oManifestObj);

			this.oComponent = {
				name: "MyComponent",
				getId: function() {
					return "RTADemoAppMD";
				},
				getManifest: function() {
					return oManifest;
				},
				getLocalId: function() {}
			};
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oComponent);
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(this.oComponent.name);
			sandbox.stub(URLHandler, "attachHandlers");

			this.oFlexController = FlexControllerFactory.createForControl(this.oComponent, oManifest);
			sandbox.spy(URLHandler, "initialize");

			this.oSelectorReturn = {
				variantMgmtId1: {
					currentVariant: "variant1",
					defaultVariant: "variant1",
					modified: false,
					variants: [
						{
							author: VariantUtil.DEFAULT_AUTHOR,
							key: sVMReference,
							layer: Layer.VENDOR,
							title: "Standard",
							favorite: true,
							visible: true,
							executeOnSelect: false,
							contexts: {}
						}, {
							author: "Me",
							key: "variant0",
							layer: Layer.CUSTOMER,
							title: "variant A",
							favorite: true,
							visible: true,
							executeOnSelect: false,
							contexts: { role: ["ADMINISTRATOR", "HR"], country: ["DE"] }
						}, {
							author: "Me",
							key: "variant1",
							layer: Layer.PUBLIC,
							title: "variant B",
							favorite: false,
							visible: true,
							executeOnSelect: true,
							contexts: { role: ["ADMINISTRATOR"], country: ["DE"] }
						}, {
							author: "Not Me",
							key: "variant2",
							layer: Layer.PUBLIC,
							title: "variant C",
							favorite: false,
							visible: true,
							executeOnSelect: true,
							contexts: {}
						}, {
							author: "Me",
							key: "variant3",
							layer: Layer.USER,
							title: "variant D",
							favorite: false,
							visible: true,
							executeOnSelect: true,
							contexts: { role: [], country: [] }
						}
					],
					variantManagementChanges: []
				}
			};
			this.oDataSelectorGetStub = sandbox.stub().returns(this.oSelectorReturn);
			this.oDataSelectorUpdateStub = sandbox.stub();
			this.oDataSelectorRemoveUpdateStub = sandbox.stub();
			sandbox.stub(VariantManagementState, "getVariantManagementMap").returns({
				get: this.oDataSelectorGetStub,
				addUpdateListener: this.oDataSelectorUpdateStub,
				removeUpdateListener: this.oDataSelectorRemoveUpdateStub
			});

			this.oModel = new VariantModel({}, {
				flexController: this.oFlexController,
				appComponent: this.oComponent
			});
			return this.oModel.initialize();
		},
		afterEach: function() {
			sandbox.restore();
			this.oModel.destroy();
			delete this.oFlexController;
		},
		after: function() {
			FlexState.clearState();
		}
	}, function() {
		QUnit.test("when initializing a variant model instance", function(assert) {
			assert.ok(URLHandler.initialize.calledOnce, "then URLHandler.initialize() called once");
			assert.ok(URLHandler.initialize.calledWith({model: this.oModel}), "then URLHandler.initialize() called with the the VariantModel");

			var oVMData = this.oModel.getData()[sVMReference];
			assert.strictEqual(oVMData.currentVariant, "variant1", "the currentVariant was set");
			assert.strictEqual(oVMData.originalCurrentVariant, "variant1", "the originalCurrentVariant was set");
			assert.strictEqual(oVMData.defaultVariant, "variant1", "the defaultVariant was set");
			assert.strictEqual(oVMData.originalDefaultVariant, "variant1", "the originalDefaultVariant was set");
			assert.strictEqual(oVMData.modified, false, "the modified flag was set");

			oVMData.variants.forEach(function(oVariantEntry) {
				assert.strictEqual(oVariantEntry.originalExecuteOnSelect, oVariantEntry.executeOnSelect, "the originalExecuteOnSelect was set");
				assert.strictEqual(oVariantEntry.originalFavorite, oVariantEntry.favorite, "the originalFavorite was set");
				assert.strictEqual(oVariantEntry.originalTitle, oVariantEntry.title, "the originalTitle was set");
				assert.strictEqual(oVariantEntry.originalVisible, oVariantEntry.visible, "the originalVisible was set");
				assert.deepEqual(oVariantEntry.originalContexts, oVariantEntry.contexts, "the originalContexts was set");
			});
		});

		QUnit.test("when destroy() is called", function(assert) {
			assert.ok(this.oDataSelectorUpdateStub.calledWith(this.oModel.fnUpdateListener), "the update listener was added");
			sandbox.spy(VariantManagementState, "clearFakeStandardVariants");

			this.oModel.destroy();
			assert.equal(VariantManagementState.clearFakeStandardVariants.callCount, 1, "then fake standard variants were reset");
			assert.ok(this.oDataSelectorRemoveUpdateStub.calledWith(this.oModel.fnUpdateListener), "the update listener was removed");
		});

		QUnit.test("when there is an update from the DataSelector", function(assert) {
			this.oSelectorReturn[sVMReference].currentVariant = "variant0";
			this.oSelectorReturn[sVMReference].defaultVariant = "variant2";
			this.oSelectorReturn[sVMReference].modified = true;
			this.oSelectorReturn[sVMReference].variantManagementChanges = [
				{changeType: "setDefault"}
			];
			this.oSelectorReturn[sVMReference].variants[2] = {
				author: "Me",
				key: "variant1",
				layer: Layer.PUBLIC,
				title: "variant B1",
				favorite: true,
				visible: false,
				executeOnSelect: false,
				contexts: { role: ["ADMINISTRATOR1"], country: ["DE1"] }
			};
			this.oModel.updateData();

			var oVMData = this.oModel.getData()[sVMReference];
			assert.strictEqual(oVMData.currentVariant, "variant0", "the currentVariant was set");
			assert.strictEqual(oVMData.originalCurrentVariant, "variant0", "the originalCurrentVariant was set");
			assert.strictEqual(oVMData.defaultVariant, "variant2", "the defaultVariant was set");
			assert.strictEqual(oVMData.originalDefaultVariant, "variant2", "the originalDefaultVariant was set");
			assert.strictEqual(oVMData.modified, true, "the modified flag was set");

			var oVariantEntry = oVMData.variants[2];
			assert.strictEqual(oVariantEntry.executeOnSelect, false, "the property was updated");
			assert.strictEqual(oVariantEntry.originalExecuteOnSelect, oVariantEntry.executeOnSelect, "the originalExecuteOnSelect was set");
			assert.strictEqual(oVariantEntry.favorite, true, "the property was updated");
			assert.strictEqual(oVariantEntry.originalFavorite, oVariantEntry.favorite, "the originalFavorite was set");
			assert.strictEqual(oVariantEntry.title, "variant B1", "the property was updated");
			assert.strictEqual(oVariantEntry.originalTitle, oVariantEntry.title, "the originalTitle was set");
			assert.strictEqual(oVariantEntry.visible, false, "the property was updated");
			assert.strictEqual(oVariantEntry.originalVisible, oVariantEntry.visible, "the originalVisible was set");
			assert.deepEqual(oVariantEntry.contexts, { role: ["ADMINISTRATOR1"], country: ["DE1"] }, "the property was updated");
			assert.deepEqual(oVariantEntry.originalContexts, oVariantEntry.contexts, "the originalContexts was set");
		});

		QUnit.test("when calling 'setModelPropertiesForControl'", function(assert) {
			var fnDone = assert.async();
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isKeyUser: function () {
					return false;
				},
				isPublicFlVariantEnabled: function () {
					return false;
				},
				isVariantPersonalizationEnabled: function () {
					return false;
				},
				getUserId: function () {
					return undefined;
				}
			});
			this.oModel.getData()[sVMReference]._isEditable = true;
			this.oModel.setModelPropertiesForControl(sVMReference, false, oDummyControl);
			assert.ok(this.oModel.getData()[sVMReference].variantsEditable, "the parameter variantsEditable is initially true");
			assert.equal(this.oModel.getData()[sVMReference].variants[4].rename, false, "user variant cannot renamed by default");
			assert.equal(this.oModel.getData()[sVMReference].variants[4].remove, false, "user variant cannot removed by default");
			assert.equal(this.oModel.getData()[sVMReference].variants[4].change, false, "user variant cannot changed by default");
			setTimeout(function() {
				assert.notOk(this.oModel.getData()[sVMReference].variants[4].rename, "user variant can not be renamed after flp setting is received");
				assert.notOk(this.oModel.getData()[sVMReference].variants[4].remove, "user variant can not be removed after flp setting is received");
				assert.notOk(this.oModel.getData()[sVMReference].variants[4].change, "user variant can not be changed after flp setting is received");
				fnDone();
			}.bind(this), 0);
			this.oModel.setModelPropertiesForControl(sVMReference, true, oDummyControl);
			assert.notOk(this.oModel.getData()[sVMReference].variantsEditable, "the parameter variantsEditable is set to false for bDesignTimeMode = true");
			this.oModel.setModelPropertiesForControl(sVMReference, false, oDummyControl);
			assert.ok(this.oModel.getData()[sVMReference].variantsEditable, "the parameter variantsEditable is set to true for bDesignTimeMode = false");
			Settings.getInstanceOrUndef.restore();
		});

		QUnit.test("when calling 'setModelPropertiesForControl' of a PUBLIC variant", function(assert) {
			var bIsKeyUser = false;
			var bIsPublicFlVariantEnabled = true;
			var sUserId;
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isKeyUser: function () {
					return bIsKeyUser;
				},
				isPublicFlVariantEnabled: function () {
					return bIsPublicFlVariantEnabled;
				},
				getUserId: function () {
					return sUserId;
				},
				isVariantPersonalizationEnabled: function () {
					return true;
				}
			});
			this.oModel.getData()[sVMReference]._isEditable = true;
			this.oModel.setModelPropertiesForControl(sVMReference, false, oDummyControl);
			assert.equal(this.oModel.getData()[sVMReference].variantsEditable, true, "the parameter variantsEditable is true");
			assert.equal(this.oModel.getData()[sVMReference].variants[2].rename, true, "a public view editor can renamed its own PUBLIC variant");
			assert.equal(this.oModel.getData()[sVMReference].variants[2].remove, true, "a public view editor can removed its own PUBLIC variant");
			assert.equal(this.oModel.getData()[sVMReference].variants[2].change, true, "a public view editor can changed its own PUBLIC variant");
			assert.equal(this.oModel.getData()[sVMReference].variants[3].rename, true, "a public view editor can renamed another users PUBLIC variant in case the user cannot be determined");
			assert.equal(this.oModel.getData()[sVMReference].variants[3].remove, true, "a public view editor can removed another users PUBLIC variant in case the user cannot be determined");
			assert.equal(this.oModel.getData()[sVMReference].variants[3].change, true, "a public view editor can changed another users PUBLIC variant in case the user cannot be determined");

			sUserId = 'OtherPerson';
			this.oModel.setModelPropertiesForControl(sVMReference, false, oDummyControl);
			assert.equal(this.oModel.getData()[sVMReference].variants[3].rename, false, "a public view editor cannot renamed another users PUBLIC variant");
			assert.equal(this.oModel.getData()[sVMReference].variants[3].remove, false, "a public view editor cannot removed another users PUBLIC variant");
			assert.equal(this.oModel.getData()[sVMReference].variants[3].change, false, "a public view editor cannot changed another users PUBLIC variant");

			bIsKeyUser = true;
			bIsPublicFlVariantEnabled = false;
			this.oModel.setModelPropertiesForControl(sVMReference, false, oDummyControl);
			assert.equal(this.oModel.getData()[sVMReference].variants[3].rename, true, "a key user can renamed another users PUBLIC variant");
			assert.equal(this.oModel.getData()[sVMReference].variants[3].remove, true, "a key user can removed another users PUBLIC variant");
			assert.equal(this.oModel.getData()[sVMReference].variants[3].change, true, "a key user can changed another users PUBLIC variant");

			bIsKeyUser = false;
			sUserId = 'Me';
			this.oModel.setModelPropertiesForControl(sVMReference, false, oDummyControl);
			assert.equal(this.oModel.getData()[sVMReference].variants[3].rename, false, "a end user cannot renamed its own users PUBLIC variant");
			assert.equal(this.oModel.getData()[sVMReference].variants[3].remove, false, "a end user cannot removed its own users PUBLIC variant");
			assert.equal(this.oModel.getData()[sVMReference].variants[3].change, false, "a end user cannot changed its own users PUBLIC variant");
			assert.equal(this.oModel.getData()[sVMReference].variants[4].rename, true, "a end user can renamed its own users variant");
			assert.equal(this.oModel.getData()[sVMReference].variants[4].remove, true, "a end user can removed its own users variant");
			assert.equal(this.oModel.getData()[sVMReference].variants[4].change, true, "a end user can changed its own users variant");

			Settings.getInstanceOrUndef.restore();
		});

		QUnit.test("when calling 'setModelPropertiesForControl' and variant management control has property editable=false", function(assert) {
			this.oModel.getData()[sVMReference]._isEditable = false;
			this.oModel.setModelPropertiesForControl(sVMReference, false, oDummyControl);
			assert.equal(this.oModel.getData()[sVMReference].variantsEditable, false, "the parameter variantsEditable is initially false");
			this.oModel.setModelPropertiesForControl(sVMReference, true, oDummyControl);
			assert.equal(this.oModel.getData()[sVMReference].variantsEditable, false, "the parameter variantsEditable stays false for bDesignTimeMode = true");
			this.oModel.setModelPropertiesForControl(sVMReference, false, oDummyControl);
			assert.equal(this.oModel.getData()[sVMReference].variantsEditable, false, "the parameter variantsEditable stays false for bDesignTimeMode = false");
		});

		QUnit.test("when calling 'setModelPropertiesForControl' with updateVariantInURL = true", function(assert) {
			assert.expect(8);
			this.oModel.getData()[sVMReference]._isEditable = true;
			this.oModel.getData()[sVMReference].updateVariantInURL = true;
			this.oModel.getData()[sVMReference].currentVariant = "variant0";
			var iUpdateCallCount = 0;
			var oParams = {};
			oParams[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = "foo";
			var oMockedURLParser = {
				parseShellHash: function() {
					return {
						params: oParams
					};
				}
			};
			sandbox.stub(this.oModel, "getUShellService").withArgs("URLParsing").returns(oMockedURLParser);
			sandbox.stub(URLHandler, "update").callsFake(function(mPropertyBag) {
				var mExpectedParameters = {
					parameters: [],
					updateURL: true,
					updateHashEntry: false,
					model: this.oModel
				};

				if (iUpdateCallCount === 1) {
					// second URLHandler.update() call with designTime mode being set from true -> false
					mExpectedParameters.parameters = ["currentHash1", "currentHash2"];
				}
				assert.strictEqual(mPropertyBag.model._bDesignTimeMode, iUpdateCallCount === 0, "then model's _bDesignTime property was set before URLHandler.update() was called");

				assert.deepEqual(mPropertyBag, mExpectedParameters, "then URLHandler.update() called with the correct parameters");
				iUpdateCallCount++;
			}.bind(this));
			sandbox.stub(URLHandler, "getStoredHashParams").returns(["currentHash1", "currentHash2"]);

			this.oModel.setModelPropertiesForControl(sVMReference, false, oDummyControl);
			assert.strictEqual(URLHandler.getStoredHashParams.callCount, 0, "then URLHandler.getStoredHashParams() not called");
			assert.strictEqual(this.oModel._bDesignTimeMode, false, "the model's _bDesignTimeMode property is initially false");

			this.oModel.setModelPropertiesForControl(sVMReference, true, oDummyControl);
			assert.strictEqual(URLHandler.getStoredHashParams.callCount, 0, "then URLHandler.getStoredHashParams() not called");

			this.oModel.setModelPropertiesForControl(sVMReference, false, oDummyControl);
			assert.strictEqual(URLHandler.getStoredHashParams.callCount, 1, "then URLHandler.getStoredHashParams() called once");
		});

		QUnit.test("when calling 'switchToDefaultForVariant' for a current variant reference", function(assert) {
			var fnDone = assert.async();
			this.oModel.oData[sVMReference].currentVariant = "variant0";
			sandbox.stub(this.oModel, "updateCurrentVariant").callsFake(function(mPropertyBag) {
				assert.equal(mPropertyBag.variantManagementReference, sVMReference, "the correct variant management reference was passed");
				assert.equal(mPropertyBag.newVariantReference, this.oModel.oData[sVMReference].defaultVariant, "the correct variant reference was passed");
				return Promise.resolve().then(fnDone);
			}.bind(this));
			this.oModel.switchToDefaultForVariant("variant0");
		});

		QUnit.test("when calling 'switchToDefaultForVariant' for a variant reference which is not the current variant", function(assert) {
			sandbox.stub(this.oModel, "updateCurrentVariant").returns(Promise.resolve());
			this.oModel.switchToDefaultForVariant("variant0");
			assert.strictEqual(this.oModel.updateCurrentVariant.callCount, 0, "then VariantModel.updateCurrentVariant not called");
		});

		QUnit.test("when calling 'switchToDefaultForVariant' without a variant reference", function(assert) {
			var fnDone = assert.async();
			this.oModel.oData["dummy"] = {
				defaultVariant: "dummyDefaultVariant",
				currentVariant: "dummyCurrentVariant"
			};
			// currentVariant and defaultVariant should be different
			this.oModel.oData[sVMReference].currentVariant = "mockCurrentVariant";

			var aVariantManagementReferences = [sVMReference, "dummy"];

			sandbox.stub(this.oModel, "updateCurrentVariant").callsFake(function(mPropertyBag) {
				var iIndex = aVariantManagementReferences.indexOf(mPropertyBag.variantManagementReference);
				assert.equal(mPropertyBag.variantManagementReference, aVariantManagementReferences[iIndex], "the correct variant management reference was passed");
				assert.equal(mPropertyBag.newVariantReference, this.oModel.oData[aVariantManagementReferences[iIndex]].defaultVariant, "the correct variant reference was passed");
				aVariantManagementReferences.splice(iIndex, 1);
				if (aVariantManagementReferences.length === 0) {
					fnDone();
				}
				return Promise.resolve();
			}.bind(this));
			this.oModel.switchToDefaultForVariant();
		});

		QUnit.test("when calling 'switchToDefaultForVariantManagement' for a variant management reference", function(assert) {
			// currentVariant and defaultVariant should be different
			this.oModel.oData[sVMReference].currentVariant = "mockCurrentVariant";
			sandbox.stub(this.oModel, "updateCurrentVariant").resolves();
			this.oModel.switchToDefaultForVariantManagement(sVMReference);
			assert.deepEqual(this.oModel.updateCurrentVariant.getCall(0).args[0], {
				variantManagementReference: sVMReference,
				newVariantReference: this.oModel.oData[sVMReference].defaultVariant
			}, "then VariantModel.updateCurrentVariant called once with the correct parameters");
		});

		QUnit.test("when calling 'getVariantManagementReference'", function(assert) {
			var mVariantManagementReference = this.oModel.getVariantManagementReference("variant1");
			assert.deepEqual(mVariantManagementReference, {
				variantIndex: 2,
				variantManagementReference: sVMReference
			}, "then the correct variant management reference is returned");
		});

		QUnit.test("when calling 'getVariantTitle'", function(assert) {
			var sPropertyValue = this.oModel.getVariantTitle("variant1", sVMReference);
			assert.equal(sPropertyValue, this.oModel.oData[sVMReference].variants[2].title, "then the correct title value is returned");
		});

		[
			{
				inputParams: {
					changeType: "setTitle",
					title: "New Title",
					// layer: Layer.CUSTOMER,
					variantReference: "variant1"
				},
				variantCheck: {
					functionName: "getName",
					returnValue: "New Title"
				},
				fileType: "ctrl_variant_change",
				textKey: "title"
			},
			{
				inputParams: {
					changeType: "setFavorite",
					favorite: false,
					variantReference: "variant1"
				},
				variantCheck: {
					functionName: "getFavorite",
					returnValue: false
				},
				expectedChangeContent: {
					favorite: false
				},
				fileType: "ctrl_variant_change"
			},
			{
				inputParams: {
					changeType: "setVisible",
					visible: false,
					variantReference: "variant1"
				},
				variantCheck: {
					functionName: "getVisible",
					returnValue: false
				},
				expectedChangeContent: {
					createdByReset: false,
					visible: false
				},
				fileType: "ctrl_variant_change"
			},
			{
				inputParams: {
					changeType: "setExecuteOnSelect",
					executeOnSelect: true,
					variantReference: "variant1"
				},
				variantCheck: {
					functionName: "getExecuteOnSelection",
					returnValue: true
				},
				expectedChangeContent: {
					executeOnSelect: true
				},
				fileType: "ctrl_variant_change"
			},
			{
				inputParams: {
					changeType: "setContexts",
					contexts: { role: ["ADMIN"], country: ["DE"] },
					variantReference: "variant1"
				},
				variantCheck: {
					functionName: "getContexts",
					returnValue: { role: ["ADMIN"], country: ["DE"] }
				},
				expectedChangeContent: {
					contexts: { role: ["ADMIN"], country: ["DE"] }
				},
				fileType: "ctrl_variant_change"
			},
			{
				inputParams: {
					changeType: "setDefault",
					defaultVariant: "variant0",
					variantManagementReference: sVMReference
				},
				expectedChangeContent: {
					defaultVariant: "variant0"
				},
				fileType: "ctrl_variant_management_change"
			}
		].forEach(function(oTestParams) {
			QUnit.test("when calling 'addVariantChange' for " + oTestParams.inputParams.changeType + " to add a change", function(assert) {
				oTestParams.inputParams.appComponent = this.oComponent;
				var fnAddDirtyChangeStub = sandbox.stub(this.oModel.oChangePersistence, "addDirtyChange");
				sandbox.stub(ContextBasedAdaptationsAPI, "hasAdaptationsModel").returns(true);
				sandbox.stub(ContextBasedAdaptationsAPI, "getDisplayedAdaptationId").returns("id_12345");
				var oVariantInstance = createVariant(this.oModel.oData[sVMReference].variants[2]);
				sandbox.stub(this.oModel, "getVariant").returns({instance: oVariantInstance});

				var oChange = this.oModel.addVariantChange(sVMReference, oTestParams.inputParams);
				if (oTestParams.textKey) {
					assert.strictEqual(oChange.getText(oTestParams.textKey), oTestParams.inputParams.title, "then the new change created with the new title");
				}
				if (oTestParams.expectedChangeContent) {
					assert.deepEqual(oChange.getContent(), oTestParams.expectedChangeContent, "the change content was set");
				}
				if (oTestParams.variantCheck) {
					assert.deepEqual(oVariantInstance[oTestParams.variantCheck.functionName](), oTestParams.variantCheck.returnValue, "the variant was updated");
				}
				assert.strictEqual(oChange.getChangeType(), oTestParams.inputParams.changeType, "then the new change created with 'setTitle' as changeType");
				assert.strictEqual(oChange.getAdaptationId(), "id_12345", "then the new change created with the current adaptationId");
				assert.strictEqual(oChange.getFileType(), oTestParams.fileType, "then the new change created with 'ctrl_variant_change' as fileType");
				assert.ok(fnAddDirtyChangeStub.calledWith(oChange), "then 'FlexController.addDirtyChange called with the newly created change");
			});
		});

		QUnit.test("when calling 'deleteVariantChange'", function(assert) {
			var fnChangeStub = sandbox.stub().returns({
				convertToFileContent: function() {}
			});
			var mPropertyBag = {foo: "bar"};
			var oDeleteChangeStub = sandbox.stub(this.oModel.oChangePersistence, "deleteChange");
			var oSetPropertiesStub = sandbox.stub(this.oModel, "setVariantProperties");
			this.oModel.deleteVariantChange(sVMReference, mPropertyBag, fnChangeStub());
			assert.ok(oDeleteChangeStub.calledWith(fnChangeStub()), "then 'FlexController.deleteChange' called with the passed change");
			assert.ok(oSetPropertiesStub.calledWith(sVMReference, mPropertyBag), "the correct properties were passed");
		});

		QUnit.test("when calling 'setVariantProperties' for 'setDefault' with different current and default variants, in UI adaptation mode", function(assert) {
			sandbox.stub(this.oModel, "getVariant").returns({instance: createVariant(this.oModel.oData[sVMReference].variants[2])});
			var mPropertyBag = {
				changeType: "setDefault",
				defaultVariant: "variant1",
				layer: Layer.CUSTOMER,
				variantManagementReference: sVMReference,
				appComponent: this.oComponent,
				change: {
					convertToFileContent: function() {}
				}
			};
			sandbox.stub(URLHandler, "getStoredHashParams").returns([]);
			sandbox.stub(this.oModel.oChangePersistence, "addDirtyChange");
			sandbox.stub(URLHandler, "update");

			// set adaptation mode true
			this.oModel._bDesignTimeMode = true;

			// mock current variant id to make it different
			this.oModel.oData[sVMReference].currentVariant = "variantCurrent";

			this.oModel.setVariantProperties(sVMReference, mPropertyBag);
			assert.ok(URLHandler.update.calledWithExactly({
				parameters: [this.oModel.oData[sVMReference].currentVariant],
				updateURL: !this.oModel._bDesignTimeMode,
				updateHashEntry: true,
				model: this.oModel
			}), "then the URLHandler.update() called with the current variant id as a parameter in UI adaptation mode");
		});

		QUnit.test("when calling 'setVariantProperties' for 'setDefault' with same current and default variants, in personalization mode", function(assert) {
			sandbox.stub(this.oModel, "getVariant").returns({instance: createVariant(this.oModel.oData[sVMReference].variants[2])});
			var mPropertyBag = {
				changeType: "setDefault",
				defaultVariant: "variant1",
				layer: Layer.CUSTOMER,
				variantManagementReference: sVMReference,
				appComponent: this.oComponent,
				change: {
					convertToFileContent: function() {}
				}
			};
			// current variant already exists in hash parameters
			sandbox.stub(URLHandler, "getStoredHashParams").returns([this.oModel.oData[sVMReference].currentVariant]);
			sandbox.stub(this.oModel.oChangePersistence, "addDirtyChange");
			sandbox.stub(URLHandler, "update");

			// set adaptation mode false
			this.oModel._bDesignTimeMode = false;

			this.oModel.setVariantProperties(sVMReference, mPropertyBag);
			assert.ok(URLHandler.update.calledWithExactly({
				parameters: [],
				updateURL: !this.oModel._bDesignTimeMode,
				updateHashEntry: true,
				model: this.oModel
			}), "then the URLHandler.update() called without the current variant id as a parameter in personalization mode");
		});

		QUnit.test("when calling 'updateCurrentVariant' with root app component", function(assert) {
			sandbox.stub(Switcher, "switchVariant").resolves();
			var oSetVariantSwitchPromiseStub = sandbox.stub(this.oFlexController, "setVariantSwitchPromise");
			var oCallVariantSwitchListenersStub = sandbox.stub(this.oModel, "callVariantSwitchListeners");

			assert.equal(this.oModel.oData[sVMReference].currentVariant, "variant1", "then initially current variant was correct before updating");
			assert.equal(this.oModel.oData[sVMReference].originalCurrentVariant, "variant1", "then initially original current variant was correct before updating");

			this.oModel.oData[sVMReference].updateVariantInURL = true;
			return this.oModel.updateCurrentVariant({
				variantManagementReference: sVMReference,
				newVariantReference: "variant0",
				appComponent: this.oModel.oAppComponent
			}).then(function() {
				assert.ok(Switcher.switchVariant.calledWith({
					vmReference: sVMReference,
					currentVReference: "variant1",
					newVReference: "variant0",
					flexController: this.oModel.oFlexController,
					appComponent: this.oModel.oAppComponent,
					modifier: JsControlTreeModifier,
					reference: this.oModel.sFlexReference
				}), "then ChangePersistence.loadSwitchChangesMapForComponent() called with correct parameters");
				assert.ok(oSetVariantSwitchPromiseStub.calledBefore(Switcher.switchVariant), "the switch variant promise was set before switching");
				assert.equal(oCallVariantSwitchListenersStub.callCount, 1, "the listeners were called");
			}.bind(this));
		});

		QUnit.test("when calling 'updateCurrentVariant' without a root app component", function(assert) {
			sandbox.stub(Switcher, "switchVariant").resolves();
			var oSetVariantSwitchPromiseStub = sandbox.stub(this.oFlexController, "setVariantSwitchPromise");

			this.oModel.oData[sVMReference].updateVariantInURL = true;
			return this.oModel.updateCurrentVariant({
				variantManagementReference: sVMReference,
				newVariantReference: "variant0"
			}).then(function() {
				assert.ok(Switcher.switchVariant.calledWith({
					vmReference: sVMReference,
					currentVReference: "variant1",
					newVReference: "variant0",
					flexController: this.oModel.oFlexController,
					appComponent: this.oModel.oAppComponent,
					modifier: JsControlTreeModifier,
					reference: this.oModel.sFlexReference
				}), "then ChangePersistence.loadSwitchChangesMapForComponent() called with correct parameters");
				assert.ok(oSetVariantSwitchPromiseStub.calledBefore(Switcher.switchVariant), "the switch variant promise was set before switching");
			}.bind(this));
		});

		QUnit.test("when calling 'updateCurrentVariant' twice without waiting for the first one to be finished", function(assert) {
			assert.equal(this.oModel.oData[sVMReference].currentVariant, "variant1", "then initially current variant was correct before updating");
			assert.equal(this.oModel.oData[sVMReference].originalCurrentVariant, "variant1", "then initially original current variant was correct before updating");

			var oSetVariantSwitchPromiseStub = sandbox.stub(this.oFlexController, "setVariantSwitchPromise");

			var oSwitchVariantStub = sandbox.stub(Switcher, "switchVariant")
				.onCall(0).returns(new Promise(function(resolve) {
					setTimeout(function() {
						resolve();
					}, 0);
				}))
				.onCall(1).resolves();

			// first call
			this.oModel.updateCurrentVariant({
				variantManagementReference: sVMReference,
				newVariantReference: "variant2",
				appComponent: this.oModel.oAppComponent
			});

			// second call
			return this.oModel.updateCurrentVariant({
				variantManagementReference: sVMReference,
				newVariantReference: "variant0",
				appComponent: this.oModel.oAppComponent
			})
			.then(this.oModel._oVariantSwitchPromise)
			.then(function() {
				assert.equal(oSwitchVariantStub.callCount, 2, "then Switcher.switchVariant() was called twice");
				assert.equal(oSetVariantSwitchPromiseStub.callCount, 2, "then variant switch promise was set twice inside FlexController");
			});
		});

		QUnit.test("when calling 'updateCurrentVariant' twice without waiting for the first one to be failed and finished", function(assert) {
			assert.expect(5);
			assert.equal(this.oModel.oData[sVMReference].currentVariant, "variant1", "then initially current variant was correct before updating");
			assert.equal(this.oModel.oData[sVMReference].originalCurrentVariant, "variant1", "then initially original current variant was correct before updating");

			var oSetVariantSwitchPromiseStub = sandbox.stub(this.oFlexController, "setVariantSwitchPromise");
			var SwitchVariantStub = sandbox.stub(Switcher, "switchVariant")
				.onCall(0).callsFake(function() {
					return new Promise(function(resolve, reject) {
						setTimeout(reject, 0);
					});
				})
				.onCall(1).callsFake(function() {
					return Promise.resolve();
				});

			// first call with a Promise.reject()
			this.oModel.updateCurrentVariant({
				variantManagementReference: sVMReference,
				newVariantReference: "variant2",
				appComponent: this.oModel.oAppComponent
			}).catch(function() {
				assert.ok(true, "then the first promise was rejected");
			});

			// second call with a Promise.resolve()
			return this.oModel.updateCurrentVariant({
				variantManagementReference: sVMReference,
				newVariantReference: "variant0",
				appComponent: this.oModel.oAppComponent
			}).then(function() {
				assert.equal(SwitchVariantStub.callCount, 2, "then Switcher.switchVariant() was called twice");
				assert.equal(oSetVariantSwitchPromiseStub.callCount, 2, "then variant switch promise was set twice inside FlexController");
			});
		});

		QUnit.test("when calling '_ensureStandardVariantExists'", function(assert) {
			var oExpectedVariant = {
				id: "mockVariantManagement",
				reference: "MyComponent",
				user: VariantUtil.DEFAULT_AUTHOR,
				variantManagementReference: "mockVariantManagement",
				variantName: oResourceBundle.getText("STANDARD_VARIANT_TITLE"),
				layer: Layer.BASE
			};

			var oAddFakeVariantStub = sandbox.stub(VariantManagementState, "addFakeStandardVariant");
			var oCreateVariantStub = sandbox.stub(FlexObjectFactory, "createFlVariant").returns("variant");
			this.oModel.setData({});
			this.oModel._ensureStandardVariantExists("mockVariantManagement");

			assert.strictEqual(oAddFakeVariantStub.callCount, 1, "a variant was added");
			assert.deepEqual(oAddFakeVariantStub.firstCall.args[3], "variant", "the standard variant was added correctly");
			assert.strictEqual(oCreateVariantStub.callCount, 1, "a variant was created");
			assert.deepEqual(oCreateVariantStub.firstCall.args[0], oExpectedVariant, "the standard variant was created correctly");
		});

		[true, false].forEach(function(bVendorLayer) {
			QUnit.test(bVendorLayer ? "when calling 'copyVariant' in VENDOR layer" : "when calling 'copyVariant'", function(assert) {
				sandbox.stub(Settings, "getInstanceOrUndef").returns({
					getUserId: function() {return "test user";}
				});
				var oVariantData = {
					instance: createVariant({
						fileName: "variant0",
						variantManagementReference: sVMReference,
						variantReference: "",
						reference: "Dummy",
						layer: Layer.CUSTOMER,
						title: "Text for TextDemo",
						author: "test user"
					}),
					controlChanges: [],
					variantChanges: {}
				};
				sandbox.stub(this.oModel, "_duplicateVariant").returns(oVariantData);
				sandbox.stub(JsControlTreeModifier, "getSelector").returns({id: sVMReference});
				sandbox.stub(this.oModel.oChangePersistence, "addDirtyChange").returnsArg(0);

				var mPropertyBag = {
					variantManagementReference: sVMReference,
					appComponent: this.oComponent,
					generator: "myFancyGenerator",
					layer: bVendorLayer ? Layer.VENDOR : Layer.CUSTOMER
				};
				sandbox.stub(this.oModel, "updateCurrentVariant").resolves();
				return this.oModel.copyVariant(mPropertyBag).then(function(aChanges) {
					assert.deepEqual(
						_omit(this.oModel.oData[sVMReference].variants[5], "author"),
						{
							key: "variant0",
							rename: true,
							change: true,
							remove: true,
							sharing: this.oModel.sharing.PUBLIC
						},
						"then variant added to VariantModel"
					);
					assert.strictEqual(this.oModel.oData[sVMReference].variants[5].author, bVendorLayer ? "SAP" : "test user");
					assert.equal(aChanges[0].getId(), oVariantData.instance.getId(), "then the returned variant is the duplicate variant");
				}.bind(this));
			});
		});

		QUnit.test("when calling 'copyVariant' with public layer", function(assert) {
			var oVariantData = {
				instance: createVariant({
					fileName: "variant0",
					variantManagementReference: "variantMgmtId1",
					variantReference: "",
					reference: "Dummy",
					layer: Layer.PUBLIC,
					title: "Text for TextDemo",
					author: ""
				}),
				controlChanges: [],
				variantChanges: {}
			};
			sandbox.stub(this.oModel, "_duplicateVariant").returns(oVariantData);
			sandbox.stub(JsControlTreeModifier, "getSelector").returns({id: "variantMgmtId1"});
			sandbox.stub(this.oModel.oChangePersistence, "addDirtyChange").returnsArg(0);
			sandbox.stub(this.oModel, "updateCurrentVariant").resolves();

			var mPropertyBag = {
				variantManagementReference: "variantMgmtId1",
				appComponent: this.oComponent,
				generator: "myFancyGenerator",
				layer: Layer.PUBLIC
			};
			return this.oModel.copyVariant(mPropertyBag).then(function(aChanges) {
				assert.ok(this.oModel.getVariant("variant0", "variantMgmtId1"), "then variant added to VariantModel");
				assert.equal(oVariantData.instance.getFavorite(), false, "then variant has favorite set to false");
				assert.equal(aChanges.length, 2, "then there are 2 changes");
				assert.equal(aChanges[0].getLayer(), Layer.USER, "the first change is a user layer change");
				assert.equal(aChanges[0].getChangeType(), "setFavorite", "with changeType 'setFavorite'");
				assert.deepEqual(aChanges[0].getContent(), {favorite: true}, "and favorite set to true");
				assert.equal(aChanges[1].getLayer(), Layer.PUBLIC, "then the second change is a public layer change");
				assert.equal(aChanges[1].getId(), oVariantData.instance.getId(), "then the returned variant is the duplicate variant");
			}.bind(this));
		});

		QUnit.test("when calling 'removeVariant' with a component", function(assert) {
			var fnDeleteChangeStub = sandbox.stub(this.oModel.oChangePersistence, "deleteChange");
			var oChangeInVariant = {
				fileName: "change0",
				variantReference: "variant0",
				layer: Layer.VENDOR,
				getId: function() {
					return this.fileName;
				},
				getVariantReference: function() {
					return this.variantReference;
				}
			};
			var oVariant = {
				fileName: "variant0",
				getId: function() {
					return this.fileName;
				}
			};
			var aDummyDirtyChanges = [oVariant].concat(oChangeInVariant);

			var fnUpdateCurrentVariantSpy = sandbox.stub(this.oModel, "updateCurrentVariant").resolves();
			sandbox.stub(this.oModel.oChangePersistence, "getDirtyChanges").returns(aDummyDirtyChanges);

			assert.equal(this.oModel.oData[sVMReference].variants.length, 5, "then initial length is 5");
			var mPropertyBag = {
				variant: oVariant,
				sourceVariantReference: "sourceVariant",
				variantManagementReference: sVMReference,
				component: this.oModel.oAppComponent
			};
			return this.oModel.removeVariant(mPropertyBag).then(function() {
				assert.deepEqual(fnUpdateCurrentVariantSpy.getCall(0).args[0], {
					variantManagementReference: mPropertyBag.variantManagementReference,
					newVariantReference: mPropertyBag.sourceVariantReference,
					appComponent: mPropertyBag.component
				}, "then updateCurrentVariant() called with the correct parameters");
				assert.ok(fnDeleteChangeStub.calledTwice, "then ChangePersistence.deleteChange called twice");
				assert.ok(fnDeleteChangeStub.calledWith(oChangeInVariant), "then ChangePersistence.deleteChange called for change in variant");
				assert.ok(fnDeleteChangeStub.calledWith(oVariant), "then ChangePersistence.deleteChange called for variant");
			});
		});

		QUnit.test("when calling 'collectModelChanges'", function(assert) {
			this.oModel.getData()[sVMReference].variants[1].title = "test";
			this.oModel.getData()[sVMReference].variants[1].favorite = false;
			this.oModel.getData()[sVMReference].variants[1].visible = false;
			this.oModel.getData()[sVMReference].variants[1].executeOnSelect = true;
			this.oModel.getData()[sVMReference].variants[1].contexts = { role: ["ADMIN"], country: ["DE"] };
			this.oModel.getData()[sVMReference].defaultVariant = "variant0";

			var aChanges = this.oModel.collectModelChanges(sVMReference, Layer.CUSTOMER);
			assert.equal(aChanges.length, 6, "then 6 changes with mPropertyBags were created");
		});

		QUnit.test("when calling 'collectModelChanges' and public variant is enabled", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isPublicFlVariantEnabled: function () {
					return true;
				}
			});
			this.oModel.getData()[sVMReference].defaultVariant = "variant0";
			// changes in public layer
			this.oModel.getData()[sVMReference].variants[2].title = "test";
			this.oModel.getData()[sVMReference].variants[2].favorite = true;
			this.oModel.getData()[sVMReference].variants[2].visible = false;
			// change in user layer
			this.oModel.getData()[sVMReference].variants[4].visible = false;

			var aChanges = this.oModel.collectModelChanges(sVMReference, Layer.USER);
			assert.equal(aChanges.length, 5, "then 5 changes with mPropertyBags were created");
			aChanges.forEach(function(oChange) {
				if (oChange.variantReference === "variant3" && oChange.changeType === "setVisible") {
					assert.equal(oChange.layer, Layer.USER, "keep variant USER layer in setVisible change");
				} else if (oChange.changeType === "setFavorite") {
					assert.equal(oChange.layer, Layer.USER, "set USER layer in setFavorite change");
				} else if (oChange.changeType === "setDefault") {
					assert.equal(oChange.layer, Layer.USER, "set USER layer in setDefault change");
				} else if (oChange.changeType === "setTitle") {
					assert.equal(oChange.layer, Layer.PUBLIC, "keep variant PUBLIC layer in setTitle change");
				} else if (oChange.variantReference === "variant1" && oChange.changeType === "setVisible") {
					assert.equal(oChange.layer, Layer.PUBLIC, "keep variant PUBLIC layer in setVisible change");
				}
			});
		});

		QUnit.test("when calling 'manageVariants' in Adaptation mode with changes", function(assert) {
			var oVariantManagement = new VariantManagement(sVMReference);
			var sLayer = Layer.CUSTOMER;
			var sDummyClass = "DummyClass";
			var oFakeComponentContainerPromise = {property: "fake"};
			oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());

			var oOpenManagementDialogStub = sandbox.stub(oVariantManagement, "openManagementDialog").callsFake(oVariantManagement.fireManage);
			var oVariantInstance = createVariant(this.oModel.oData[sVMReference].variants[1]);
			sandbox.stub(this.oModel, "getVariant").returns({instance: oVariantInstance});

			this.oModel.setModelPropertiesForControl(sVMReference, true, oVariantManagement);

			this.oModel.oData[sVMReference].variants[1].title = "test";
			this.oModel.oData[sVMReference].variants[1].favorite = false;
			this.oModel.oData[sVMReference].variants[1].visible = false;
			this.oModel.oData[sVMReference].variants[2].executeOnSelect = false;
			this.oModel.oData[sVMReference].variants[3].contexts = {foo: "bar"};
			this.oModel.oData[sVMReference].defaultVariant = "variant0";

			return this.oModel.manageVariants(oVariantManagement, sVMReference, sLayer, sDummyClass, oFakeComponentContainerPromise)
				.then(function(aChanges) {
					assert.equal(aChanges.length, 6, "then 6 changes were returned since changes were made in the manage dialog");
					assert.deepEqual(aChanges[0], {
						variantReference: "variant0",
						changeType: "setTitle",
						title: "test",
						originalTitle: "variant A",
						layer: Layer.CUSTOMER
					}, "the first change is correct");
					assert.deepEqual(aChanges[1], {
						variantReference: "variant0",
						changeType: "setFavorite",
						favorite: false,
						originalFavorite: true,
						layer: Layer.CUSTOMER
					}, "the first change is correct");
					assert.deepEqual(aChanges[2], {
						variantReference: "variant0",
						changeType: "setVisible",
						visible: false,
						layer: Layer.CUSTOMER
					}, "the first change is correct");
					assert.deepEqual(aChanges[3], {
						variantReference: "variant1",
						changeType: "setExecuteOnSelect",
						executeOnSelect: false,
						originalExecuteOnSelect: true,
						layer: Layer.CUSTOMER
					}, "the first change is correct");
					assert.deepEqual(aChanges[4], {
						variantReference: "variant2",
						changeType: "setContexts",
						contexts: {foo: "bar"},
						originalContexts: {},
						layer: Layer.CUSTOMER
					}, "the first change is correct");
					assert.deepEqual(aChanges[5], {
						variantManagementReference: sVMReference,
						changeType: "setDefault",
						defaultVariant: "variant0",
						originalDefaultVariant: "variant1",
						layer: Layer.CUSTOMER
					}, "the first change is correct");
					assert.ok(oOpenManagementDialogStub.calledWith(true, sDummyClass, oFakeComponentContainerPromise), "then openManagementControl is called with the right parameters");
					oVariantManagement.destroy();
				});
		});

		QUnit.test("when the VM Control fires the manage event in Personalization mode with dirty VM changes and UI Changes", function(assert) {
			var oVariantManagement = new VariantManagement(sVMReference);
			oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			var oVariantInstance = createVariant(this.oModel.getData()[sVMReference].variants[1]);
			sandbox.stub(this.oModel, "getVariant").returns({instance: oVariantInstance});

			this.oModel.getData()[sVMReference].variants[1].title = "test";
			this.oModel.getData()[sVMReference].variants[1].favorite = false;
			this.oModel.getData()[sVMReference].variants[1].visible = false;
			this.oModel.getData()[sVMReference].defaultVariant = "variant0";

			var oAddVariantChangeStub = sandbox.stub(this.oModel, "addVariantChange");
			var oSaveDirtyChangesStub = sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges");

			oVariantManagement.fireManage(null, {variantManagementReference: sVMReference});
			var aArgs = oSaveDirtyChangesStub.lastCall.args;
			assert.equal(aArgs[0], this.oComponent, "the app component was passed");
			assert.equal(aArgs[1], false, "the second parameter is false");
			assert.deepEqual(aArgs[2].length, 4, "an array with 4 changes was passed");
			assert.strictEqual(oAddVariantChangeStub.callCount, 4, "4 changes were added");
			oVariantManagement.destroy();
		});

		QUnit.test("when calling '_initializeManageVariantsEvents'", function(assert) {
			assert.notOk(this.oModel.fnManageClick, "the function 'this.fnManageClick' is not available before");
			assert.notOk(this.oModel.fnManageClickRta, "the function 'this.fnManageClickRta' is not available before");
			this.oModel._initializeManageVariantsEvents();
			assert.ok(this.oModel.fnManageClick, "the function 'this.fnManageClick' is available afterwards");
			assert.ok(this.oModel.fnManageClick, "the function 'this.fnManageClick' is available afterwards");
		});

		QUnit.test("when calling '_getDirtyChangesFromVariantChanges'", function(assert) {
			var oChange1 = FlexObjectFactory.createFromFileContent({
				fileName: "change1",
				selector: {
					id: "abc123"
				}
			});
			var oChange2 = FlexObjectFactory.createFromFileContent({
				fileName: "change2",
				selector: {
					id: "abc123"
				}
			});
			var oChange3 = FlexObjectFactory.createFromFileContent({
				fileName: "change3",
				selector: {
					id: "abc123"
				}
			});
			oChange2.setSavedToVariant(true);
			var aControlChanges = [oChange1, oChange2, oChange3];

			sandbox.stub(this.oModel.oChangePersistence, "getDirtyChanges").returns(aControlChanges);

			var aDirtyChanges = this.oModel._getDirtyChangesFromVariantChanges(aControlChanges);
			assert.equal(aDirtyChanges.length, 2, "only two of the given changes are returned as dirty by the model");
			assert.equal(aDirtyChanges[0].getId(), "change1", "change1 is dirty");
			assert.equal(aDirtyChanges[1].getId(), "change3", "change3 is dirty");
		});

		QUnit.test("when calling '_handleSaveEvent' with parameter from SaveAs button and default/execute box checked", function(assert) {
			assert.expect(12);
			var oChange1 = FlexObjectFactory.createFromFileContent({
				fileName: "change1",
				selector: {
					id: "abc123"
				}
			});
			var oChange2 = FlexObjectFactory.createFromFileContent({
				fileName: "change2",
				selector: {
					id: "abc123"
				}
			});
			var oChange3 = FlexObjectFactory.createFromFileContent({
				fileName: "change3",
				selector: {
					id: "abc123"
				}
			});

			var oVariantManagement = new VariantManagement(sVMReference);
			var sCopyVariantName = "variant1";
			var oCopiedVariantContent = {
				title: "Personalization Test Variant",
				variantManagementReference: sVMReference,
				variantReference: sCopyVariantName,
				layer: Layer.USER,
				contexts: {
					role: ["testRole"]
				}
			};
			var oCopiedVariant = createVariant(oCopiedVariantContent);
			var oEvent = {
				getParameters: function() {
					return {
						overwrite: false,
						name: "Test",
						def: true,
						execute: true,
						contexts: {
							role: ["testRole"]
						}
					};
				},
				getSource: function() {
					return oVariantManagement;
				}
			};
			var sUserName = "testUser";
			var oResponse = {response: [{fileName: sCopyVariantName, support: {user: sUserName}}]};

			sandbox.stub(this.oModel, "getLocalId").returns(sVMReference);
			sandbox.stub(VariantManagementState, "getControlChangesForVariant").returns([oChange1, oChange2, oChange3]);
			sandbox.stub(this.oModel.oChangePersistence, "getDirtyChanges").returns([oCopiedVariant, oChange1, oChange2, oChange3]);
			sandbox.stub(this.oModel.oFlexController, "deleteChange");
			sandbox.stub(this.oModel, "copyVariant").resolves([oCopiedVariant, {fileName: "change1"}, {fileName: "change2"}, {fileName: "change3"}]);
			sandbox.stub(this.oModel, "addVariantChange").returns({fileName: "changeWithSetDefault"});
			sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges").resolves(oResponse);
			sandbox.spy(Utils, "createDefaultFileName");

			return this.oModel._handleSaveEvent(oEvent)
				.then(function() {
					var sNewVariantReference = Utils.createDefaultFileName.getCall(0).returnValue;
					assert.strictEqual(Utils.createDefaultFileName.getCall(0).args[0], "flVariant", "then the file type was passed to sap.ui.fl.Utils.createDefaultFileName");
					assert.equal(this.oModel.copyVariant.called, 1, "then copyVariant() was called once");
					assert.deepEqual(this.oModel.copyVariant.lastCall.args[0], {
						appComponent: this.oComponent,
						layer: Layer.USER,
						generator: undefined,
						contexts: {
							role: ["testRole"]
						},
						newVariantReference: sNewVariantReference,
						sourceVariantReference: oCopiedVariant.getVariantReference(),
						title: "Test",
						variantManagementReference: sVMReference
					}, "then copyVariant() was called with the right parameters");

					assert.equal(this.oModel.addVariantChange.callCount, 2, "then addVariantChange() was called twice; for setDefault and setExecuteOnSelect");
					assert.equal(this.oModel.oChangePersistence.saveDirtyChanges.callCount, 1, "then dirty changes were saved");
					assert.equal(this.oModel.oChangePersistence.saveDirtyChanges.args[0][2].length, 6, "then six dirty changes were saved (new variant, 3 copied ctrl changes, setDefault change, setExecuteOnSelect change");
					assert.equal(this.oModel.oChangePersistence.saveDirtyChanges.args[0][2][4].fileName, "changeWithSetDefault", "the last change was 'setDefault'");
					assert.ok(this.oModel.oFlexController.deleteChange.calledBefore(this.oModel.oChangePersistence.saveDirtyChanges), "the changes were deleted from default variant before the copied variant was saved");
					[oChange1, oChange2, oChange3].forEach(function(oDirtyChange) {
						assert.ok(this.oModel.oFlexController.deleteChange.calledWith(oDirtyChange), "then dirty changes from source variant were deleted from the persistence");
					}.bind(this));
					this.oModel.getData()[sVMReference].variants.forEach(function(oVariant) {
						if (oVariant.key === sCopyVariantName) {
							assert.equal(oVariant.author, sUserName, "then 'testUser' is add as author");
						}
					});
					oVariantManagement.destroy();
				}.bind(this));
		});

		QUnit.test("when calling '_handleSaveEvent' on a USER variant with setDefault, executeOnSelect and public boxes checked", function(assert) {
			var oVariantManagement = new VariantManagement(sVMReference);
			var oCopiedVariant = createVariant({
				title: "Personalization Test Variant",
				variantManagementReference: sVMReference,
				variantReference: "variant1",
				layer: Layer.USER
			});
			sandbox.stub(VariantManagementState, "getControlChangesForVariant").returns([]);
			sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges").resolves();
			var oCopyVariantStub = sandbox.stub(this.oModel, "copyVariant").resolves([oCopiedVariant]);
			var oAddVariantChangeStub = sandbox.stub(this.oModel, "addVariantChange").returns();
			var oEvent = {
				getParameters: function() {
					return {
						name: "Test",
						def: true,
						"public": true,
						execute: true
					};
				},
				getSource: function() {
					return oVariantManagement;
				}
			};

			return this.oModel._handleSaveEvent(oEvent)
				.then(function() {
					assert.ok(
						oCopyVariantStub.calledOnceWith(sinon.match({
							layer: Layer.PUBLIC
						})),
						"then the variant is created on the PUBLIC layer"
					);
					assert.strictEqual(
						oAddVariantChangeStub.callCount,
						2,
						"then addVariantChange() was called twice; for setDefault and setExecuteOnSelect"
					);
					assert.ok(
						oAddVariantChangeStub.alwaysCalledWith(
							sVMReference,
							sinon.match({
								layer: Layer.USER
							})
						),
						"then the variant changes are created on the USER layer"
					);
					oVariantManagement.destroy();
				});
		});

		QUnit.test("when calling '_handleSaveEvent' with parameter from SaveAs button and default box unchecked", function(assert) {
			var oChange1 = FlexObjectFactory.createFromFileContent({
				fileName: "change1",
				selector: {
					id: "abc123"
				}
			});
			var oChange2 = FlexObjectFactory.createFromFileContent({
				fileName: "change2",
				selector: {
					id: "abc123"
				}
			});
			var oChange3 = FlexObjectFactory.createFromFileContent({
				fileName: "change3",
				selector: {
					id: "abc123"
				}
			});

			var oVariantManagement = new VariantManagement(sVMReference);
			var oCopiedVariantContent = {
				title: "Personalization Test Variant",
				variantManagementReference: sVMReference,
				variantReference: "variant1",
				layer: Layer.USER,
				contexts: {
					role: ["testRole"]
				}
			};
			var oCopiedVariant = createVariant(oCopiedVariantContent);
			var oEvent = {
				getParameters: function() {
					return {
						overwrite: false,
						name: "Test",
						def: false
					};
				},
				getSource: function() {
					return oVariantManagement;
				}
			};

			sandbox.stub(this.oModel, "getLocalId").returns(sVMReference);
			sandbox.stub(VariantManagementState, "getControlChangesForVariant").returns([oChange1, oChange2, oChange3]);
			sandbox.stub(this.oModel.oChangePersistence, "getDirtyChanges").returns([oCopiedVariant, oChange1, oChange2, oChange3]);
			sandbox.stub(this.oModel.oFlexController, "deleteChange");
			sandbox.stub(this.oModel, "copyVariant").resolves([oCopiedVariant, {fileName: "change1"}, {fileName: "change2"}, {fileName: "change3"}]);
			sandbox.stub(this.oModel, "addVariantChange").returns({fileName: "changeWithSetDefault"});
			sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges").resolves();

			return this.oModel._handleSaveEvent(oEvent).then(function() {
				assert.equal(this.oModel.copyVariant.callCount, 1, "then copyVariant() was called once");
				assert.equal(this.oModel.addVariantChange.callCount, 0, "then addVariantChange() was not called");
				assert.equal(this.oModel.oChangePersistence.saveDirtyChanges.callCount, 1, "then dirty changes were saved");
				assert.ok(this.oModel.oFlexController.deleteChange.calledBefore(this.oModel.oChangePersistence.saveDirtyChanges), "the changes were deleted from default variant before the copied variant is saved");
				[oChange1, oChange2, oChange3].forEach(function(oDirtyChange) {
					assert.ok(this.oModel.oFlexController.deleteChange.calledWith(oDirtyChange), "then dirty changes from source variant were deleted from the persistence");
				}.bind(this));
				oVariantManagement.destroy();
			}.bind(this));
		});

		QUnit.test("when calling '_handleSaveEvent' with parameter from Save button, with no dirty changes existing after Save", function(assert) {
			var oChange1 = FlexObjectFactory.createFromFileContent({
				fileName: "change1",
				selector: {
					id: "abc123"
				}
			});
			var oChange2 = FlexObjectFactory.createFromFileContent({
				fileName: "change2",
				selector: {
					id: "abc123"
				}
			});

			var oVariantManagement = new VariantManagement(sVMReference);
			var oEvent = {
				getParameters: function() {
					return {
						overwrite: true,
						name: "Test"
					};
				},
				getSource: function() {
					return oVariantManagement;
				}
			};

			sandbox.stub(this.oModel, "getLocalId").returns(sVMReference);
			sandbox.stub(VariantManagementState, "getControlChangesForVariant").returns([oChange1, oChange2]);
			var fnCopyVariantStub = sandbox.stub(this.oModel, "copyVariant");
			var fnSetVariantPropertiesStub = sandbox.stub(this.oModel, "setVariantProperties");
			var fnSaveDirtyChangesStub = sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges").resolves();
			// only when getting it for the first time, second time they are asked when already saved
			sandbox.stub(this.oModel.oChangePersistence, "getDirtyChanges")
				.callThrough()
				.onFirstCall().returns([oChange1, oChange2]);

			return this.oModel._handleSaveEvent(oEvent).then(function() {
				assert.equal(fnCopyVariantStub.callCount, 0, "CopyVariant is not called");
				assert.equal(fnSetVariantPropertiesStub.callCount, 0, "SetVariantProperties is not called");
				assert.ok(fnSaveDirtyChangesStub.calledOnce, "SaveAll is called");
				oVariantManagement.destroy();
			});
		});

		QUnit.test("when calling '_handleSaveEvent' with bDesignTimeMode set to true", function(assert) {
			var fnDone = assert.async();
			var oVariantManagement = new VariantManagement(sVMReference);
			var oEvent = {
				getParameters: function() {
					return {
						overwrite: false,
						name: "Test",
						def: false
					};
				},
				getSource: function() {
					return oVariantManagement;
				}
			};

			this.oModel._bDesignTimeMode = true;

			var oHandleSaveSpy = sandbox.spy(this.oModel, "_handleSave");

			return this.oModel._handleSaveEvent(oEvent).then(function() {
				assert.equal(oHandleSaveSpy.callCount, 0, "then _handleSave() was not called");
				oVariantManagement.destroy();
				fnDone();
			});
		});

		QUnit.test("when calling '_handleSave' with with bDesignTimeMode set to true and parameters from SaveAs button and default/execute box checked", function(assert) {
			var sNewVariantReference = "variant2";
			var oChange1 = FlexObjectFactory.createFromFileContent({
				fileName: "change1",
				selector: {
					id: "abc123"
				}
			});
			var oChange2 = FlexObjectFactory.createFromFileContent({
				fileName: "change2",
				selector: {
					id: "abc123"
				}
			});
			var oChange3 = FlexObjectFactory.createFromFileContent({
				fileName: "change3",
				selector: {
					id: "abc123"
				}
			});

			var oVariantManagement = new VariantManagement(sVMReference);
			var sCopyVariantName = "variant1";
			var oCopiedVariantContent = {
				title: "Key User Test Variant",
				variantManagementReference: sVMReference,
				variantReference: sCopyVariantName,
				layer: Layer.CUSTOMER
			};
			var oCopiedVariant = createVariant(oCopiedVariantContent);
			var mParameters = {
				overwrite: false,
				name: "Key User Test Variant",
				def: true,
				execute: true,
				layer: Layer.CUSTOMER,
				newVariantReference: sNewVariantReference,
				generator: "myFancyGenerator",
				contexts: {
					role: ["testRole"]
				}
			};
			var sUserName = "testUser";
			var oResponse = {response: [{fileName: sCopyVariantName, support: {user: sUserName}}]};
			this.oModel._bDesignTimeMode = true;

			sandbox.stub(this.oModel, "getLocalId").returns(sVMReference);
			sandbox.stub(VariantManagementState, "getControlChangesForVariant")
				.callThrough()
				.withArgs({
					vmReference: sVMReference,
					vReference: this.oModel.oData[sVMReference].currentVariant,
					reference: this.oModel.sFlexReference
				})
				.returns([oChange1, oChange2, oChange3]);
			sandbox.stub(this.oModel.oChangePersistence, "getDirtyChanges").returns([oCopiedVariant, oChange1, oChange2, oChange3]);
			sandbox.stub(this.oModel.oFlexController, "deleteChange");
			sandbox.stub(this.oModel, "copyVariant").resolves([oCopiedVariant, {fileName: "change1"}, {fileName: "change2"}, {fileName: "change3"}]);
			sandbox.stub(this.oModel, "addVariantChange").returns({fileName: "changeWithSetDefault"});
			sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges").resolves(oResponse);
			sandbox.spy(Utils, "createDefaultFileName");

			return this.oModel._handleSave(oVariantManagement, mParameters)
				.then(function(aDirtyChanges) {
					assert.equal(this.oModel.copyVariant.called, 1, "then copyVariant() was called once");
					assert.deepEqual(this.oModel.copyVariant.lastCall.args[0], {
						appComponent: this.oComponent,
						layer: Layer.CUSTOMER,
						generator: "myFancyGenerator",
						newVariantReference: sNewVariantReference,
						sourceVariantReference: oCopiedVariant.getVariantReference(),
						title: "Key User Test Variant",
						variantManagementReference: sVMReference,
						contexts: {
							role: ["testRole"]
						}
					}, "then copyVariant() was called with the right parameters");
					assert.equal(this.oModel.addVariantChange.callCount, 2, "then addVariantChange() was called twice; for setDefault and setExecuteOnSelect");
					assert.equal(this.oModel.oChangePersistence.saveDirtyChanges.callCount, 0, "then dirty changes were not saved");
					assert.equal(aDirtyChanges.length, 6, "then six dirty changes were created (new variant, 3 copied ctrl changes, setDefault change, setExecuteOnSelect change");
					assert.equal(aDirtyChanges[5].fileName, "changeWithSetDefault", "the last change was 'setDefault'");
					assert.equal(aDirtyChanges[0].getLayer(), Layer.CUSTOMER, "the ctrl change has the correct layer");
					assert.ok(this.oModel.oFlexController.deleteChange.calledBefore(this.oModel.oChangePersistence.saveDirtyChanges), "the changes were deleted from default variant before the copied variant was saved");
					[oChange1, oChange2, oChange3].forEach(function(oDirtyChange) {
						assert.ok(this.oModel.oFlexController.deleteChange.calledWith(oDirtyChange), "then dirty changes from source variant were deleted from the persistence");
					}.bind(this));
					oVariantManagement.destroy();
				}.bind(this));
		});

		QUnit.test("when calling '_getVariantTitleCount' with a title having 2 occurrences", function(assert) {
			this.oModel.oData[sVMReference].variants.push({
				title: "SampleTitle Copy(5)",
				visible: true
			}, {
				title: "SampleTitle Copy(5)",
				visible: true
			});
			assert.strictEqual(this.oModel._getVariantTitleCount("SampleTitle Copy(5)", sVMReference), 2, "then 2 occurrences returned");
			this.oModel.oData[sVMReference].variants.splice(3, 1);
		});

		QUnit.test("when calling '_getVariantTitleCount' with a title having 4 occurrences with different cases of characters", function(assert) {
			this.oModel.oData[sVMReference].variants.push({
				title: "Test",
				visible: true
			}, {
				title: "TEST",
				visible: true
			}, {
				title: "tesT",
				visible: true
			}, {
				title: "test",
				visible: true
			});
			assert.strictEqual(this.oModel._getVariantTitleCount("TeSt", sVMReference), 4, "then 4 occurrences returned");
			this.oModel.oData[sVMReference].variants.splice(3, 4);
		});

		QUnit.test("when calling 'getVariant' without a variant management reference", function(assert) {
			assert.deepEqual(this.oModel.getVariant("variant0"), this.oModel.oData[sVMReference].variants[1], "the default Variant is returned");
		});

		QUnit.test("when 'getCurrentControlVariantIds' is called to get all current variant references", function(assert) {
			var oData = {
				variantManagementRef1: {
					currentVariant: "currentVariantRef1"
				},
				variantManagementRef2: {
					currentVariant: "currentVariantRef2"
				}
			};
			this.oModel.setData(oData);
			assert.deepEqual(
				this.oModel.getCurrentControlVariantIds(),
				[oData["variantManagementRef1"]["currentVariant"], oData["variantManagementRef2"]["currentVariant"]],
				"then the function returns an array current variant references"
			);
		});

		QUnit.test("when 'getCurrentControlVariantIds' is called with no variant model data", function(assert) {
			this.oModel.setData({});
			assert.deepEqual(this.oModel.getCurrentControlVariantIds(), [], "then the function returns an empty array");
		});

		QUnit.test("When eraseDirtyChangesOnVariant is called", function(assert) {
			var aDummyChanges = ["c1", "c2"];

			var oRevertMultipleChangesStub = sandbox.stub(Reverter, "revertMultipleChanges");
			var oGetControlChangesForVariantStub = sandbox.stub(VariantManagementState, "getControlChangesForVariant");
			sandbox.stub(this.oModel, "_getDirtyChangesFromVariantChanges").returns(aDummyChanges);
			sandbox.stub(this.oModel.oFlexController, "deleteChange");

			return this.oModel.eraseDirtyChangesOnVariant("vm1", "v1")
				.then(function(aChanges) {
					assert.deepEqual(aChanges, aDummyChanges, "then the correct changes are returned");
					assert.ok(oRevertMultipleChangesStub.calledOnce, "then the changes were reverted");
					assert.ok(oGetControlChangesForVariantStub.calledOnce, "then are changes are retrieved for the variant");
				});
		});

		QUnit.test("When addAndApplyChangesOnVariant is called", function(assert) {
			var aDummyChanges = [
				{
					fileName: "c1",
					getSelector: function() {}
				},
				{
					fileName: "c2",
					getSelector: function() {}
				}
			];
			var oAddPrepareChangesStub = sandbox.stub(this.oModel.oFlexController, "addPreparedChange");
			var oApplyChangeStub = sandbox.stub(this.oModel.oFlexController, "applyChange").resolves();
			sandbox.stub(JsControlTreeModifier, "getControlIdBySelector");

			return this.oModel.addAndApplyChangesOnVariant(aDummyChanges)
							.then(function() {
								assert.ok(oAddPrepareChangesStub.calledTwice, "then every change in the array was prepared");
								assert.ok(oApplyChangeStub.calledTwice, "then every change in the array was applied");
							});
		});
	});

	QUnit.module("_duplicateVariant", {
		beforeEach: function() {
			sandbox.stub(Settings, "getInstance").resolves({});
			this.oModel = new VariantModel({}, {
				flexController: {
					_oChangePersistence: {getComponentName: function() {return "foo";}}
				},
				appComponent: {getId: function() {}}
			});

			var oChange0 = FlexObjectFactory.createFromFileContent({
				fileName: "change0",
				adaptationId: "id_12345",
				selector: {id: "abc123"},
				variantReference: "variant0",
				layer: Layer.CUSTOMER,
				support: {},
				reference: "test",
				packageName: "MockPackageName"
			});
			var oChange1 = FlexObjectFactory.createFromFileContent({
				fileName: "change1",
				selector: {id: "abc123"},
				variantReference: "variant0",
				layer: Layer.USER,
				reference: "test"
			});
			this.oSourceVariant = {
				instance: createVariant({
					fileName: "variant0",
					title: "foo",
					adaptationId: "id_12345",
					variantManagementReference: sVMReference,
					variantReference: "variantReference",
					contexts: {
						role: ["testRole"]
					},
					layer: Layer.CUSTOMER
				}),
				controlChanges: [oChange0, oChange1],
				variantChanges: {}
			};

			sandbox.stub(this.oModel, "getVariant").returns(this.oSourceVariant);
			sandbox.stub(VariantManagementState, "getControlChangesForVariant").returns([oChange0, oChange1]);
			sandbox.stub(VariantManagementState, "clearFakeStandardVariants");

			return this.oModel.initialize();
		},
		afterEach: function() {
			this.oModel.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling '_duplicateVariant' on the same layer", function(assert) {
			sandbox.stub(ContextBasedAdaptationsAPI, "hasAdaptationsModel").returns(true);
			sandbox.stub(ContextBasedAdaptationsAPI, "getDisplayedAdaptationId").returns("id_12345");
			var mPropertyBag = {
				newVariantReference: "newVariant",
				sourceVariantReference: "variant0",
				variantManagementReference: sVMReference,
				layer: Layer.CUSTOMER,
				reference: "myReference",
				title: "variant A Copy",
				contexts: {
					role: ["testRole2"]
				}
			};

			var oDuplicateVariant = this.oModel._duplicateVariant(mPropertyBag);
			assert.strictEqual(oDuplicateVariant.instance.getName(), "variant A Copy", "the name is correct");
			assert.strictEqual(oDuplicateVariant.instance.getId(), "newVariant", "the id is correct");
			assert.strictEqual(oDuplicateVariant.instance.getLayer(), Layer.CUSTOMER, "the layer is correct");
			assert.strictEqual(oDuplicateVariant.instance.getAdaptationId(), "id_12345", "the adaptationId is correct");
			assert.deepEqual(oDuplicateVariant.instance.getContexts(), {role: ["testRole2"]}, "the contexts object is correct");
			assert.strictEqual(oDuplicateVariant.instance.getVariantReference(), "variantReference", "the variantReference is correct");
			assert.strictEqual(oDuplicateVariant.controlChanges.length, 2, "both changes were copied");
			assert.strictEqual(oDuplicateVariant.controlChanges[0].getSupportInformation().sourceChangeFileName, "change0", "the sourceChangeFileName is correct");
			assert.strictEqual(oDuplicateVariant.controlChanges[1].getSupportInformation().sourceChangeFileName, "change1", "the sourceChangeFileName is correct");
			assert.notEqual(oDuplicateVariant.controlChanges[0].getId(), "change0", "the fileName is different from the source");
			assert.notEqual(oDuplicateVariant.controlChanges[1].getId(), "change1", "the fileName is different from the source");
		});

		QUnit.test("when calling '_duplicateVariant' from USER layer referencing a CUSTOMER layer variant", function(assert) {
			var oFlexObjectFactorySpy = sandbox.spy(FlexObjectFactory, "createFromFileContent");
			var mPropertyBag = {
				newVariantReference: "newVariant",
				sourceVariantReference: "variant0",
				variantManagementReference: sVMReference,
				layer: Layer.USER,
				reference: "myReference",
				title: "variant A Copy",
				contexts: {
					role: ["testRole2"]
				}
			};

			var oDuplicateVariant = this.oModel._duplicateVariant(mPropertyBag);
			assert.notOk(oFlexObjectFactorySpy.getCall(0).args[0].adaptationId, "the properties for the change don't contain adaptationId");
			assert.strictEqual(oDuplicateVariant.instance.getName(), "variant A Copy", "the name is correct");
			assert.strictEqual(oDuplicateVariant.instance.getId(), "newVariant", "the id is correct");
			assert.strictEqual(oDuplicateVariant.instance.getLayer(), Layer.USER, "the layer is correct");
			assert.deepEqual(oDuplicateVariant.instance.getContexts(), {role: ["testRole2"]}, "the contexts object is correct");
			assert.strictEqual(oDuplicateVariant.instance.getVariantReference(), "variant0", "the variantReference is correct");
			assert.strictEqual(oDuplicateVariant.controlChanges.length, 1, "one change was copied");
			assert.strictEqual(oDuplicateVariant.controlChanges[0].getSupportInformation().sourceChangeFileName, "change1", "the sourceChangeFileName is correct");
		});

		QUnit.test("when calling '_duplicateVariant' from PUBLIC layer referencing a USER layer variant", function(assert) {
			var mPropertyBag = {
				newVariantReference: "newVariant",
				sourceVariantReference: "variant0",
				variantManagementReference: sVMReference,
				layer: Layer.PUBLIC,
				reference: "myReference",
				title: "variant A Copy",
				contexts: {
					role: ["testRole2"]
				}
			};
			this.oSourceVariant.instance.setLayer(Layer.USER);

			var oDuplicateVariant = this.oModel._duplicateVariant(mPropertyBag);
			assert.strictEqual(oDuplicateVariant.instance.getName(), "variant A Copy", "the name is correct");
			assert.strictEqual(oDuplicateVariant.instance.getId(), "newVariant", "the id is correct");
			assert.strictEqual(oDuplicateVariant.instance.getLayer(), Layer.PUBLIC, "the layer is correct");
			assert.deepEqual(oDuplicateVariant.instance.getContexts(), {role: ["testRole2"]}, "the contexts object is correct");
			assert.strictEqual(oDuplicateVariant.instance.getVariantReference(), "variantReference", "the variantReference is correct");
			assert.strictEqual(oDuplicateVariant.controlChanges.length, 1, "one change was copied");
			assert.strictEqual(oDuplicateVariant.controlChanges[0].getSupportInformation().sourceChangeFileName, "change1", "the sourceChangeFileName is correct");
			assert.strictEqual(oDuplicateVariant.controlChanges[0].getLayer(), Layer.PUBLIC, "the layer is correct");
		});

		QUnit.test("when calling '_duplicateVariant' from USER layer referencing a PUBLIC layer variant", function(assert) {
			var mPropertyBag = {
				newVariantReference: "newVariant",
				sourceVariantReference: "variant0",
				variantManagementReference: sVMReference,
				layer: Layer.USER,
				reference: "myReference",
				title: "variant A Copy",
				contexts: {
					role: ["testRole2"]
				}
			};
			this.oSourceVariant.instance.setLayer(Layer.PUBLIC);

			var oDuplicateVariant = this.oModel._duplicateVariant(mPropertyBag);
			assert.strictEqual(oDuplicateVariant.instance.getName(), "variant A Copy", "the name is correct");
			assert.strictEqual(oDuplicateVariant.instance.getId(), "newVariant", "the id is correct");
			assert.strictEqual(oDuplicateVariant.instance.getLayer(), Layer.USER, "the layer is correct");
			assert.deepEqual(oDuplicateVariant.instance.getContexts(), {role: ["testRole2"]}, "the contexts object is correct");
			assert.strictEqual(oDuplicateVariant.instance.getVariantReference(), "variant0", "the variantReference is correct");
			assert.strictEqual(oDuplicateVariant.controlChanges.length, 1, "one change was copied");
			assert.strictEqual(oDuplicateVariant.controlChanges[0].getSupportInformation().sourceChangeFileName, "change1", "the sourceChangeFileName is correct");
		});

		QUnit.test("when calling '_duplicateVariant' from PUBLIC layer referencing a USER layer variant, that references a PUBLIC layer variant", function(assert) {
			var mPropertyBag = {
				newVariantReference: "newVariant",
				sourceVariantReference: "variant0",
				variantManagementReference: sVMReference,
				layer: Layer.PUBLIC,
				reference: "myReference",
				title: "variant A Copy",
				contexts: {
					role: ["testRole2"]
				}
			};
			this.oSourceVariant.instance.setLayer(Layer.USER);
			this.oModel.getVariant.restore();
			sandbox.stub(this.oModel, "getVariant").callsFake(function(sSourceVariantReference) {
				if (sSourceVariantReference === "variant0") {
					return this.oSourceVariant;
				}
				return {
					instance: {
						getLayer: function() {return Layer.PUBLIC;},
						getVariantReference: function() {return "publicVariantReference";}
					}
				};
			}.bind(this));

			var oDuplicateVariant = this.oModel._duplicateVariant(mPropertyBag);
			assert.strictEqual(oDuplicateVariant.instance.getName(), "variant A Copy", "the name is correct");
			assert.strictEqual(oDuplicateVariant.instance.getId(), "newVariant", "the id is correct");
			assert.strictEqual(oDuplicateVariant.instance.getLayer(), Layer.PUBLIC, "the layer is correct");
			assert.deepEqual(oDuplicateVariant.instance.getContexts(), {role: ["testRole2"]}, "the contexts object is correct");
			assert.strictEqual(oDuplicateVariant.instance.getVariantReference(), "publicVariantReference", "the variantReference is correct");
			assert.strictEqual(oDuplicateVariant.controlChanges.length, 1, "one change was copied");
			assert.strictEqual(oDuplicateVariant.controlChanges[0].getSupportInformation().sourceChangeFileName, "change1", "the sourceChangeFileName is correct");
		});
	});

	QUnit.module("Given a VariantModel with no data and a VariantManagement control", {
		before: function() {
			return FlexState.initialize({
				reference: "MyComponent",
				componentId: "RTADemoAppMD",
				componentData: {},
				manifest: {}
			});
		},
		beforeEach: function() {
			var oManifestObj = {
				"sap.app": {
					id: "MyComponent",
					applicationVersion: {
						version: "1.2.3"
					}
				}
			};
			var oManifest = new Manifest(oManifestObj);
			this.oVMReference = "varMgmtRef1";
			this.oVariantManagement = new VariantManagement(this.oVMReference);
			var oComponent = {
				name: "MyComponent",
				getId: function() {
					return "RTADemoAppMD";
				},
				getManifest: function() {
					return oManifest;
				},
				getLocalId: function(sId) {
					if (sId === this.oVariantManagement.getId()) {
						return this.oVMReference;
					}
					return null;
				}.bind(this)
			};

			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("MyComponent");
			this.fnGetAppComponentForControlStub = sandbox.stub(Utils, "getAppComponentForControl").returns(oComponent);
			this.oFlexController = FlexControllerFactory.createForControl(oComponent, oManifest);
			this.fnApplyChangesStub = sandbox.stub(this.oFlexController, "saveSequenceOfDirtyChanges").resolves();
			this.oRegisterControlStub = sandbox.stub(URLHandler, "registerControl");

			sandbox.stub(VariantManagementState, "getInitialChanges").returns([]);

			this.oModel = new VariantModel({}, {
				flexController: this.oFlexController,
				appComponent: oComponent
			});

			return this.oModel.initialize();
		},
		afterEach: function() {
			sandbox.restore();
			this.oModel.destroy();
			this.oVariantManagement.destroy();
			FlexControllerFactory._instanceCache = {};
		},
		after: function() {
			FlexState.clearState();
		}
	}, function() {
		QUnit.test("when calling invalidateMap", function(assert) {
			var oInvalidationStub = sandbox.stub(this.oModel.oDataSelector, "checkUpdate");
			this.oModel.invalidateMap();
			assert.strictEqual(oInvalidationStub.callCount, 1, "the DataSelector was invalidated");
		});

		QUnit.test("when calling 'setModel' of VariantManagement control", function(assert) {
			var fnRegisterToModelSpy = sandbox.spy(this.oModel, "registerToModel");
			sandbox.stub(VariantManagementState, "waitForInitialVariantChanges").resolves("foo");
			sandbox.stub(this.oModel, "getVariantManagementReferenceForControl").returns(this.oVMReference);
			this.oVariantManagement.setExecuteOnSelectionForStandardDefault(true);
			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());

			assert.ok(fnRegisterToModelSpy.calledOnce, "then registerToModel called once, when VariantManagement control setModel is called");
			assert.ok(fnRegisterToModelSpy.calledWith(this.oVariantManagement), "then registerToModel called with VariantManagement control");
			assert.ok(this.oModel.oData[this.oVMReference].init, "the init flag is set");
			assert.equal(this.oModel.oData[this.oVMReference].showExecuteOnSelection, false, "showExecuteOnSelection is set to false");
			return this.oModel._oVariantSwitchPromise.then(function(sValue) {
				assert.strictEqual(sValue, "foo", "the initial changes promise was added to the variant switch promise");
			});
		});

		QUnit.test("when waitForVMControlInit is called before the control is initialized", function(assert) {
			var fnDone = assert.async();
			var oData = {
				varMgmtRef1: {
					defaultVariant: "variant1",
					originalDefaultVariant: "variant1",
					variants: [
						{
							author: VariantUtil.DEFAULT_AUTHOR,
							key: this.oVMReference,
							layer: Layer.VENDOR,
							title: "Standard",
							favorite: true,
							visible: true,
							executeOnSelect: false
						}
					]
				}
			};
			this.oModel.setData(oData);
			this.oModel.waitForVMControlInit(this.oVMReference).then(function() {
				assert.ok(true, "the function resolves");
				fnDone();
			});
			this.oModel.registerToModel(this.oVariantManagement);
		});

		QUnit.test("when waitForVMControlInit is called after the control is initialized", function(assert) {
			var oData = {
				varMgmtRef1: {
					defaultVariant: "variant1",
					originalDefaultVariant: "variant1",
					variants: [
						{
							author: VariantUtil.DEFAULT_AUTHOR,
							key: this.oVMReference,
							layer: Layer.VENDOR,
							title: "Standard",
							favorite: true,
							visible: true,
							executeOnSelect: false
						}
					]
				}
			};
			this.oModel.setData(oData);
			this.oModel.registerToModel(this.oVariantManagement);
			return this.oModel.waitForVMControlInit(this.oVMReference).then(function() {
				assert.ok(true, "the function resolves");
			});
		});

		QUnit.test("when waitForVMControlInit is called before the control is initialized and with no variant data yet", function(assert) {
			var oStandardVariant = {
				currentVariant: this.oVMReference,
				originalCurrentVariant: this.oVMReference,
				defaultVariant: this.oVMReference,
				originalDefaultVariant: this.oVMReference,
				showExecuteOnSelection: false,
				init: true,
				modified: false,
				showFavorites: true,
				updateVariantInURL: false,
				variantsEditable: true,
				_isEditable: true,
				variants: [{
					change: false,
					remove: false,
					rename: false,
					key: this.oVMReference,
					title: "Standard",
					originalTitle: "Standard",
					favorite: true,
					originalFavorite: true,
					visible: true,
					originalVisible: true,
					executeOnSelect: false,
					originalExecuteOnSelect: false,
					author: VariantUtil.DEFAULT_AUTHOR,
					sharing: "public",
					contexts: {},
					originalContexts: {}
				}]
			};
			var oReturnPromise = this.oModel.waitForVMControlInit(this.oVMReference).then(function() {
				assert.ok(this.oModel.oData[this.oVMReference].variants, "the variant structure was added");
				assert.strictEqual(this.oModel.oData[this.oVMReference].variants[0].key, this.oVMReference, oStandardVariant, "the standard variant is properly set");
			}.bind(this));
			this.oModel.registerToModel(this.oVariantManagement);

			return oReturnPromise;
		});

		QUnit.test("when variant management controls are initialized with with 'updateVariantInURL' property set and default (false)", function(assert) {
			this.oRegisterControlStub.resetHistory();
			var oVariantManagementWithURLUpdate = new VariantManagement("varMgmtRef2", {updateVariantInURL: true});
			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			oVariantManagementWithURLUpdate.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			assert.deepEqual(this.oRegisterControlStub.getCall(0).args[0], {
				vmReference: this.oModel.oAppComponent.getLocalId(this.oVariantManagement.getId()),
				updateURL: false,
				model: this.oModel
			}, "then URLHandler.attachHandlers was called once for a control to update URL");
			assert.deepEqual(this.oRegisterControlStub.getCall(1).args[0], {
				vmReference: oVariantManagementWithURLUpdate.getId(),
				updateURL: true,
				model: this.oModel
			}, "then URLHandler.attachHandlers was called once for a control without URL update");
			oVariantManagementWithURLUpdate.destroy();
		});

		QUnit.test("when calling 'getVariantManagementReferenceForControl' with a variant management control where app component couldn't be retrieved", function(assert) {
			this.fnGetAppComponentForControlStub.returns(null);
			assert.strictEqual(this.oModel.getVariantManagementReferenceForControl(this.oVariantManagement), this.oVariantManagement.getId(), "then control's id is returned");
		});

		QUnit.test("when calling 'getVariantManagementReferenceForControl' with a variant management control with no app component prefix", function(assert) {
			assert.strictEqual(this.oModel.getVariantManagementReferenceForControl({
				getId: function() {
					return "mockControl";
				}
			}), "mockControl", "then control's id is returned");
		});

		QUnit.test("when calling 'getVariantManagementReferenceForControl' with a variant management control with an app component prefix", function(assert) {
			assert.strictEqual(this.oModel.getVariantManagementReferenceForControl(this.oVariantManagement), this.oVMReference, "then the local id of the control is returned");
		});

		QUnit.test("when 'save' event event is triggered from a variant management control for a new variant", function(assert) {
			var fnDone = assert.async();

			sandbox.stub(this.oModel, "callVariantSwitchListeners").callsFake(function(sVmReference, sNewVMReference) {
				assert.strictEqual(
					this.oVariantManagement.getCurrentVariantKey(),
					sNewVMReference,
					"then when the listeners are called the VM control model is up-to-date"
				);
				fnDone();
			}.bind(this));

			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());

			this.oVariantManagement.fireSave({
				name: "variant created title",
				overwrite: false,
				def: false
			});
		});

		QUnit.test("when 'save' event event is triggered from a variant management control for a new variant, when variant model is busy", function(assert) {
			var fnDone = assert.async();
			var fnSwitchPromiseStub = sandbox.stub();

			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			this.oVariantManagement.attachEventOnce("save", function() {
				this.oModel._oVariantSwitchPromise.then(function() {
					// resolved when variant model is not busy anymore
					assert.ok(fnSwitchPromiseStub.calledOnce, "then first the previous variant switch was performed completely");
					assert.ok(this.oFlexController.saveSequenceOfDirtyChanges.getCall(0).args[0][0].getName(), "variant created title", "then the required variant change was saved");
					fnDone();
				}.bind(this));
			}.bind(this));

			// set variant model busy
			this.oModel._oVariantSwitchPromise = new Promise(function(resolve) {
				fnSwitchPromiseStub.callsFake(function() {
					resolve();
				});
				setTimeout(fnSwitchPromiseStub, 0);
			});

			this.oVariantManagement.fireSave({
				name: "variant created title",
				overwrite: false,
				def: false
			});
		});

		QUnit.test("when 'save' event is triggered from a variant management control for an existing variant, when variant model is busy", function(assert) {
			var fnDone = assert.async();
			var fnSwitchPromiseStub = sandbox.stub();

			var oDirtyChange1 = FlexObjectFactory.createFromFileContent({fileName: "newChange1"});
			var oDirtyChange2 = FlexObjectFactory.createFromFileContent({fileName: "newChange2"});
			this.oFlexController._oChangePersistence.addDirtyChange(oDirtyChange1);
			this.oFlexController._oChangePersistence.addDirtyChange(oDirtyChange2);

			sandbox.stub(VariantManagementState, "getControlChangesForVariant").returns([oDirtyChange1, oDirtyChange2]);

			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());

			this.oVariantManagement.attachEventOnce("save", function() {
				this.oModel._oVariantSwitchPromise.then(function() {
					// resolved when variant model is not busy anymore
					assert.ok(fnSwitchPromiseStub.calledOnce, "then first the previous variant switch was performed completely");
					assert.deepEqual(this.oFlexController.saveSequenceOfDirtyChanges.getCall(0).args[0], [oDirtyChange1, oDirtyChange2], "then the control changes inside the variant were saved");
					fnDone();
				}.bind(this));
			}.bind(this));

			// set variant model busy
			this.oModel._oVariantSwitchPromise = new Promise(function(resolve) {
				fnSwitchPromiseStub.callsFake(function() {
					resolve();
				});
				setTimeout(fnSwitchPromiseStub, 0);
			});
			this.oVariantManagement.fireSave({
				overwrite: true,
				def: false
			});
		});
	});

	QUnit.module("Given a variant management control in personalization mode", {
		beforeEach: function() {
			return FlexState.initialize({
				reference: "MockController",
				componentId: "testComponent",
				componentData: {},
				manifest: {}
			}).then(function() {
				var oView;
				var MockComponent = UIComponent.extend("MockController", {
					metadata: {
						manifest: {
							"sap.app": {
								applicationVersion: {
									version: "1.2.3"
								},
								id: "MockController"
							}
						}
					},
					createContent: function() {
						oView = new XMLView({
							viewName: "sap.ui.test.VariantManagementTestApp",
							id: this.createId("mockview")
						});
						var oApp = new App(oView.createId("mockapp"));
						oApp.addPage(oView);
						return oApp;
					}
				});

				this.oComp = new MockComponent({id: "testComponent"});
				this.oView = oView;
				this.oFlexController = ChangesController.getFlexControllerInstance(this.oComp);
				sandbox.stub(VariantManagementState, "waitForInitialVariantChanges").resolves();
				this.oVariantModel = new VariantModel({}, {
					flexController: this.oFlexController,
					appComponent: this.oComp
				});
				return this.oVariantModel.initialize();
			}.bind(this)).then(function() {
				this.oComp.setModel(this.oVariantModel, ControlVariantApplyAPI.getVariantModelName());
				this.sVMReference = "mockview--VariantManagement1";

				var oData = this.oVariantModel.getData();
				oData[this.sVMReference].defaultVariant = "variant1";
				oData[this.sVMReference].originalDefaultVariant = "variant1";
				oData[this.sVMReference].currentVariant = "variant1";
				oData[this.sVMReference].originalCurrentVariant = "variant1";
				this.oVariant1 = {
					author: "Me",
					key: "variant1",
					layer: Layer.CUSTOMER,
					title: "variant A",
					favorite: true,
					visible: true,
					executeOnSelect: false
				};
				this.oVariant2 = {
					author: "Me",
					key: "variant2",
					layer: Layer.CUSTOMER,
					title: "variant B",
					favorite: true,
					visible: true,
					executeOnSelect: false
				};
				oData[this.sVMReference].variants.push(this.oVariant1);
				oData[this.sVMReference].variants.push(this.oVariant2);
				this.oUpdateCurrentVariantStub = sandbox.stub(this.oVariantModel, "updateCurrentVariant").resolves();
				sandbox.stub(VariantManagementState, "getCurrentVariantReference").returns("variant1");
				sandbox.stub(VariantManagementState, "getControlChangesForVariant");
				sandbox.stub(this.oVariantModel.oFlexController, "deleteChange");
				sandbox.stub(this.oVariantModel.oChangePersistence, "getDirtyChanges");
				sandbox.stub(Switcher, "switchVariant").resolves();
				sandbox.stub(Reverter, "revertMultipleChanges").resolves();

				this.oVariantModel.setData(oData);
				this.oVariantModel.checkUpdate(true);

				this.oCompContainer = new ComponentContainer("ComponentContainer", {
					component: this.oComp
				}).placeAt("qunit-fixture");
				oCore.applyChanges();
			}.bind(this));
		},
		afterEach: function() {
			this.oCompContainer.destroy();
			FlexState.clearState();
			sandbox.restore();
		}
	}, function() {
		function clickOnVMControl(oVMControl) {
			// to create variant list control - inside variant management control's popover
			oVMControl._getEmbeddedVM().getDomRef().click();
		}

		function makeSelection(oVMControl, iIndex) {
			var oVariantListControl = oVMControl._getEmbeddedVM().oVariantPopOver.getContent()[0].getContent()[0];
			var oSelectedItem = oVariantListControl.getItems()[iIndex];
			oVariantListControl.fireItemPress({
				item: oSelectedItem
			});
		}

		function selectTargetVariant(oVMControl, iIndex) {
			// variant management control popover
			if (oVMControl._getEmbeddedVM().oVariantPopOver && oVMControl._getEmbeddedVM().oVariantPopOver.isOpen()) {
				makeSelection(oVMControl, iIndex);
			} else {
				oVMControl._getEmbeddedVM().oVariantPopOver.attachEventOnce("afterOpen", makeSelection.bind(null, oVMControl, iIndex));
			}
		}

		function waitForInitialCallbackCall(fnCallbackStub, oExpectedVariant, assert) {
			return new Promise(function(resolve) {
				fnCallbackStub.callsFake(function(oNewVariant) {
					assert.ok(true, "the callback was called once");
					assert.deepEqual(oNewVariant, oExpectedVariant, "the correct variant was passed");
					resolve();
				});
			});
		}

		QUnit.test("when the control is switched to a new variant with no unsaved personalization changes", function(assert) {
			var fnDone = assert.async();
			var oCallListenerStub = sandbox.stub(this.oVariantModel, "callVariantSwitchListeners");
			var sVMControlId = this.oComp.createId(this.sVMReference);
			var oVMControl = oCore.byId(sVMControlId);

			oVMControl.attachEventOnce("select", function(oEvent) {
				var sSelectedVariantReference = oEvent.getParameters().key;
				this.oVariantModel.updateCurrentVariant.onFirstCall().callsFake(function(mPropertyBag) {
					// update call will make variant model busy, which will be resolved after the whole update process has taken place
					this.oVariantModel._oVariantSwitchPromise.then(function() {
						assert.equal(oCallListenerStub.callCount, 0, "the listeners are not notified again");
						assert.deepEqual(mPropertyBag, {
							variantManagementReference: sSelectedVariantReference,
							newVariantReference: this.sVMReference,
							appComponent: this.oComp,
							internallyCalled: true
						}, "then variant switch was performed");
						assert.ok(Reverter.revertMultipleChanges.notCalled, "then variant was not reverted explicitly");
						assert.ok(this.oVariantModel.oFlexController.deleteChange.notCalled, "then no dirty changes were deleted");
						fnDone();
					}.bind(this));
					return Promise.resolve();
				}.bind(this));
			}.bind(this));

			clickOnVMControl(oVMControl);

			selectTargetVariant(oVMControl, 0);
		});

		QUnit.test("when the control is switched to a new variant with unsaved personalization changes", function(assert) {
			var fnDone = assert.async();
			var oCallListenerStub = sandbox.stub(this.oVariantModel, "callVariantSwitchListeners");
			var sVMControlId = this.oComp.createId(this.sVMReference);
			var oVMControl = oCore.byId(sVMControlId);

			this.oVariantModel.oData[this.sVMReference].modified = true;
			var aMockDirtyChanges = [FlexObjectFactory.createFromFileContent({fileName: "dirtyChange1"}), FlexObjectFactory.createFromFileContent({fileName: "dirtyChange2"})];
			VariantManagementState.getControlChangesForVariant.returns(aMockDirtyChanges);
			this.oVariantModel.oChangePersistence.getDirtyChanges.returns(aMockDirtyChanges);

			// FIXME: Use actual data selectors in this module instead of faking their behavior
			this.oUpdateCurrentVariantStub.callsFake(function() {
				// Modified flag will immediately be set to false by the VariantManagementState
				// when the variant was switched
				this.oVariantModel.oData[this.sVMReference].modified = false;
			}.bind(this));

			// when new item is selected from the variants list
			oVMControl.attachEventOnce("select", function(oEvent) {
				var sTargetVariantId = oEvent.getParameters().key;
				this.oVariantModel._oVariantSwitchPromise.then(function() {
					assert.equal(oCallListenerStub.callCount, 0, "the listeners are not notified again");
					assert.deepEqual(this.oVariantModel.updateCurrentVariant.getCall(0).args[0], {
						variantManagementReference: sTargetVariantId,
						newVariantReference: this.sVMReference,
						appComponent: this.oComp,
						internallyCalled: true
					}, "then variant switch was performed");
					assert.ok(Reverter.revertMultipleChanges.notCalled, "then variant was not reverted explicitly");

					aMockDirtyChanges.forEach(function(oDirtyChange) {
						assert.ok(this.oVariantModel.oFlexController.deleteChange.calledWith(oDirtyChange), "then a dirty change was deleted from the persistence");
					}.bind(this));
					fnDone();
				}.bind(this));
			}.bind(this));

			clickOnVMControl(oVMControl);

			selectTargetVariant(oVMControl, 0);
		});

		QUnit.test("when the control is switched to the same variant with no unsaved personalization changes", function(assert) {
			var fnDone = assert.async();
			var oCallListenerStub = sandbox.stub(this.oVariantModel, "callVariantSwitchListeners");
			var sVMControlId = this.oComp.createId(this.sVMReference);
			var oVMControl = oCore.byId(sVMControlId);

			var aMockDirtyChanges = [FlexObjectFactory.createFromFileContent({fileName: "dirtyChange1"}), FlexObjectFactory.createFromFileContent({fileName: "dirtyChange2"})];
			VariantManagementState.getControlChangesForVariant.returns(aMockDirtyChanges);
			this.oVariantModel.oChangePersistence.getDirtyChanges.returns(aMockDirtyChanges);

			// when new item is selected from the variants list
			oVMControl.attachEventOnce("select", function() {
				this.oVariantModel._oVariantSwitchPromise.then(function() {
					assert.equal(oCallListenerStub.callCount, 1, "the listeners are notified");
					assert.equal(oCallListenerStub.lastCall.args[0], this.sVMReference, "the function is called with the correct parameters");
					assert.equal(oCallListenerStub.lastCall.args[1], "variant1", "the function is called with the correct parameters");
					assert.ok(this.oVariantModel.updateCurrentVariant.notCalled, "then variant switch was not performed");
					assert.ok(this.oVariantModel.oFlexController.deleteChange.notCalled, "then dirty changes were not deleted from the persistence");
					fnDone();
				}.bind(this));
			}.bind(this));

			clickOnVMControl(oVMControl);

			selectTargetVariant(oVMControl, 1);
		});

		QUnit.test("when the control is switched to the same variant with unsaved personalization changes", function(assert) {
			var fnDone = assert.async();
			var sVMControlId = this.oComp.createId(this.sVMReference);
			var oVMControl = oCore.byId(sVMControlId);
			var oCallListenerStub = sandbox.stub(this.oVariantModel, "callVariantSwitchListeners");

			this.oVariantModel.oData[this.sVMReference].modified = true;
			var aMockDirtyChanges = [FlexObjectFactory.createFromFileContent({fileName: "dirtyChange1"}), FlexObjectFactory.createFromFileContent({fileName: "dirtyChange2"})];
			VariantManagementState.getControlChangesForVariant.returns(aMockDirtyChanges);
			this.oVariantModel.oChangePersistence.getDirtyChanges.returns(aMockDirtyChanges);

			// when new item is selected from the variants list
			oVMControl.attachEventOnce("select", function() {
				this.oVariantModel._oVariantSwitchPromise.then(function() {
					assert.equal(oCallListenerStub.callCount, 1, "the listeners are notified");
					assert.equal(oCallListenerStub.lastCall.args[0], this.sVMReference, "the function is called with the correct parameters");
					assert.equal(oCallListenerStub.lastCall.args[1], "variant1", "the function is called with the correct parameters");
					assert.ok(this.oVariantModel.updateCurrentVariant.notCalled, "then variant switch was not performed");
					// the order of the changes should be reversed on revertMultipleChanges (change2, change1)
					assert.ok(Reverter.revertMultipleChanges.calledWith(aMockDirtyChanges.reverse(), {
						appComponent: this.oComp,
						modifier: JsControlTreeModifier,
						flexController: this.oFlexController
					}), "then variant was reverted in correct order");

					aMockDirtyChanges.forEach(function(oDirtyChange) {
						assert.ok(this.oVariantModel.oFlexController.deleteChange.calledWith(oDirtyChange), "then a dirty change was deleted from the persistence");
					}.bind(this));

					fnDone();
				}.bind(this));
			}.bind(this));

			clickOnVMControl(oVMControl);

			selectTargetVariant(oVMControl, 1);
		});

		QUnit.test("when 'attachVariantApplied' is called with callAfterInitialVariant=false", function(assert) {
			var sVMControlId = "testComponent---mockview--VariantManagement1";
			var sVMReference = "mockview--VariantManagement1";
			var fnCallback1 = sandbox.stub();
			var fnCallback2 = sandbox.stub();
			var fnCallback3 = sandbox.stub();
			var oErrorStub = sandbox.stub(Log, "error");
			var oUpdateStub = sandbox.stub(this.oVariantModel, "checkUpdate");

			return Promise.all([
				this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: this.oView.byId("MainForm"),
					callback: fnCallback1,
					callAfterInitialVariant: false
				}),
				this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: this.oView.byId("hbox2InnerButton1"),
					callback: fnCallback2,
					callAfterInitialVariant: false
				})
			]).then(function() {
				assert.equal(oErrorStub.callCount, 1, "an error was logged");
				assert.equal(oUpdateStub.callCount, 1, "the update function was called");
				assert.equal(this.oVariantModel.oData[sVMReference].showExecuteOnSelection, true, "the parameter is set to true");
				assert.equal(fnCallback1.callCount, 0, "the callback was not called yet");
				assert.equal(fnCallback2.callCount, 0, "the callback was not called yet");

				this.oVariantModel.callVariantSwitchListeners(sVMReference, "variant1");
				assert.equal(fnCallback1.callCount, 1, "the callback was called once");
				assert.deepEqual(fnCallback1.lastCall.args[0], this.oVariant1, "the new variant is passed as parameter");
				assert.equal(fnCallback2.callCount, 0, "the callback was not called");

				this.oVariantModel.callVariantSwitchListeners(sVMReference, "variant1", fnCallback3, "scenario");
				assert.equal(fnCallback3.callCount, 1, "the callback was called once");
				assert.strictEqual(fnCallback3.lastCall.args[0].key, this.oVariant1.key, "the new variant is passed as parameter");
				assert.strictEqual(fnCallback3.lastCall.args[0].createScenario, "scenario", "the scenario was saved in the variant");
				assert.equal(fnCallback1.callCount, 1, "the callback was not called");
				assert.equal(fnCallback2.callCount, 0, "the callback was not called");

				return this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: this.oView.byId("MainForm"),
					callback: fnCallback2,
					callAfterInitialVariant: false
				});
			}.bind(this))
			.then(function() {
				this.oVariantModel.callVariantSwitchListeners(sVMReference, "variant2");
				assert.equal(fnCallback1.callCount, 1, "the callback was not called again");
				assert.equal(fnCallback2.callCount, 1, "the callback was called once");
				assert.deepEqual(fnCallback2.lastCall.args[0], this.oVariant2, "the new variant is passed as parameter");

				return this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: this.oView.byId("ObjectPageSection1"),
					callback: fnCallback1,
					callAfterInitialVariant: false
				});
			}.bind(this))
			.then(function() {
				this.oVariantModel.callVariantSwitchListeners(sVMReference, "variant2");
				assert.equal(fnCallback1.callCount, 2, "the callback was called again");
				assert.equal(fnCallback2.callCount, 2, "the callback was called again");

				this.oVariantModel.detachVariantApplied(sVMControlId, this.oView.createId("MainForm"));
				this.oVariantModel.callVariantSwitchListeners(sVMReference, "variant2");
				assert.equal(fnCallback1.callCount, 3, "the callback was called again");
				assert.equal(fnCallback2.callCount, 2, "the callback was not called again");

				this.oVariantModel.detachVariantApplied(sVMControlId, this.oView.createId("ObjectPageSection1"));
				this.oVariantModel.callVariantSwitchListeners(sVMReference, "variant2");
				assert.equal(fnCallback1.callCount, 3, "the callback was not called again");
				assert.equal(fnCallback2.callCount, 2, "the callback was not called again");
			}.bind(this));
		});

		QUnit.test("when 'attachVariantApplied' is called with the control not being rendered yet", function(assert) {
			var sVMControlId = "testComponent---mockview--VariantManagement1";
			var sVMReference = "mockview--VariantManagement1";
			var fnCallback1 = sandbox.stub();
			var fnCallback2 = sandbox.stub();
			var fnCallback3 = sandbox.stub();
			var oNewControl1 = new Button("newControl1", {text: "foo"});
			var oNewControl2 = new Button("newControl2", {text: "foo"});
			var oNewControl3 = new Button("newControl3", {text: "foo"});

			var oReturnPromise = Promise.all([
				this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: oNewControl1,
					callback: fnCallback1,
					callAfterInitialVariant: true
				}),
				this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: oNewControl2,
					callback: fnCallback2,
					callAfterInitialVariant: true
				}),
				this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: oNewControl3,
					callback: fnCallback3,
					callAfterInitialVariant: false
				})
			]).then(function() {
				assert.equal(fnCallback3.callCount, 0, "the callback was not called yet");

				this.oVariantModel.callVariantSwitchListeners(sVMReference, "variant1");
				assert.equal(fnCallback1.callCount, 2, "the callback was called again");
				assert.equal(fnCallback2.callCount, 1, "the callback was not called again");
				assert.equal(fnCallback3.callCount, 1, "the callback was called once");
			}.bind(this));

			Promise.all([
				waitForInitialCallbackCall(fnCallback1, this.oVariant1, assert),
				waitForInitialCallbackCall(fnCallback2, this.oVariant1, assert)
			]).then(function() {
				this.oView.byId("MainForm").addContent(oNewControl1);
				this.oView.byId("hbox1").addItem(oNewControl2);
				this.oView.byId("MainForm").addContent(oNewControl3);
			}.bind(this));

			return oReturnPromise;
		});

		QUnit.test("when 'attachVariantApplied' is called with executeOnSelectionForStandardDefault set, standard being default and no flex change for apply automatically", function(assert) {
			var sVMReference = "mockview--VariantManagement2";
			var sVMControlId = "testComponent---" + sVMReference;
			this.oView.byId(sVMControlId).setExecuteOnSelectionForStandardDefault(true);
			var fnCallback1 = sandbox.stub();
			var fnCallback2 = sandbox.stub();
			sandbox.stub(VariantManagementState, "getVariantChangesForVariant").returns({});
			VariantManagementState.getCurrentVariantReference.restore();

			return Promise.all([
				this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: this.oView.byId("MainForm"),
					callback: fnCallback1,
					callAfterInitialVariant: true
				}),
				this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: this.oView.byId("MainForm"),
					callback: fnCallback2,
					callAfterInitialVariant: false
				})
			]).then(function() {
				assert.equal(fnCallback1.callCount, 1, "the callback was called");
				assert.equal(fnCallback1.lastCall.args[0].executeOnSelect, true, "the flag to apply automatically is set");
				assert.equal(fnCallback1.lastCall.args[0].originalExecuteOnSelect, true, "the flag to apply automatically is set");
				assert.equal(fnCallback2.callCount, 1, "the callback was called");
				assert.equal(fnCallback2.lastCall.args[0].executeOnSelect, true, "the flag to apply automatically is set");
				assert.equal(fnCallback2.lastCall.args[0].originalExecuteOnSelect, true, "the flag to apply automatically is set");
			});
		});

		QUnit.test("when 'attachVariantApplied' is called with executeOnSelectionForStandardDefault set, standard being default, no flex change for apply automatically and a different current variant", function(assert) {
			var sVMReference = "mockview--VariantManagement2";
			var sVMControlId = "testComponent---" + sVMReference;
			this.oView.byId(sVMControlId).setExecuteOnSelectionForStandardDefault(true);
			sandbox.stub(VariantManagementState, "getVariantChangesForVariant").returns({});
			VariantManagementState.getCurrentVariantReference.restore();
			this.oVariantModel.getData()[sVMReference].currentVariant = "variant2";

			return this.oVariantModel.attachVariantApplied({
				vmControlId: sVMControlId,
				control: this.oView.byId("MainForm"),
				callback: function() {},
				callAfterInitialVariant: true
			}).then(function() {
				assert.ok(
					this.oVariantModel.getData()[sVMReference].variants[0].executeOnSelect,
					"then executeOnSelect is still set for the default variant"
				);
			}.bind(this));
		});

		QUnit.test("when 'attachVariantApplied' is called without executeOnSelectionForStandardDefault set, standard being default and no flex change for apply automatically", function(assert) {
			var sVMReference = "mockview--VariantManagement2";
			var sVMControlId = "testComponent---" + sVMReference;
			var fnCallback1 = sandbox.stub();
			var fnCallback2 = sandbox.stub();
			sandbox.stub(VariantManagementState, "getVariantChangesForVariant").returns({});
			VariantManagementState.getCurrentVariantReference.restore();

			return Promise.all([
				this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: this.oView.byId("MainForm"),
					callback: fnCallback1,
					callAfterInitialVariant: true
				}),
				this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: this.oView.byId("MainForm"),
					callback: fnCallback2,
					callAfterInitialVariant: false
				})
			]).then(function() {
				assert.equal(fnCallback1.callCount, 1, "the callback was called");
				assert.equal(fnCallback1.lastCall.args[0].executeOnSelect, false, "the flag to apply automatically is not set");
				assert.equal(fnCallback1.lastCall.args[0].originalExecuteOnSelect, false, "the flag to apply automatically is not set");
				assert.equal(fnCallback2.callCount, 0, "the callback was not called");
			});
		});

		QUnit.test("when 'attachVariantApplied' is called with executeOnSelectionForStandardDefault set, standard being default and a flex change for apply automatically", function(assert) {
			var sVMReference = "mockview--VariantManagement2";
			var sVMControlId = "testComponent---" + sVMReference;
			var fnCallback1 = sandbox.stub();
			var fnCallback2 = sandbox.stub();
			sandbox.stub(VariantManagementState, "getVariantChangesForVariant").returns({setExecuteOnSelect: {}});
			VariantManagementState.getCurrentVariantReference.restore();

			return Promise.all([
				this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: this.oView.byId("MainForm"),
					callback: fnCallback1,
					callAfterInitialVariant: true
				}),
				this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: this.oView.byId("MainForm"),
					callback: fnCallback2,
					callAfterInitialVariant: false
				})
			]).then(function() {
				assert.equal(fnCallback1.callCount, 1, "the callback was called");
				assert.equal(fnCallback2.callCount, 0, "the callback was not called");
			});
		});

		QUnit.test("when 'attachVariantApplied' is called with executeOnSelectionForStandardDefault set, standard not being default and no flex change for apply automatically", function(assert) {
			var sVMReference = "mockview--VariantManagement1";
			var sVMControlId = "testComponent---" + sVMReference;
			var oVMControl = oCore.byId(sVMControlId);
			oVMControl.setExecuteOnSelectionForStandardDefault(true);
			var fnCallback1 = sandbox.stub();
			var fnCallback2 = sandbox.stub();
			sandbox.stub(VariantManagementState, "getVariantChangesForVariant").returns({});

			return Promise.all([
				this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: this.oView.byId("MainForm"),
					callback: fnCallback1,
					callAfterInitialVariant: true
				}),
				this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: this.oView.byId("MainForm"),
					callback: fnCallback2,
					callAfterInitialVariant: false
				})
			]).then(function() {
				assert.equal(fnCallback1.callCount, 1, "the callback was called");
				assert.equal(fnCallback2.callCount, 0, "the callback was not called");
			});
		});
	});

	QUnit.module("Given a VariantModel without data and with Ushell available", {
		beforeEach: function() {
			this.oModel = new VariantModel({}, {
				flexController: {
					_oChangePersistence: {getComponentName: function() {return "foo";}}
				},
				appComponent: {getId: function() {}}
			});

			sandbox.stub(Utils, "getUShellService").callsFake(function(sServiceName) {
				return Promise.resolve(sServiceName);
			});
			sandbox.stub(Utils, "getUshellContainer").returns({});
			sandbox.stub(URLHandler, "initialize");
			return this.oModel.initialize();
		},
		afterEach: function() {
			this.oModel.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling getUShellService", function(assert) {
			assert.strictEqual(this.oModel.getUShellService("UserInfo"), "UserInfo", "the UserInfo service was loaded");
			assert.strictEqual(this.oModel.getUShellService("URLParsing"), "URLParsing", "the URLParsing service was loaded");
			assert.strictEqual(this.oModel.getUShellService("CrossApplicationNavigation"), "CrossApplicationNavigation", "the CrossApplicationNavigation service was loaded");
			assert.strictEqual(this.oModel.getUShellService("ShellNavigation"), "ShellNavigation", "the ShellNavigation service was loaded");
			assert.notOk(this.oModel.getUShellService("UnknownService"), "the UnknownService service was not loaded");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});