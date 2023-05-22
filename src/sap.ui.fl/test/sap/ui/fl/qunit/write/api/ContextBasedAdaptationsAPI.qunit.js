/* global QUnit */

sap.ui.define([
	"sap/base/util/deepClone",
	"sap/base/util/LoaderExtensions",
	"sap/ui/core/Control",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/initial/_internal/Storage",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Utils",
	"sap/ui/fl/write/api/Version",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/write/_internal/FlexInfoSession",
	"sap/ui/fl/write/_internal/flexState/FlexObjectState",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4"
], function(
	deepClone,
	LoaderExtensions,
	Control,
	FlexState,
	InitialStorage,
	Layer,
	LayerUtils,
	Settings,
	Utils,
	Version,
	ContextBasedAdaptationsAPI,
	FlexInfoSession,
	FlexObjectState,
	Storage,
	Versions,
	ManifestUtils,
	JSONModel,
	sinon
) {
	"use strict";

	document.getElementById("qunit-fixture").style.display = "none";
	var sandbox = sinon.createSandbox();

	function stubSettings(sandbox) {
		sandbox.stub(Settings, "getInstance").resolves({
			isContextBasedAdaptationEnabled: function() {
				return true;
			},
			isSystemWithTransports: function() {
				return false;
			}
		});
	}

	function verifyVariantsAndChanges(assert, oOriginal, oCopy, bIsControlVariant, bIsChange, aMappedVariantIds) {
		assert.strictEqual(oOriginal.getChangeType(), oCopy.changeType, "there is the same change type");
		assert.notStrictEqual(oOriginal.getId(), oCopy.fileName, "there is a different filename");
		assert.strictEqual(oOriginal.getFileType(), oCopy.fileType, "there is the same file type");
		assert.strictEqual(oOriginal.getLayer(), oCopy.layer, "there is the same layer");
		assert.strictEqual(oCopy.layer, Layer.CUSTOMER, "we have the layer as CUSTOMER");
		assert.strictEqual(oOriginal.getNamespace(), oCopy.namespace, "there is the same name space");
		assert.strictEqual(oOriginal.getSupportInformation().originalLanguage, oCopy.originalLanguage, "there is the same original language");
		assert.strictEqual(oOriginal.getFlexObjectMetadata().projectId, oCopy.projectId, "there is the same project id");
		assert.strictEqual(oOriginal.getFlexObjectMetadata().reference, oCopy.reference, "there is the same reference");
		if (oOriginal.getSupportInformation().user) {
			assert.strictEqual(oOriginal.getSupportInformation().generator, oCopy.support.generator, "there is the generator");
			assert.strictEqual(oOriginal.getSupportInformation().sapui5Version, oCopy.support.sapui5Version, "there is the same sapui5Version");
		} else {
			assert.deepEqual(oOriginal.getSupportInformation(), oCopy.support, "there is the same support data");
		}
		var oOriginalTexts = oOriginal.getTexts();
		assert.deepEqual(oOriginalTexts, oCopy.texts, "there is the same texts object");
		assert.notStrictEqual(oOriginalTexts.variantName && oOriginalTexts.variantName.value, "Standard VENDOR", "Must never copy VENDOR variant");

		var oOrigContent = oOriginal.getContent();
		var oCopyContent = oCopy.content;

		if (bIsChange) {
			if (oCopy.selector.variantId) {
				assert.strictEqual(oCopy.selector.persistencyKey, oOriginal.getSelector().persistencyKey, "there is the same persistencyKey");
				assert.notStrictEqual(oCopy.selector.variantId, oOriginal.getSelector().variantId, "there is not the same variantId");
			}
			if (oCopyContent.defaultVariantName) { // V2 default change
				if (oOrigContent.defaultVariantName === "id_1676895725424_1469_page") {
					assert.equal(oCopyContent.defaultVariantName, oOrigContent.defaultVariantName, "set default content still points to not copied variant from VENDOR");
				} else {
					assert.ok(aMappedVariantIds[oOrigContent.defaultVariantName], "set Default change has a mapped variant");
					assert.notStrictEqual(oCopyContent.defaultVariantName, oOrigContent.defaultVariantName, "there is not the same defaultVariantName");
					assert.equal(oCopyContent.defaultVariantName, aMappedVariantIds[oOrigContent.defaultVariantName], "set default change mapped to created variant");
				}
			} else if (oCopyContent.defaultVariant) { // V4 default change
				if (oOrigContent.defaultVariant === "id_1676895342319_007_flVariant") {
					assert.equal(oCopyContent.defaultVariant, oOrigContent.defaultVariant, "set default content still points to not copied variant from VENDOR");
				} else {
					assert.ok(aMappedVariantIds[oOrigContent.defaultVariant], "set Default change has a mapped variant");
					assert.notStrictEqual(oCopyContent.defaultVariant, oOrigContent.defaultVariant, "set default content remapped for copied variant from CUSTOMER");
					assert.equal(oCopyContent.defaultVariant, aMappedVariantIds[oOrigContent.defaultVariant], "set default change mapped to created variant");
				}
			} else {
				assert.deepEqual(oCopyContent, oOrigContent, "there is the same content object");
			}
			assert.deepEqual(oCopy.dependentSelector, oOriginal.getDependentSelectors(), "there is the same dependentSelector");
		}

		if (!bIsChange) {
			assert.strictEqual(oOriginal.getExecuteOnSelection(), oCopy.executeOnSelection, "there is the same executeOnSelection value");
			assert.strictEqual(oOriginal.getFavorite(), oCopy.favorite, "there is the same favorite value");
			assert.strictEqual(oOriginal.getStandardVariant(), oCopy.standardVariant, "there is the same standard variant value");
			assert.notStrictEqual(oOriginal.getVariantId(), oCopy.variantId, "there is the same variant id");
			assert.deepEqual(oOrigContent, oCopyContent, "there is the same content");
			assert.deepEqual(oOriginal.getContexts(), oCopy.contexts, "there is the same contexts");
			if (bIsControlVariant) {
				assert.strictEqual(oOriginal.getVariantManagementReference(), oCopy.variantManagementReference, "there is the correct variant management reference");
				assert.notStrictEqual(oOriginal.getVariantReference(), oCopy.variantReference, "there is the correct variant reference");
			} else {
				assert.deepEqual(oOriginal.getPersistencyKey(), oCopy.selector.persistencyKey, "there is the same selector");
			}
		}
	}

	function findVariantAndVerify(assert, aOriginals, aCopiedChanges, bIsControlVariant, aMappedVariantIds) {
		aOriginals.forEach(function(oOriginal) {
			// find copied variant by text in list of copied variants
			var oCopy = aCopiedChanges.find(function(oCopiedChange) {
				return oCopiedChange.texts.variantName.value === oOriginal.getName();
			});
			aMappedVariantIds[oOriginal.sId] = oCopy.fileName;
			assert.ok(oCopy !== undefined, "the correct copied comp variant is found");
			verifyVariantsAndChanges(assert, oOriginal, oCopy, bIsControlVariant, false, {});
		});
	}

	function verifyChangesAreCopiedCorrectly(aCopiedChangeDefinitions, assert) {
		return FlexObjectState.getFlexObjects({ selector: this.mPropertyBag.control, invalidateCache: false, includeCtrlVariants: true, includeDirtyChanges: true })
			.then(function(aFlexObjects) {
				var aCustomerFlexObjects = LayerUtils.filterChangeOrChangeDefinitionsByCurrentLayer(aFlexObjects, Layer.CUSTOMER);
				assert.strictEqual(aCustomerFlexObjects.length, aCopiedChangeDefinitions.length, "we have the length of objects");
				var bIsAdaptationIdAdded = aCopiedChangeDefinitions.every(function(oCopiedChange) {
					return oCopiedChange.adaptationId;
				});
				assert.ok(bIsAdaptationIdAdded, "adaptation id is added to every change/variant");
				var sVariant = "sap.ui.fl.apply._internal.flexObjects.Variant";
				var sFLVariant = "sap.ui.fl.apply._internal.flexObjects.FlVariant";
				var sCompVariant = "sap.ui.fl.apply._internal.flexObjects.CompVariant";
				var aCompVariants = aCustomerFlexObjects.filter(function(oFlexObject) { return oFlexObject.isA(sCompVariant); });
				var aControlVariants = aCustomerFlexObjects.filter(function(oFlexObject) { return oFlexObject.isA(sFLVariant); });
				var aChanges = aCustomerFlexObjects.filter(function(oFlexObject) {
					return !oFlexObject.isA(sVariant);
				});
				var aMappedVariantIds = {};
				findVariantAndVerify(assert, aCompVariants, aCopiedChangeDefinitions, false, aMappedVariantIds);
				findVariantAndVerify(assert, aControlVariants, aCopiedChangeDefinitions, true, aMappedVariantIds);
				aChanges.forEach(function(oChange) {
					var oCopiedChange = aCopiedChangeDefinitions.find(function(oCopiedChange) {
						return oCopiedChange.creation === oChange.getCreation();
					});
					verifyVariantsAndChanges(assert, oChange, oCopiedChange, false, true, aMappedVariantIds);
				});
			});
	}

	QUnit.module("Given ContextBasedAdaptationsAPI.initialize is called", {
		before: function() {
			this.oAppComponent = {
				getManifest: function() {
					return {};
				},
				getManifestObject: function() {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId: function() {
					return "sComponentId";
				},
				getComponentData: function() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach: function() {
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control()
			};
			stubSettings(sandbox);
			ContextBasedAdaptationsAPI.clearInstances();
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no control is provided", function(assert) {
			delete this.mPropertyBag.control;
			return ContextBasedAdaptationsAPI.initialize(this.mPropertyBag).catch(function(sError) {
				assert.equal(sError, "No control was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("when no layer is provided", function(assert) {
			delete this.mPropertyBag.layer;
			return ContextBasedAdaptationsAPI.initialize(this.mPropertyBag).catch(function(sError) {
				assert.equal(sError, "No layer was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("when not supported layer is provided", function(assert) {
			this.mPropertyBag.layer = "VENDOR";
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
					return Version.Number.Draft;
				}
			});
			var aReturnedVersions = [
				{ version: Version.Number.Draft },
				{ version: "2" },
				{ version: "1" }
			];
			sandbox.stub(Storage.versions, "load").resolves(aReturnedVersions);
			var oLoadStub = sandbox.stub(Storage.contextBasedAdaptation, "load").resolves({adaptations: []});

			return ContextBasedAdaptationsAPI.initialize(this.mPropertyBag).then(function(oModel) {
				assert.equal(oLoadStub.callCount, 0, "contextBasedAdaptations.load was called once");
				assert.ok(oModel instanceof JSONModel, "then the result is of type JSONModel");
				assert.deepEqual(ContextBasedAdaptationsAPI.getAdaptationsModel(this.mPropertyBag), oModel, "then the adaptations model is initialized in session");
				assert.ok(oModel.updateAdaptations, "then the model was initialized with update function");
				assert.ok(oModel.insertAdaptation, "then the model was initialized with insert function");
				assert.deepEqual(oModel.getData(), {
					allAdaptations: [],
					adaptations: [],
					count: 0,
					displayedAdaptation: {},
					contextBasedAdaptationsEnabled: false
				}, "then the model was initialized with correct content");
			}.bind(this));
		});

		QUnit.test("when a control and a layer were provided and a draft exists", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
					return Version.Number.Draft;
				}
			});
			var aReturnedVersions = [
				{ version: Version.Number.Draft },
				{ version: "2" },
				{ version: "1" }
			];
			sandbox.stub(Storage.versions, "load").resolves(aReturnedVersions);
			var oLoadStub = sandbox.stub(Storage.contextBasedAdaptation, "load").resolves({adaptations: []});

			return ContextBasedAdaptationsAPI.initialize(this.mPropertyBag).then(function(oModel) {
				assert.equal(oLoadStub.callCount, 1, "contextBasedAdaptations.load was called once");
				assert.ok(oModel instanceof JSONModel, "then the result is of type JSONModel");
				assert.deepEqual(ContextBasedAdaptationsAPI.getAdaptationsModel(this.mPropertyBag), oModel, "then the adaptations model is initialized in session");
				assert.ok(oModel.updateAdaptations, "then the model was initialized with update function");
				assert.ok(oModel.insertAdaptation, "then the model was initialized with insert function");
				assert.deepEqual(oModel.getData(), {
					allAdaptations: [],
					adaptations: [],
					count: 0,
					displayedAdaptation: {},
					contextBasedAdaptationsEnabled: true
				}, "then the model was initialized with correct content");
			}.bind(this));
		});

		QUnit.test("when a control and a layer were provided and a draft does not exists", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
					return 1;
				}
			});
			var aReturnedVersions = [
				{ version: "2" },
				{ version: "1" }
			];
			sandbox.stub(Storage.versions, "load").resolves(aReturnedVersions);
			var oLoadStub = sandbox.stub(Storage.contextBasedAdaptation, "load").resolves({adaptations: []});

			return ContextBasedAdaptationsAPI.initialize(this.mPropertyBag).then(function(oModel) {
				assert.equal(oLoadStub.callCount, 1, "contextBasedAdaptations.load was called once");
				assert.ok(oModel instanceof JSONModel, "then the result is of type JSONModel");
				assert.deepEqual(ContextBasedAdaptationsAPI.getAdaptationsModel(this.mPropertyBag), oModel, "then the adaptations model is initialized in session");
				assert.ok(oModel.updateAdaptations, "then the model was initialized with update function");
				assert.ok(oModel.insertAdaptation, "then the model was initialized with insert function");
				assert.deepEqual(oModel.getData(), {
					allAdaptations: [],
					adaptations: [],
					count: 0,
					displayedAdaptation: {},
					contextBasedAdaptationsEnabled: true
				}, "then the model was initialized with correct content");
			}.bind(this));
		});

		QUnit.test("when initialize is called twice within the same session all parameters", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
					return 1;
				}
			});
			var aReturnedVersions = [
				{ version: "2" },
				{ version: "1" }
			];
			sandbox.stub(Storage.versions, "load").resolves(aReturnedVersions);
			var oLoadStub = sandbox.stub(Storage.contextBasedAdaptation, "load").resolves({adaptations: []});

			return ContextBasedAdaptationsAPI.initialize(this.mPropertyBag).then(function(oModel) {
				assert.equal(oLoadStub.callCount, 1, "contextBasedAdaptations.load was called once");
				assert.ok(oModel instanceof JSONModel, "then the result is of type JSONModel");
				assert.deepEqual(ContextBasedAdaptationsAPI.getAdaptationsModel(this.mPropertyBag), oModel, "then the adaptations model is initialized in session");
				assert.ok(oModel.updateAdaptations, "then the model was initialized with update function");
				assert.ok(oModel.insertAdaptation, "then the model was initialized with insert function");
				return ContextBasedAdaptationsAPI.initialize(this.mPropertyBag);
			}.bind(this)).then(function(oModel) {
				assert.equal(oLoadStub.callCount, 1, "contextBasedAdaptations.load was still called only once");
				assert.ok(oModel instanceof JSONModel, "then the result is of type JSONModel");
				assert.deepEqual(ContextBasedAdaptationsAPI.getAdaptationsModel(this.mPropertyBag), oModel, "then the adaptations model is initialized in session");
			}.bind(this));
		});
	});

	QUnit.module("Given ContextBasedAdaptationsAPI.createModel is called", {
		beforeEach: function() {
			this.oDefaultAdaptation = {
				id: "DEFAULT",
				contexts: {},
				title: "",
				description: "",
				createdBy: "",
				createdAt: "",
				changedBy: "",
				changedAt: "",
				type: "DEFAULT"
			};
			this.oExpectedFilledData = {
				allAdaptations: [
					{
						id: "id-1591275572834-1",
						contexts: {
							role: ["SALES"]
						},
						title: "German Admin",
						description: "ACH Admin for Germany",
						createdBy: "Test User 1",
						createdAt: "May 25, 2022",
						changedBy: "Test User 1",
						changedAt: "May 27, 2022",
						type: ""
					},
					{
						id: "id-1591275572835-1",
						contexts: {
							role: ["MARKETING_MANAGER"]
						},
						title: "DLM Copilot",
						description: "DLM copilot contexts for Europe",
						createdBy: "Test User 2",
						createdAt: "May 17, 2022",
						changedBy: "Test User 2",
						changedAt: "SEPTEMBER 07, 2022",
						type: ""
					},
					this.oDefaultAdaptation
				],
				adaptations: [
					{
						id: "id-1591275572834-1",
						contexts: {
							role: ["SALES"]
						},
						title: "German Admin",
						description: "ACH Admin for Germany",
						createdBy: "Test User 1",
						createdAt: "May 25, 2022",
						changedBy: "Test User 1",
						changedAt: "May 27, 2022",
						type: "",
						rank: 1
					},
					{
						id: "id-1591275572835-1",
						contexts: {
							role: ["MARKETING_MANAGER"]
						},
						title: "DLM Copilot",
						description: "DLM copilot contexts for Europe",
						createdBy: "Test User 2",
						createdAt: "May 17, 2022",
						changedBy: "Test User 2",
						changedAt: "SEPTEMBER 07, 2022",
						type: "",
						rank: 2
					}
				],
				count: 2,
				displayedAdaptation: {
					id: "id-1591275572834-1",
					contexts: {
						role: ["SALES"]
					},
					title: "German Admin",
					description: "ACH Admin for Germany",
					createdBy: "Test User 1",
					createdAt: "May 25, 2022",
					changedBy: "Test User 1",
					changedAt: "May 27, 2022",
					type: "",
					rank: 1
				},
				contextBasedAdaptationsEnabled: true
			};
			this.oExpectedEmptyData = {
				allAdaptations: [this.oDefaultAdaptation],
				adaptations: [],
				count: 0,
				displayedAdaptation: {
					changedAt: "",
					changedBy: "",
					contexts: {},
					createdAt: "",
					createdBy: "",
					description: "",
					id: "DEFAULT",
					rank: 1,
					title: "",
					type: "DEFAULT"
				},
				contextBasedAdaptationsEnabled: true
			};
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when nothing is provided", function(assert) {
			assert.throws(function() {
				ContextBasedAdaptationsAPI.createModel();
			}, new Error("Adaptations model can only be initialized with an array of adaptations"), "then adaptation model cannot be initialized and throws error");
		});

		QUnit.test("when only default adaptation is provided", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedEmptyData.allAdaptations, undefined, true);
			assert.deepEqual(oModel.getData(), this.oExpectedEmptyData, "then the adaptations model is created correctly with empty values");
		});

		QUnit.test("when a filled list of adaptations is provided", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations, undefined, true);
			assert.deepEqual(oModel.getData(), this.oExpectedFilledData, "then the adaptations model is created correctly");
		});

		QUnit.test("when a filled list of adaptations is provided with FlexInfoSession", function(assert) {
			sandbox.stub(FlexInfoSession, "get").returns({adaptationId: "id-1591275572835-1" });
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations, undefined, true);
			this.oExpectedFilledData.displayedAdaptation = this.oExpectedFilledData.adaptations[1];
			assert.deepEqual(oModel.getData(), this.oExpectedFilledData, "then the adaptations model is created correctly");
		});

		QUnit.test("when an empty list of adaptations is initialized and later updated with 2 adaptations", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedEmptyData.allAdaptations, undefined, true);
			assert.deepEqual(oModel.getData(), this.oExpectedEmptyData, "then the adaptations model is created correctly with empty values");
			oModel.updateAdaptations(this.oExpectedFilledData.allAdaptations);
			oModel.switchDisplayedAdaptation(this.oExpectedFilledData.allAdaptations[0].id);
			assert.deepEqual(oModel.getData(), this.oExpectedFilledData, "then the adaptations model is updated correctly");
		});

		QUnit.test("when an empty list of adaptations is initialized and later 1 adaptation is inserted", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedEmptyData.allAdaptations, undefined, true);
			assert.deepEqual(oModel.getData(), this.oExpectedEmptyData, "then the adaptations model is created correctly with empty values");
			var oNewAdaptation = {
				id: "id-1591275572999-1",
				priority: 0,
				contexts: {
					role: ["SALES"]
				},
				title: "German Admin"
			};
			var oExpectedInsertedData = {allAdaptations: [oNewAdaptation, this.oDefaultAdaptation], adaptations: [oNewAdaptation], count: 1, displayedAdaptation: oNewAdaptation, contextBasedAdaptationsEnabled: true};
			oModel.insertAdaptation(oNewAdaptation);
			oModel.switchDisplayedAdaptation(oNewAdaptation.id);
			assert.deepEqual(oModel.getData(), oExpectedInsertedData, "then the adaptations model is updated correctly");
		});

		QUnit.test("when a list of adaptations is initialized and later 1 adaptation is inserted", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations, undefined, true);
			assert.deepEqual(oModel.getData(), this.oExpectedFilledData, "then the adaptations model is created correctly");
			var oNewAdaptation = {
				id: "id-1591275572999-1",
				priority: 1,
				contexts: {
					role: ["ADMIN"]
				},
				title: "IT Chief Admin"
			};
			var oExpectedNewAdaptation = {
				id: "id-1591275572999-1",
				contexts: {
					role: ["ADMIN"]
				},
				title: "IT Chief Admin",
				rank: 2
			};

			var oAdaptation1 = this.oExpectedFilledData.adaptations[0];
			var oAdaptation2 = deepClone(this.oExpectedFilledData.adaptations[1]);
			// rank is expected to increase as a new adaptation is inserted in between
			oAdaptation2.rank = 3;
			var oExpectedFilledData = {
				allAdaptations: [oAdaptation1, oExpectedNewAdaptation, oAdaptation2, this.oDefaultAdaptation],
				adaptations: [oAdaptation1, oExpectedNewAdaptation, oAdaptation2],
				count: 3,
				displayedAdaptation: oExpectedNewAdaptation,
				contextBasedAdaptationsEnabled: true
			};
			oModel.insertAdaptation(oNewAdaptation);
			oModel.switchDisplayedAdaptation(oNewAdaptation.id);
			assert.deepEqual(oModel.getData(), oExpectedFilledData, "then the adaptations model is updated correctly");
		});

		QUnit.test("when a list of adaptations is initialized and later the first adaptation is deleted", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations, undefined, true);
			assert.deepEqual(oModel.getData(), this.oExpectedFilledData, "then the adaptations model is created correctly");
			var oAdaptation = deepClone(this.oExpectedFilledData.adaptations[1]);
			// rank is expected to decrease as the leading adaptation is deleted
			oAdaptation.rank = 1;
			var oExpectedFilledData = {
				allAdaptations: [oAdaptation, this.oDefaultAdaptation],
				adaptations: [oAdaptation],
				count: 1,
				displayedAdaptation: oAdaptation,
				contextBasedAdaptationsEnabled: true
			};
			var sDisplayedAdaptationId = oModel.deleteAdaptation();
			oModel.switchDisplayedAdaptation(sDisplayedAdaptationId);
			assert.deepEqual(oModel.getData(), oExpectedFilledData, "then the adaptations model is updated correctly");
			assert.strictEqual(sDisplayedAdaptationId, oAdaptation.id, "then the correct adaptationId for switch is returned");
		});

		QUnit.test("when a list of adaptations is initialized and later the last adaptation is deleted", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations, undefined, true);
			assert.deepEqual(oModel.getData(), this.oExpectedFilledData, "then the adaptations model is created correctly");
			var oAdaptation = this.oExpectedFilledData.adaptations[0];
			var oExpectedFilledData = {
				allAdaptations: [oAdaptation, this.oDefaultAdaptation],
				adaptations: [oAdaptation],
				count: 1,
				displayedAdaptation: oAdaptation,
				contextBasedAdaptationsEnabled: true
			};
			oModel.switchDisplayedAdaptation("id-1591275572835-1");
			var sDisplayedAdaptationId = oModel.deleteAdaptation();
			oModel.switchDisplayedAdaptation(sDisplayedAdaptationId);
			assert.deepEqual(oModel.getData(), oExpectedFilledData, "then the adaptations model is updated correctly");
			assert.strictEqual(sDisplayedAdaptationId, oAdaptation.id, "then the correct adaptationId for switch is returned");
		});

		QUnit.test("when a list of adaptations is initialized and later an adaptation is created in the middle and then deleted again", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations, undefined, true);
			assert.deepEqual(oModel.getData(), this.oExpectedFilledData, "then the adaptations model is created correctly");
			var oAdaptation1 = this.oExpectedFilledData.adaptations[0];
			var oAdaptation2 = this.oExpectedFilledData.adaptations[1];
			var oNewAdaptation3 = {
				id: "id-1591275512345-1",
				priority: 1,
				contexts: {
					role: ["HR_PARTNER"]
				},
				title: "HR Business Partner"
			};
			var oExpectedFilledData = {
				allAdaptations: [oAdaptation1, oAdaptation2, this.oDefaultAdaptation],
				adaptations: [oAdaptation1, oAdaptation2],
				count: 2,
				displayedAdaptation: oAdaptation2,
				contextBasedAdaptationsEnabled: true
			};
			oModel.insertAdaptation(oNewAdaptation3);
			oModel.switchDisplayedAdaptation(oNewAdaptation3.id);
			var sDisplayedAdaptationId = oModel.deleteAdaptation();
			oModel.switchDisplayedAdaptation(sDisplayedAdaptationId);
			assert.deepEqual(oModel.getData(), oExpectedFilledData, "then the adaptations model is updated correctly");
			assert.strictEqual(sDisplayedAdaptationId, oAdaptation2.id, "then the correct adaptationId for switch is returned");
		});

		QUnit.test("when a list of adaptations is initialized and later all adaptations are deleted", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations, undefined, true);
			assert.deepEqual(oModel.getData(), this.oExpectedFilledData, "then the adaptations model is created correctly");
			var oExpectedFilledData = {
				allAdaptations: [this.oDefaultAdaptation],
				adaptations: [],
				count: 0,
				displayedAdaptation: this.oDefaultAdaptation,
				contextBasedAdaptationsEnabled: true
			};
			oModel.deleteAdaptation();
			var sDisplayedAdaptationId = oModel.deleteAdaptation();
			oModel.switchDisplayedAdaptation(sDisplayedAdaptationId);
			assert.deepEqual(oModel.getData(), oExpectedFilledData, "then the adaptations model is updated correctly");
		});

		QUnit.test("when a list of adaptations is initialized and later the displayed adaptation is switched", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations, undefined, true);
			assert.deepEqual(oModel.getData(), this.oExpectedFilledData, "then the adaptations model is created correctly");
			var oExpectedDisplayedAdaptation = this.oExpectedFilledData.adaptations[1];
			oModel.switchDisplayedAdaptation("id-1591275572835-1");
			assert.deepEqual(oModel.getProperty("/displayedAdaptation"), oExpectedDisplayedAdaptation, "then the adaptations model is updated correctly");
		});

		QUnit.test("when a list of adaptations is initialized and later the displayed adaptation is switched to the context-free adaptation", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations, undefined, true);
			assert.deepEqual(oModel.getData(), this.oExpectedFilledData, "then the adaptations model is created correctly");
			oModel.switchDisplayedAdaptation("DEFAULT");
			assert.deepEqual(oModel.getProperty("/displayedAdaptation"), this.oDefaultAdaptation, "then the adaptations model is updated correctly");
		});

		QUnit.test("when a list of adaptations is initialized and later the displayed adaptation is updated", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations, undefined, true);
			assert.deepEqual(oModel.getData(), this.oExpectedFilledData, "then the adaptations model is created correctly");
			var oAdaptation1 = deepClone(this.oExpectedFilledData.adaptations[0]);
			oAdaptation1.rank = 2;
			var oUpdatedAdaptation = deepClone(this.oExpectedFilledData.adaptations[1]);
			oUpdatedAdaptation.title = "DLM Main Pilot";
			oUpdatedAdaptation.contexts = {
				role: ["MAIN_PILOT"]
			};
			oUpdatedAdaptation.rank = 1;
			var oExpectedFilledData = {
				allAdaptations: [oUpdatedAdaptation, oAdaptation1, this.oDefaultAdaptation],
				adaptations: [oUpdatedAdaptation, oAdaptation1],
				count: 2,
				displayedAdaptation: oUpdatedAdaptation,
				contextBasedAdaptationsEnabled: true
			};
			var oContextBasedAdaptation = {
				title: "DLM Main Pilot",
				contexts: {
					role: ["MAIN_PILOT"]
				},
				priority: 0
			};
			oModel.switchDisplayedAdaptation("id-1591275572835-1");
			oModel.updateAdaptationContent(oContextBasedAdaptation, "id-1591275572835-1");
			assert.deepEqual(oModel.getData(), oExpectedFilledData, "then the adaptations model is updated correctly");
		});

		QUnit.test("when a list of adaptations is initialized and getIndexByAdaptationId is called", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations, undefined, true);
			assert.strictEqual(oModel.getIndexByAdaptationId("id-1591275572834-1"), 0, "then the correct index is returned");
			assert.strictEqual(oModel.getIndexByAdaptationId("id-1591275572835-1"), 1, "then the correct index is returned");
		});
	});

	QUnit.module("Given ContextBasedAdaptationsAPI.getAdaptationsModel is called", {
		before: function() {
			this.oAppComponent = {
				getManifest: function() {
					return {};
				},
				getManifestObject: function() {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId: function() {
					return "sComponentId";
				},
				getComponentData: function() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach: function() {
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control()
			};
			stubSettings(sandbox);
			ContextBasedAdaptationsAPI.clearInstances();
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no control is provided", function(assert) {
			assert.notOk(ContextBasedAdaptationsAPI.hasAdaptationsModel(this.mPropertyBag), "there is no adaptations model for this reference and layer");
			delete this.mPropertyBag.control;
			assert.throws(function() {
				ContextBasedAdaptationsAPI.getAdaptationsModel(this.mPropertyBag);
			}, new Error("No control was provided"), "then the correct error message is returned");
		});

		QUnit.test("when no layer is provided", function(assert) {
			assert.notOk(ContextBasedAdaptationsAPI.hasAdaptationsModel(this.mPropertyBag), "there is no adaptations model for this reference and layer");
			delete this.mPropertyBag.layer;
			assert.throws(function() {
				ContextBasedAdaptationsAPI.getAdaptationsModel(this.mPropertyBag);
			}, new Error("No layer was provided"), "then the correct error message is returned");
		});

		QUnit.test("when a control and a layer were provided and adaptations model was not initialized", function(assert) {
			assert.notOk(ContextBasedAdaptationsAPI.hasAdaptationsModel(this.mPropertyBag), "there is no adaptations model for this reference and layer");
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");

			assert.throws(function() {
				ContextBasedAdaptationsAPI.getAdaptationsModel(this.mPropertyBag);
			}, new Error("Adaptations model for reference 'com.sap.test.app' and layer 'CUSTOMER' were not initialized."), "then the correct error message is returned");
		});

		QUnit.test("when a control and a layer were provided and empty adaptations model was initialized", function(assert) {
			assert.notOk(ContextBasedAdaptationsAPI.hasAdaptationsModel(this.mPropertyBag), "there is no adaptations model for this reference and layer");
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
					return sActiveVersion;
				}
			});
			var oExpectedFilledData = {
				allAdaptations: [
					{
						id: "DEFAULT",
						contexts: {},
						title: "",
						description: "",
						createdBy: "",
						createdAt: "",
						changedBy: "",
						changedAt: "",
						type: "DEFAULT"
					}
				],
				adaptations: [],
				count: 0,
				displayedAdaptation: {
					changedAt: "",
					changedBy: "",
					contexts: {},
					createdAt: "",
					createdBy: "",
					description: "",
					id: "DEFAULT",
					rank: 1,
					title: "",
					type: "DEFAULT"
				},
				contextBasedAdaptationsEnabled: true
			};
			sandbox.stub(Storage.contextBasedAdaptation, "load").resolves({adaptations: oExpectedFilledData.allAdaptations});
			return ContextBasedAdaptationsAPI.initialize(this.mPropertyBag).then(function() {
				assert.ok(ContextBasedAdaptationsAPI.hasAdaptationsModel(this.mPropertyBag), "there is an adaptations model for this reference and layer");
				var oModel = ContextBasedAdaptationsAPI.getAdaptationsModel(this.mPropertyBag);
				assert.ok(oModel instanceof JSONModel, "then the result is of type JSONModel");
				assert.deepEqual(oModel.getData(), oExpectedFilledData, "then the adaptations model is returned with initialized values");
				assert.strictEqual(ContextBasedAdaptationsAPI.getDisplayedAdaptationId(this.mPropertyBag), undefined, "displayed default adaptation id is undefined");
				assert.notOk(ContextBasedAdaptationsAPI.adaptationExists(this.mPropertyBag), "at least one adaptation exists");
			}.bind(this));
		});

		QUnit.test("when a control and a layer were provided and adaptations model was initialized", function(assert) {
			assert.notOk(ContextBasedAdaptationsAPI.hasAdaptationsModel(this.mPropertyBag), "there is no adaptations model for this reference and layer");
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
					return sActiveVersion;
				}
			});
			var oExpectedFilledData = {
				allAdaptations: [
					{
						id: "id-1591275572834-1",
						contexts: {
							role: ["SALES"]
						},
						title: "German Admin",
						description: "ACH Admin for Germany",
						createdBy: "Test User 1",
						createdAt: "May 25, 2022",
						changedBy: "Test User 1",
						changedAt: "May 27, 2022"
					},
					{
						id: "id-1591275572835-1",
						contexts: {
							role: ["MARKETING_MANAGER"]
						},
						title: "DLM Copilot",
						description: "DLM copilot contexts for Europe",
						createdBy: "Test User 2",
						createdAt: "May 17, 2022",
						changedBy: "Test User 2",
						changedAt: "SEPTEMBER 07, 2022"
					},
					{
						id: "DEFAULT",
						contexts: {},
						title: "",
						description: "",
						createdBy: "",
						createdAt: "",
						changedBy: "",
						changedAt: "",
						type: "DEFAULT"
					}
				],
				adaptations: [
					{
						id: "id-1591275572834-1",
						contexts: {
							role: ["SALES"]
						},
						title: "German Admin",
						description: "ACH Admin for Germany",
						createdBy: "Test User 1",
						createdAt: "May 25, 2022",
						changedBy: "Test User 1",
						changedAt: "May 27, 2022",
						rank: 1
					},
					{
						id: "id-1591275572835-1",
						contexts: {
							role: ["MARKETING_MANAGER"]
						},
						title: "DLM Copilot",
						description: "DLM copilot contexts for Europe",
						createdBy: "Test User 2",
						createdAt: "May 17, 2022",
						changedBy: "Test User 2",
						changedAt: "SEPTEMBER 07, 2022",
						rank: 2
					}
				],
				count: 2,
				displayedAdaptation: {
					id: "id-1591275572834-1",
					contexts: {
						role: ["SALES"]
					},
					title: "German Admin",
					description: "ACH Admin for Germany",
					createdBy: "Test User 1",
					createdAt: "May 25, 2022",
					changedBy: "Test User 1",
					changedAt: "May 27, 2022",
					rank: 1
				},
				contextBasedAdaptationsEnabled: true
			};
			sandbox.stub(Storage.contextBasedAdaptation, "load").resolves({adaptations: oExpectedFilledData.allAdaptations});
			return ContextBasedAdaptationsAPI.initialize(this.mPropertyBag).then(function() {
				assert.ok(ContextBasedAdaptationsAPI.hasAdaptationsModel(this.mPropertyBag), "there is an adaptations model for this reference and layer");
				var oModel = ContextBasedAdaptationsAPI.getAdaptationsModel(this.mPropertyBag);
				assert.ok(oModel instanceof JSONModel, "then the result is of type JSONModel");
				assert.deepEqual(oModel.getData(), oExpectedFilledData, "then the adaptations model is returned with initialized values");
				assert.strictEqual(ContextBasedAdaptationsAPI.getDisplayedAdaptationId(this.mPropertyBag), oExpectedFilledData.displayedAdaptation.id, "displayed adaptation id is correct");
				oModel.switchDisplayedAdaptation("DEFAULT");
				assert.strictEqual(ContextBasedAdaptationsAPI.getDisplayedAdaptationId(this.mPropertyBag), undefined, "displayed default adaptation id is undefined");
				assert.ok(ContextBasedAdaptationsAPI.adaptationExists(this.mPropertyBag), "at least one adaptation exists");
			}.bind(this));
		});
	});

	QUnit.module("Given ContextBasedAdaptationsAPI is initialized with adaptations and refreshAdaptationModel is called", {
		before: function() {
			this.oAppComponent = {
				getManifest: function() {
					return {};
				},
				getManifestObject: function() {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId: function() {
					return "sComponentId";
				},
				getComponentData: function() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach: function() {
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control()
			};
			stubSettings(sandbox);
			ContextBasedAdaptationsAPI.clearInstances();
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.test.app");
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
					return sActiveVersion;
				}
			});
			var aAdaptations = [
				{
					id: "id-1591275572834-1",
					contexts: {
						role: ["SALES"]
					},
					title: "German Admin",
					description: "ACH Admin for Germany",
					createdBy: "Test User 1",
					createdAt: "May 25, 2022",
					changedBy: "Test User 1",
					changedAt: "May 27, 2022"
				},
				{
					id: "id-1591275572835-1",
					contexts: {
						role: ["MARKETING_MANAGER"]
					},
					title: "DLM Copilot",
					description: "DLM copilot contexts for Europe",
					createdBy: "Test User 2",
					createdAt: "May 17, 2022",
					changedBy: "Test User 2",
					changedAt: "SEPTEMBER 07, 2022"
				},
				{
					id: "id-1591275572836-1",
					contexts: {
						role: ["HR_MANAGER"]
					},
					title: "Only for HR",
					description: "HR restricted",
					createdBy: "Test User 3",
					createdAt: "May 17, 2022",
					changedBy: "Test User 3",
					changedAt: "SEPTEMBER 07, 2022"
				},
				{
					id: "DEFAULT",
					contexts: {},
					title: "",
					description: "",
					createdBy: "",
					createdAt: "",
					changedBy: "",
					changedAt: "",
					type: "DEFAULT"
				}
			];
			sandbox.stub(Storage.contextBasedAdaptation, "load").resolves({adaptations: aAdaptations});
			return ContextBasedAdaptationsAPI.initialize(this.mPropertyBag).then(function(oModel) {
				this.oModel = oModel;
			}.bind(this));
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the displayed adaptation is still available", function(assert) {
			this.oModel.switchDisplayedAdaptation("id-1591275572836-1");
			return ContextBasedAdaptationsAPI.refreshAdaptationModel(this.mPropertyBag).then(function(sDisplayedAdaptationId) {
				assert.strictEqual(sDisplayedAdaptationId, "id-1591275572836-1",
					"then the displayed adaptation is the same as before the refresh has been called");
			});
		});

		QUnit.test("when the displayed adaptation is not available anymore", function(assert) {
			this.oModel.getProperty("/allAdaptations").splice(0, 1); // simulate first adaptation is not available anymore
			return ContextBasedAdaptationsAPI.refreshAdaptationModel(this.mPropertyBag).then(function(sDisplayedAdaptationId) {
				assert.strictEqual(sDisplayedAdaptationId, "id-1591275572835-1",
					"then the displayed adaptation is the one with highest prio");
			});
		});
	});

	QUnit.module("Given ContextBasedAdaptationsAPI.create is called", {
		before: function() {
			this.oAppComponent = {
				getManifest: function() {
					return {};
				},
				getManifestObject: function() {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId: function() {
					return "sComponentId";
				},
				getComponentData: function() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach: function() {
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control(),
				contextBasedAdaptation: {}
			};
			stubSettings(sandbox);
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			this.oOnAllChangesSavedStub = sandbox.stub(Versions, "onAllChangesSaved");
			this.oWriteChangesStub = sandbox.stub(Storage, "write").resolves("Success");
		},
		afterEach: function() {
			sandbox.restore();
			FlexState.clearState();
		}
	}, function() {
		QUnit.test("when no control is provided", function(assert) {
			delete this.mPropertyBag.control;
			return ContextBasedAdaptationsAPI.create(this.mPropertyBag)
			.then(function() {
				assert.ok(false, "Should not succeed");
			})
			.catch(function(sError) {
				assert.equal(sError, "No control was provided", "then the correct error message is returned");
				assert.strictEqual(this.oOnAllChangesSavedStub.callCount, 0, "Versions.OnAllChangesSaved is called");
			}.bind(this));
		});

		QUnit.test("when no layer is provided", function(assert) {
			delete this.mPropertyBag.layer;
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.create(this.mPropertyBag)
			.then(function() {
				assert.ok(false, "Should not succeed");
			})
			.catch(function(sError) {
				assert.equal(sError, "No layer was provided", "then the correct error message is returned");
				assert.strictEqual(this.oOnAllChangesSavedStub.callCount, 0, "Versions.OnAllChangesSaved is called");
			}.bind(this));
		});

		QUnit.test("when no contextBasedAdaptation is provided", function(assert) {
			delete this.mPropertyBag.contextBasedAdaptation;
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.create(this.mPropertyBag)
			.then(function() {
				assert.ok(false, "Should not succeed");
			})
			.catch(function(sError) {
				assert.equal(sError, "No contextBasedAdaptation was provided", "then the correct error message is returned");
				assert.strictEqual(this.oOnAllChangesSavedStub.callCount, 0, "Versions.OnAllChangesSaved is called");
			}.bind(this));
		});

		QUnit.test("when a control and a layer were provided and a draft exists and no changes exist", function(assert) {
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
					return Version.Number.Draft;
				}
			});
			var oModel = new JSONModel({});
			oModel.insertAdaptation = function() {
				return;
			};
			sandbox.stub(ContextBasedAdaptationsAPI, "getAdaptationsModel").returns(oModel);
			var aReturnedVersions = [
				{ version: Version.Number.Draft },
				{ version: "2" },
				{ version: "1" }
			];
			sandbox.stub(Storage.versions, "load").resolves(aReturnedVersions);
			var oCreateStub = sandbox.stub(Storage.contextBasedAdaptation, "create").resolves("Success");

			return ContextBasedAdaptationsAPI.create(this.mPropertyBag).then(function(sResult) {
				var oArgs = oCreateStub.getCall(0).args[0];
				assert.strictEqual(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
				assert.strictEqual(oArgs.parentVersion, Version.Number.Draft, "then the correct version is used");
				assert.strictEqual(oArgs.appId, "com.sap.test.app", "then the correct reference is used");
				assert.strictEqual(sResult, "Success", "the context-based adaptation is created");

				assert.strictEqual(this.oOnAllChangesSavedStub.callCount, 1, "Versions.OnAllChangesSaved is called");
				oArgs = this.oOnAllChangesSavedStub.getCall(0).args[0];
				assert.strictEqual(oArgs.reference, "com.sap.test.app", "then the correct reference is used");
				assert.strictEqual(oArgs.layer, Layer.CUSTOMER, "then the correct layer");
				assert.strictEqual(oArgs.contextBasedAdaptation, true, "then the correct contextBasedAdaptation flag is set");
			}.bind(this));
		});

		QUnit.test("when a control and a layer were provided and a draft does not exists and no changes exist", function(assert) {
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
					return 1;
				}
			});
			var oModel = new JSONModel({});
			oModel.insertAdaptation = function() {
				return;
			};
			sandbox.stub(ContextBasedAdaptationsAPI, "getAdaptationsModel").returns(oModel);
			var aReturnedVersions = [
				{ version: "2" },
				{ version: "1" }
			];
			sandbox.stub(Storage.versions, "load").resolves(aReturnedVersions);
			var oPublishStub = sandbox.stub(Storage.contextBasedAdaptation, "create").resolves("Success");

			return ContextBasedAdaptationsAPI.create(this.mPropertyBag).then(function(sResult) {
				var oArgs = oPublishStub.getCall(0).args[0];
				assert.strictEqual(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
				assert.strictEqual(oArgs.parentVersion, 1, "then the correct version is used");
				assert.strictEqual(oArgs.appId, "com.sap.test.app", "then the correct reference is used");
				assert.strictEqual(sResult, "Success", "the context-based adaptation is created");

				assert.strictEqual(this.oOnAllChangesSavedStub.callCount, 1, "Versions.OnAllChangesSaved is called");
				oArgs = this.oOnAllChangesSavedStub.getCall(0).args[0];
				assert.strictEqual(oArgs.reference, "com.sap.test.app", "then the correct reference is used");
				assert.strictEqual(oArgs.layer, Layer.CUSTOMER, "then the correct layer");
				assert.strictEqual(oArgs.contextBasedAdaptation, true, "then the correct contextBasedAdaptation flag is set");
			}.bind(this));
		});
	});

	QUnit.module("Given ContextBasedAdaptationsAPI.create is called with copy of changes", {
		before: function() {
			this.oAppComponent = {
				getManifest: function() {
					return {};
				},
				getManifestObject: function() {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId: function() {
					return "sComponentId";
				},
				getComponentData: function() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach: function() {
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control(),
				contextBasedAdaptation: {}
			};
			stubSettings(sandbox);
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			sandbox.stub(Storage.contextBasedAdaptation, "load").resolves({adaptations: []});
			this.oOnAllChangesSavedStub = sandbox.stub(Versions, "onAllChangesSaved");
			this.oWriteChangesStub = sandbox.stub(Storage, "write").resolves("Success");
			ContextBasedAdaptationsAPI.clearInstances();
		},
		afterEach: function() {
			sandbox.restore();
			FlexState.clearState();
		}
	}, function() {
		var oCompVariantFlexDataResponse = LoaderExtensions.loadResource({
			dataType: "json",
			url: sap.ui.require.toUrl("test-resources/sap/ui/fl/qunit/testResources/variants/testCompVariants.json"),
			async: false
		});
		var oFLVariantFlexDataResponse = LoaderExtensions.loadResource({
			dataType: "json",
			url: sap.ui.require.toUrl("test-resources/sap/ui/fl/qunit/testResources/variants/testFLVariants.json"),
			async: false
		});
		[{
			testName: "when there are control variant changes and no draft exists",
			stubResponse: oFLVariantFlexDataResponse,
			aReturnedVersions: [
				{ version: "2" },
				{ version: "1" }
			],
			stubVersionModel: 1
		}, {
			testName: "when there are comp. variant changes and no draft exists",
			stubResponse: oCompVariantFlexDataResponse,
			aReturnedVersions: [
				{ version: "2" },
				{ version: "1" }
			],
			stubVersionModel: 1
		}, {
			testName: "when there are control variant changes and a draft exists",
			stubResponse: oFLVariantFlexDataResponse,
			aReturnedVersions: [
				{ version: Version.Number.Draft },
				{ version: "2" },
				{ version: "1" }
			],
			stubVersionModel: Version.Number.Draft
		}, {
			testName: "when there are comp. variant changes and a draft exists",
			stubResponse: oCompVariantFlexDataResponse,
			aReturnedVersions: [
				{ version: Version.Number.Draft },
				{ version: "2" },
				{ version: "1" }
			],
			stubVersionModel: Version.Number.Draft
		}].forEach(function(mSetup) {
			QUnit.test(mSetup.testName, function(assert) {
				sandbox.stub(Versions, "getVersionsModel").returns({
					getProperty: function() {
						return mSetup.stubVersionModel;
					}
				});

				sandbox.stub(Storage.versions, "load").resolves(mSetup.aReturnedVersions);
				sandbox.stub(InitialStorage, "loadFlexData").resolves(mSetup.stubResponse);
				var oPublishStub = sandbox.stub(Storage.contextBasedAdaptation, "create").resolves("Success");

				assert.notOk(ContextBasedAdaptationsAPI.hasAdaptationsModel(this.mPropertyBag), "there is no adaptations model for this reference and layer");
				return ContextBasedAdaptationsAPI.initialize(this.mPropertyBag).then(function() {
					return ContextBasedAdaptationsAPI.create(this.mPropertyBag).then(function(sResult) {
						var oArgs = oPublishStub.getCall(0).args[0];
						assert.strictEqual(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
						if (mSetup.stubVersionModel === Version.Number.Draft) {
							assert.strictEqual(oArgs.parentVersion, Version.Number.Draft, "then the correct version is used");
						} else {
							assert.strictEqual(oArgs.parentVersion, 1, "then the correct version is used");
						}
						assert.strictEqual(oArgs.appId, "com.sap.test.app", "then the correct reference is used");

						assert.strictEqual(this.oOnAllChangesSavedStub.callCount, 1, "Versions.OnAllChangesSaved is called");
						oArgs = this.oOnAllChangesSavedStub.getCall(0).args[0];
						assert.strictEqual(oArgs.reference, "com.sap.test.app", "then the correct reference is used");
						assert.strictEqual(oArgs.layer, Layer.CUSTOMER, "then the correct layer");
						assert.strictEqual(oArgs.contextBasedAdaptation, true, "then the correct contextBasedAdaptation flag is set");

						assert.strictEqual(sResult, "Success", "the context-based adaptation is created");
						var oWriteArgs = this.oWriteChangesStub.getCall(0).args[0];
						return verifyChangesAreCopiedCorrectly.call(this, oWriteArgs.flexObjects, assert);
					}.bind(this));
				}.bind(this));
			});
		});
	});

	QUnit.module("Given ContextBasedAdaptationsAPI.reorder is called", {
		before: function() {
			this.oAppComponent = {
				getManifest: function() {
					return {};
				},
				getManifestObject: function() {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId: function() {
					return "sComponentId";
				},
				getComponentData: function() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach: function() {
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control(),
				parameters: {
					priorities: ["", "", "", ""]
				}
			};
			stubSettings(sandbox);
			this.oOnAllChangesSavedStub = sandbox.stub(Versions, "onAllChangesSaved");
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no control is provided", function(assert) {
			delete this.mPropertyBag.control;
			return ContextBasedAdaptationsAPI.reorder(this.mPropertyBag).catch(function(sError) {
				assert.equal(sError, "No control was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("when no layer is provided", function(assert) {
			delete this.mPropertyBag.layer;
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.reorder(this.mPropertyBag)
			.then(function() {
				assert.ok(false, "Should not succeed");
			})
			.catch(function(sError) {
				assert.equal(sError, "No layer was provided", "then the correct error message is returned");
				assert.strictEqual(this.oOnAllChangesSavedStub.callCount, 0, "Versions.OnAllChangesSaved is not called");
			}.bind(this));
		});

		QUnit.test("when no priorities list is provided", function(assert) {
			delete this.mPropertyBag.parameters;
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.reorder(this.mPropertyBag)
			.then(function() {
				assert.ok(false, "Should not succeed");
			})
			.catch(function(sError) {
				assert.equal(sError, "No valid priority list was provided", "then the correct error message is returned");
				assert.strictEqual(this.oOnAllChangesSavedStub.callCount, 0, "Versions.OnAllChangesSaved is not called");
			}.bind(this));
		});

		QUnit.test("when control and layer and prorities list are provided", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
					return sActiveVersion;
				}
			});

			var oReorderStub = sandbox.stub(Storage.contextBasedAdaptation, "reorder").resolves("Success");
			return ContextBasedAdaptationsAPI.reorder(this.mPropertyBag).then(function(sResult) {
				var oArgs = oReorderStub.getCall(0).args[0];
				assert.deepEqual(oArgs.flexObjects, this.mPropertyBag.parameters, "then the correct parameters with priority list is used");
				assert.strictEqual(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
				assert.strictEqual(oArgs.parentVersion, 1, "then the correct version is used");
				assert.strictEqual(oArgs.appId, "com.sap.test.app", "then the correct reference is used");
				assert.strictEqual(sResult, "Success", "then the reorder was succesfull");

				assert.strictEqual(this.oOnAllChangesSavedStub.callCount, 1, "Versions.OnAllChangesSaved is called");
				oArgs = this.oOnAllChangesSavedStub.getCall(0).args[0];
				assert.strictEqual(oArgs.reference, "com.sap.test.app", "then the correct reference is used");
				assert.strictEqual(oArgs.layer, Layer.CUSTOMER, "then the correct layer");
				assert.strictEqual(oArgs.contextBasedAdaptation, true, "then the correct contextBasedAdaptation flag is set");
			}.bind(this));
		});
	});

	QUnit.module("Given ContextBasedAdaptationsAPI.load is called", {
		before: function() {
			this.oAppComponent = {
				getManifest: function() {
					return {};
				},
				getManifestObject: function() {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId: function() {
					return "sComponentId";
				},
				getComponentData: function() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach: function() {
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control()
			};
			stubSettings(sandbox);
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no control is provided", function(assert) {
			delete this.mPropertyBag.control;
			return ContextBasedAdaptationsAPI.load(this.mPropertyBag).catch(function(sError) {
				assert.equal(sError, "No control was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("when no layer is provided", function(assert) {
			delete this.mPropertyBag.layer;
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.load(this.mPropertyBag).catch(function(sError) {
				assert.equal(sError, "No layer was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("when control and layer is provided and context-based adaptation response is returned", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
					return sActiveVersion;
				}
			});
			var aAdaptations = {
				adaptations: [
					{
						id: "id-1591275572834-1",
						contexts: {
							role: ["SALES"]
						},
						title: "German Admin",
						description: "ACH Admin for Germany",
						createdBy: "Test User 1",
						createdAt: "May 25, 2022",
						changedBy: "Test User 1",
						changedAt: "May 27, 2022"
					},
					{
						id: "id-1591275572835-1",
						contexts: {
							role: ["MARKETING_MANAGER"]
						},
						title: "DLM Copilot",
						description: "DLM copilot contexts for Europe",
						createdBy: "Test User 2",
						createdAt: "May 17, 2022",
						changedBy: "Test User 2",
						changedAt: "SEPTEMBER 07, 2022"
					}
				]
			};
			var oReorderStub = sandbox.stub(Storage.contextBasedAdaptation, "load").resolves(aAdaptations);
			return ContextBasedAdaptationsAPI.load(this.mPropertyBag).then(function(sResult) {
				var oArgs = oReorderStub.getCall(0).args[0];
				assert.strictEqual(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
				assert.strictEqual(oArgs.version, 1, "then correct version is used");
				assert.strictEqual(oArgs.appId, "com.sap.test.app", "the correct reference is used");
				assert.strictEqual(sResult.adaptations.length, 2, "the correct data length is returned");
				assert.deepEqual(sResult, aAdaptations, "then the correct data is returned");
			});
		});

		QUnit.test("when control and layer is provided and an empty response is returned", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
					return sActiveVersion;
				}
			});

			var oReorderStub = sandbox.stub(Storage.contextBasedAdaptation, "load").resolves();
			return ContextBasedAdaptationsAPI.load(this.mPropertyBag).then(function(sResult) {
				var oArgs = oReorderStub.getCall(0).args[0];
				assert.strictEqual(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
				assert.strictEqual(oArgs.version, 1, "then the correct version is used");
				assert.strictEqual(oArgs.appId, "com.sap.test.app", "then correct reference is used");
				assert.strictEqual(sResult.adaptations.length, 0, "then the correct data length is returned");
				assert.deepEqual(sResult, {adaptations: []}, "then the correct data is returned");
			});
		});
	});

	QUnit.module("Given ContextBasedAdaptationsAPI.update is called", {
		before: function () {
			this.oAppComponent = {
				getManifest: function () {
					return {};
				},
				getManifestObject: function () {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId: function () {
					return "sComponentId";
				},
				getComponentData: function () {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach: function () {
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control(),
				contextBasedAdaptation: {},
				adaptationId: "id_12345"
			};
			stubSettings(sandbox);
			this.oOnAllChangesSavedStub = sandbox.stub(Versions, "onAllChangesSaved");
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when no control is provided", function (assert) {
			delete this.mPropertyBag.control;
			return ContextBasedAdaptationsAPI.update(this.mPropertyBag)
			.then(function() {
				assert.ok(false, "Should not succeed");
			})
			.catch(function (sError) {
				assert.equal(sError, "No control was provided", "then the correct error message is returned");
				assert.strictEqual(this.oOnAllChangesSavedStub.callCount, 0, "Versions.OnAllChangesSaved is not called");
			}.bind(this));
		});

		QUnit.test("when no layer is provided", function (assert) {
			delete this.mPropertyBag.layer;
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function () {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.update(this.mPropertyBag)
			.then(function() {
				assert.ok(false, "Should not succeed");
			})
			.catch(function (sError) {
				assert.equal(sError, "No layer was provided", "then the correct error message is returned");
				assert.strictEqual(this.oOnAllChangesSavedStub.callCount, 0, "Versions.OnAllChangesSaved is not called");
			}.bind(this));
		});

		QUnit.test("when no contextBasedAdaptation is provided", function (assert) {
			delete this.mPropertyBag.contextBasedAdaptation;
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function () {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.update(this.mPropertyBag)
			.then(function() {
				assert.ok(false, "Should not succeed");
			})
			.catch(function (sError) {
				assert.equal(sError, "No contextBasedAdaptation was provided", "then the correct error message is returned");
				assert.strictEqual(this.oOnAllChangesSavedStub.callCount, 0, "Versions.OnAllChangesSaved is not called");
			}.bind(this));
		});

		QUnit.test("when no adaptationId is provided", function (assert) {
			delete this.mPropertyBag.adaptationId;
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function () {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.update(this.mPropertyBag)
			.then(function() {
				assert.ok(false, "Should not succeed");
			})
			.catch(function (sError) {
				assert.equal(sError, "No adaptationId was provided", "then the correct error message is returned");
				assert.strictEqual(this.oOnAllChangesSavedStub.callCount, 0, "Versions.OnAllChangesSaved is not called");
			}.bind(this));
		});

		QUnit.test("when control, layer, property and adaptationId are provided", function (assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function () {
					return sActiveVersion;
				}
			});

			var oUpdateStub = sandbox.stub(Storage.contextBasedAdaptation, "update").resolves("Success");
			return ContextBasedAdaptationsAPI.update(this.mPropertyBag).then(function (sResult) {
				var oArgs = oUpdateStub.getCall(0).args[0];
				assert.deepEqual(oArgs.flexObjects, this.mPropertyBag.parameters, "then the correct parameters with priority list is used");
				assert.strictEqual(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
				assert.strictEqual(oArgs.parentVersion, 1, "then the correct version is used");
				assert.strictEqual(oArgs.adaptationId, "id_12345", "then the correct adaptation is used");
				assert.strictEqual(oArgs.appId, "com.sap.test.app", "then the correct appId is used");

				assert.strictEqual(this.oOnAllChangesSavedStub.callCount, 1, "Versions.OnAllChangesSaved is called");
				oArgs = this.oOnAllChangesSavedStub.getCall(0).args[0];
				assert.strictEqual(oArgs.reference, "com.sap.test.app", "then the correct reference is used");
				assert.strictEqual(oArgs.layer, Layer.CUSTOMER, "then the correct layer");
				assert.strictEqual(oArgs.contextBasedAdaptation, true, "then the correct contextBasedAdaptation flag is set");

				assert.strictEqual(sResult, "Success", "then the update was succesfull");
			}.bind(this));
		});
	});

	QUnit.module("Given ContextBasedAdaptationsAPI.remove is called", {
		before: function () {
			this.oAppComponent = {
				getManifest: function () {
					return {};
				},
				getManifestObject: function () {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId: function () {
					return "sComponentId";
				},
				getComponentData: function () {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach: function () {
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control(),
				contextBasedAdaptation: {},
				adaptationId: "id_12345"
			};
			stubSettings(sandbox);
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when no control is provided", function (assert) {
			delete this.mPropertyBag.control;
			return ContextBasedAdaptationsAPI.remove(this.mPropertyBag).catch(function (sError) {
				assert.equal(sError, "No control was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("when no layer is provided", function (assert) {
			delete this.mPropertyBag.layer;
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function () {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.remove(this.mPropertyBag).catch(function (sError) {
				assert.equal(sError, "No layer was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("when no adaptationId is provided", function (assert) {
			delete this.mPropertyBag.adaptationId;
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function () {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.remove(this.mPropertyBag).catch(function (sError) {
				assert.equal(sError, "No adaptationId was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("when control, layer, property and adaptationId are provided", function (assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function () {
					return sActiveVersion;
				}
			});

			this.updateModelFromBackendDone = false;
			var oVersionsUpdateModelBackend = sandbox.stub(Versions, "updateModelFromBackend").callsFake(function() {
				return new Promise(function(resolve) {
					setTimeout(function() {
						this.updateModelFromBackendDone = true;
						resolve();
					}.bind(this), 0);
				}.bind(this));
			}.bind(this));
			var oRemoveStub = sandbox.stub(Storage.contextBasedAdaptation, "remove").resolves({status: 204});
			return ContextBasedAdaptationsAPI.remove(this.mPropertyBag).then(function (sResult) {
				var oArgs = oRemoveStub.getCall(0).args[0];
				assert.deepEqual(oArgs.flexObjects, this.mPropertyBag.parameters, "then the correct parameters with priority list is used");
				assert.strictEqual(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
				assert.strictEqual(oArgs.parentVersion, 1, "then the correct version is used");
				assert.strictEqual(oArgs.adaptationId, "id_12345", "then the correct adaptation is used");
				assert.strictEqual(oArgs.appId, "com.sap.test.app", "then the correct appId is used");
				assert.strictEqual(sResult.status, 204, "then the remove was succesfull");
				var oVersionsArgs = oVersionsUpdateModelBackend.getCall(0).args[0];
				assert.deepEqual(oVersionsArgs.reference, "com.sap.test.app", "then the versions updateModelFromBackend is called with reference");
				assert.deepEqual(oVersionsArgs.layer, Layer.CUSTOMER, "then the versions updateModelFromBackend is called with layer");
				assert.ok(this.updateModelFromBackendDone, "Correct call order");
			}.bind(this));
		});
	});
});
