/* global QUnit */

sap.ui.define([
	"qunit/RtaQunitUtils",
	"sap/base/util/UriParameters",
	"sap/base/util/isEmptyObject",
	"sap/base/Log",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/base/Event",
	"sap/ui/base/EventProvider",
	"sap/ui/comp/smartform/Group",
	"sap/ui/comp/smartform/GroupElement",
	"sap/ui/comp/smartform/SmartForm",
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"sap/ui/dt/DesignTimeMetadata",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Overlay",
	"sap/ui/events/KeyCodes",
	"sap/ui/fl/apply/api/SmartVariantManagementApplyAPI",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/Stack",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/Core"
], function(
	RtaQunitUtils,
	UriParameters,
	isEmptyObject,
	Log,
	MessageBox,
	MessageToast,
	Event,
	EventProvider,
	Group,
	GroupElement,
	SmartForm,
	UIComponent,
	Device,
	DesignTimeMetadata,
	DesignTime,
	OverlayRegistry,
	Overlay,
	KeyCodes,
	SmartVariantManagementApplyAPI,
	FlexRuntimeInfoAPI,
	PersistenceWriteAPI,
	ChangesWriteAPI,
	VersionsAPI,
	Layer,
	Utils,
	QUnitUtils,
	AppVariantUtils,
	RtaAppVariantFeature,
	RTABaseCommand,
	CommandFactory,
	Stack,
	RuntimeAuthoring,
	RtaUtils,
	sinon,
	oCore
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oCompCont;
	var oComp;

	QUnit.config.fixture = null;

	var oComponentPromise = RtaQunitUtils.renderTestAppAtAsync("qunit-fixture")
		.then(function(oCompContainer) {
			oCompCont = oCompContainer;
			oComp = oCompCont.getComponentInstance();
		});

	function triggerKeydown(oTargetDomRef, iKeyCode, bShiftKey, bAltKey, bCtrlKey, bMetaKey) {
		var oParams = {};
		oParams.keyCode = iKeyCode;
		oParams.which = oParams.keyCode;
		oParams.shiftKey = bShiftKey;
		oParams.altKey = bAltKey;
		oParams.metaKey = bMetaKey;
		oParams.ctrlKey = bCtrlKey;
		QUnitUtils.triggerEvent("keydown", oTargetDomRef, oParams);
	}

	function cleanInfoSessionStorage() {
		var sFlexReference = FlexRuntimeInfoAPI.getFlexReference({element: oCompCont.getComponentInstance()});
		window.sessionStorage.removeItem("sap.ui.fl.info." + sFlexReference);
	}

	QUnit.module("Given that RuntimeAuthoring is available with a component as rootControl...", {
		before: function () {
			this.oTextResources = oCore.getLibraryResourceBundle("sap.ui.rta");
			return oComponentPromise;
		},
		beforeEach: function() {
			this.oFlexSettings = {
				layer: Layer.CUSTOMER,
				developerMode: true,
				qunitTestParameter: "qunitTestParameter"
			};
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp,
				flexSettings: this.oFlexSettings
			});

			this.oPreparePluginsSpy = sinon.spy(this.oRta.getPluginManager(), "preparePlugins");
			return RtaQunitUtils.clear()
			.then(this.oRta.start.bind(this.oRta))
			.then(function() {
				this.oRootControlOverlay = OverlayRegistry.getOverlay(oComp);
			}.bind(this));
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
			cleanInfoSessionStorage();
			return RtaQunitUtils.clear();
		}
	}, function() {
		QUnit.test("when RTA gets initialized and command stack is changed,", function(assert) {
			assert.ok(this.oRta, " then RuntimeAuthoring is created");
			assert.strictEqual(jQuery(".sapUiRtaToolbar").length, 1, "then Toolbar is visible.");
			assert.ok(this.oRootControlOverlay.$().css("z-index") < this.oRta.getToolbar().$().css("z-index"), "and the toolbar is in front of the root overlay");

			assert.equal(this.oRta.getToolbar().getControl("versionButton").getVisible(), false, "then the version label is hidden");
			assert.equal(this.oRta.getToolbar().getControl("activate").getVisible(), false, "then the activate draft Button is visible");
			assert.equal(this.oRta.getToolbar().getControl("discardDraft").getVisible(), false, "then the discard draft Button is visible");
			assert.equal(this.oRta.getToolbar().getControl("exit").getVisible(), true, "then the exit Button is visible");
			assert.equal(this.oRta.getToolbar().getControl("exit").getEnabled(), true, "then the exit Button is enabled");
			assert.equal(this.oRta.getToolbar().getControl("modeSwitcher").getVisible(), true, "then the modeSwitcher Button is visible");
			assert.equal(this.oRta.getToolbar().getControl("modeSwitcher").getEnabled(), true, "then the modeSwitcher Button is enabled");
			assert.equal(this.oRta.getToolbar().getControl("undo").getVisible(), true, "then the undo Button is visible");
			assert.equal(this.oRta.getToolbar().getControl("undo").getEnabled(), false, "then the undo Button is enabled");
			assert.equal(this.oRta.getToolbar().getControl("redo").getVisible(), true, "then the redo Button is visible");
			assert.equal(this.oRta.getToolbar().getControl("redo").getEnabled(), false, "then the redo Button is enabled");
			assert.equal(this.oRta.getToolbar().getControl("restore").getVisible(), true, "then the Restore Button is visible");
			assert.equal(this.oRta.getToolbar().getControl("restore").getEnabled(), false, "then the Restore Button is disabled");
			assert.equal(this.oRta.getToolbar().getControl("publish").getVisible(), false, "then the Publish Button is invisible");
			assert.equal(this.oRta.getToolbar().getControl("publish").getEnabled(), false, "then the Publish Button is disabled");
			assert.equal(this.oRta.getToolbar().getControl("manageApps").getVisible(), false, "then the 'AppVariant Overview' Icon Button is not visible");
			assert.equal(this.oRta.getToolbar().getControl("manageApps").getEnabled(), false, "then the 'AppVariant Overview' Icon Button is not enabled");
			assert.equal(this.oRta.getToolbar().getControl("appVariantOverview").getVisible(), false, "then the 'AppVariant Overview' Menu Button is not visible");
			assert.equal(this.oRta.getToolbar().getControl("appVariantOverview").getEnabled(), false, "then the 'AppVariant Overview' Menu Button is not enabled");
			assert.equal(this.oRta.getToolbar().getControl("saveAs").getVisible(), false, "then the saveAs Button is not visible");
			assert.equal(this.oRta.getToolbar().getControl("saveAs").getEnabled(), false, "then the saveAs Button is not enabled");

			var oExpectedSettings = {
				flexSettings: this.oFlexSettings,
				rootControl: this.oRta.getRootControlInstance(),
				commandStack: this.oRta.getCommandStack()
			};
			assert.deepEqual(this.oRta.getToolbar().getRtaInformation(), oExpectedSettings, "the rta settings were passed to the toolbar");

			var oInitialCommandStack = this.oRta.getCommandStack();
			assert.ok(oInitialCommandStack, "the command stack is automatically created");
			this.oRta.setCommandStack(new Stack());
			var oNewCommandStack = this.oRta.getCommandStack();
			assert.notEqual(oInitialCommandStack, oNewCommandStack, "rta getCommandStack returns new command stack");
		});

		QUnit.test("when RTA is stopped and destroyed, the default plugins get created and destroyed", function(assert) {
			var done = assert.async();

			assert.equal(this.oPreparePluginsSpy.callCount, 1, " and getPluginManager.preparePlugins() have been called 1 time on oRta.start()");
			assert.ok(!isEmptyObject(this.oRta.getPlugins()), "then plugins are created on start");

			this.oRta.attachStop(function() {
				assert.ok(true, "the 'stop' event was fired");

				this.oRta.destroy();
				assert.strictEqual(jQuery(".sapUiRtaToolbar").length, 0, "... and Toolbar is destroyed.");
				done();
			}.bind(this));
			this.oRta.stop().then(function() {
				assert.ok(true, "then the promise got resolved");
			});
		});

		QUnit.test("when Mode is changed from adaptation to navigation and back to adaptation", function(assert) {
			var oTabhandlingPlugin = this.oRta.getPlugins()["tabHandling"];
			var oTabHandlingRemoveSpy = sandbox.spy(oTabhandlingPlugin, "removeTabIndex");
			var oTabHandlingRestoreSpy = sandbox.spy(oTabhandlingPlugin, "restoreTabIndex");
			var oTabHandlingRemoveOverlaySpy = sandbox.spy(oTabhandlingPlugin, "removeOverlayTabIndex");
			var oTabHandlingRestoreOverlaySpy = sandbox.spy(oTabhandlingPlugin, "restoreOverlayTabIndex");
			var oFireModeChangedSpy = sandbox.stub(this.oRta, "fireModeChanged");

			this.oRta.setMode("navigation");
			assert.notOk(this.oRta._oDesignTime.getEnabled(), " in navigation mode the designTime property enabled is false");
			assert.equal(oTabHandlingRestoreSpy.callCount, 1, "restoreTabIndex was called");
			assert.equal(oTabHandlingRemoveOverlaySpy.callCount, 1, "removeOverlayTabIndex was called");
			assert.equal(oFireModeChangedSpy.callCount, 1, "the event ModeChanged was fired");
			assert.deepEqual(oFireModeChangedSpy.lastCall.args[0], {mode: "navigation"}, "the argument of the event is correct");

			// simulate mode change from toolbar
			this.oRta.getToolbar().fireModeChange({item: { getKey: function() {return "adaptation";}}});
			assert.ok(this.oRta._oDesignTime.getEnabled(), "in adaption mode the designTime property enabled is true again");
			assert.equal(oTabHandlingRemoveSpy.callCount, 1, "removeTabIndex was called");
			assert.equal(oTabHandlingRestoreOverlaySpy.callCount, 1, "restoreOverlayTabIndex was called");
			assert.equal(oFireModeChangedSpy.callCount, 2, "the event ModeChanged was fired again");
			assert.deepEqual(oFireModeChangedSpy.lastCall.args[0], {mode: "adaptation"}, "the argument of the event is correct");
		});

		QUnit.test("when Mode is changed from adaptation to visualization and back to adaptation", function(assert) {
			var oTabhandlingPlugin = this.oRta.getPlugins()["tabHandling"];
			var oTabHandlingRemoveSpy = sandbox.spy(oTabhandlingPlugin, "removeTabIndex");
			var oTabHandlingRestoreSpy = sandbox.spy(oTabhandlingPlugin, "restoreTabIndex");
			var oTabHandlingRemoveOverlaySpy = sandbox.spy(oTabhandlingPlugin, "removeOverlayTabIndex");
			var oTabHandlingRestoreOverlaySpy = sandbox.spy(oTabhandlingPlugin, "restoreOverlayTabIndex");
			var oFireModeChangedSpy = sandbox.stub(this.oRta, "fireModeChanged");

			this.oRta.setMode("visualization");
			assert.ok(this.oRta._oDesignTime.getEnabled(), "in visualization mode the designTime property enabled is true");
			assert.equal(oTabHandlingRestoreSpy.callCount, 0, "restoreTabIndex was not called");
			assert.equal(oTabHandlingRemoveOverlaySpy.callCount, 1, "removeOverlayTabIndex was called");
			assert.equal(oFireModeChangedSpy.callCount, 1, "the event ModeChanged was fired");
			assert.deepEqual(oFireModeChangedSpy.lastCall.args[0], {mode: "visualization"}, "the argument of the event is correct");
			assert.equal(jQuery(".sapUiDtOverlayMovable").css("cursor"), "default", "the movable overlays switched to the default cursor");

			// simulate mode change from toolbar
			this.oRta.getToolbar().fireModeChange({item: { getKey: function() {return "adaptation";}}});
			assert.ok(this.oRta._oDesignTime.getEnabled(), "in adaption mode the designTime property enabled is true");
			assert.equal(oTabHandlingRemoveSpy.callCount, 0, "removeTabIndex was not called");
			assert.equal(oTabHandlingRestoreOverlaySpy.callCount, 1, "restoreOverlayTabIndex was called");
			assert.equal(oFireModeChangedSpy.callCount, 2, "the event ModeChanged was fired again");
			assert.deepEqual(oFireModeChangedSpy.lastCall.args[0], {mode: "adaptation"}, "the argument of the event is correct");
			assert.equal(jQuery(".sapUiDtOverlayMovable").css("cursor"), "move", "the movable overlays switched back to the move cursor");
		});

		QUnit.test("when Mode is changed from visualizaton to navigation and back to visualization", function(assert) {
			this.oRta.setMode("visualization");
			var oTabhandlingPlugin = this.oRta.getPlugins()["tabHandling"];
			var oTabHandlingRemoveSpy = sandbox.spy(oTabhandlingPlugin, "removeTabIndex");
			var oTabHandlingRestoreSpy = sandbox.spy(oTabhandlingPlugin, "restoreTabIndex");
			var oTabHandlingRemoveOverlaySpy = sandbox.spy(oTabhandlingPlugin, "removeOverlayTabIndex");
			var oTabHandlingRestoreOverlaySpy = sandbox.spy(oTabhandlingPlugin, "restoreOverlayTabIndex");
			var oFireModeChangedSpy = sandbox.stub(this.oRta, "fireModeChanged");
			assert.equal(jQuery(".sapUiDtOverlayMovable").css("cursor"), "default", "the movable overlays switched to the default cursor");

			this.oRta.setMode("navigation");
			assert.notOk(this.oRta._oDesignTime.getEnabled(), " in navigation mode the designTime property enabled is false");
			assert.equal(oTabHandlingRestoreSpy.callCount, 1, "restoreTabIndex was called");
			assert.equal(oTabHandlingRemoveOverlaySpy.callCount, 1, "removeOverlayTabIndex was called");
			assert.equal(oFireModeChangedSpy.callCount, 1, "the event ModeChanged was fired");
			assert.deepEqual(oFireModeChangedSpy.lastCall.args[0], {mode: "navigation"}, "the argument of the event is correct");
			assert.equal(jQuery(".sapUiDtOverlayMovable").css("cursor"), "move", "the movable overlays back to the move cursor");

			// simulate mode change from toolbar
			this.oRta.getToolbar().fireModeChange({item: { getKey: function() {return "visualization";}}});
			assert.ok(this.oRta._oDesignTime.getEnabled(), "in visualization mode the designTime property enabled is true again");
			assert.equal(oTabHandlingRemoveSpy.callCount, 1, "removeTabIndex was called");
			assert.equal(oTabHandlingRestoreOverlaySpy.callCount, 0, "restoreOverlayTabIndex was not called");
			assert.equal(oFireModeChangedSpy.callCount, 2, "the event ModeChanged was fired again");
			assert.deepEqual(oFireModeChangedSpy.lastCall.args[0], {mode: "visualization"}, "the argument of the event is correct");
			assert.equal(jQuery(".sapUiDtOverlayMovable").css("cursor"), "default", "the movable overlays switched again to the default cursor");
		});

		QUnit.test("when navigation mode is entered multiple times", function(assert) {
			var oMessageToastSpy = sandbox.stub(MessageToast, "show");
			this.oRta.setMode("navigation");
			this.oRta.setMode("adaptation");
			this.oRta.setMode("navigation");
			var sExpectedErrorMessage = this.oTextResources.getText("MSG_NAVIGATION_MODE_CHANGES_WARNING");
			assert.ok(oMessageToastSpy.calledOnceWith(sExpectedErrorMessage), "then a warning is shown once");
		});
	});

	QUnit.module("Given a USER layer change", {
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function() {
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp
			});
			sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").resolves({
				isResetEnabled: true,
				isPublishEnabled: false,
				allContextsProvided: true
			});

			return RtaQunitUtils.clear();
		},
		afterEach: function() {
			cleanInfoSessionStorage();
			this.oRta.destroy();
			sandbox.restore();
			return RtaQunitUtils.clear();
		}
	}, function() {
		QUnit.test("when RTA is started and stopped in the user layer", function(assert) {
			var done = assert.async();
			this.oRta.setFlexSettings({layer: Layer.USER});
			var oHandleReloadOnExitSpy = sandbox.spy(this.oRta, "_handleReloadOnExit");

			this.oRta.attachStop(function() {
				assert.ok(oHandleReloadOnExitSpy.lastCall.args[0], true, "Boolean to skip the reload was passed");
				done();
			});

			this.oRta.start()
			.then(function() {
				assert.equal(this.oRta.getToolbar().getControl("restore").getVisible(), true, "then the Restore Button is visible");
				assert.equal(this.oRta.getToolbar().getControl("restore").getEnabled(), true, "then the Restore Button is enabled");
				assert.equal(this.oRta.getToolbar().getControl("exit").getVisible(), true, "then the Exit Button is visible");
				assert.equal(this.oRta.getToolbar().getControl("exit").getEnabled(), true, "then the Exit Button is enabled");

				var oExpectedSettings = {
					flexSettings: {
						layer: Layer.USER,
						developerMode: true
					},
					rootControl: this.oRta.getRootControlInstance(),
					commandStack: this.oRta.getCommandStack()
				};
				assert.deepEqual(this.oRta.getToolbar().getRtaInformation(), oExpectedSettings, "the rta settings were passed to the toolbar");
			}.bind(this))
			.then(function() {
				this.oRta.getToolbar().getControl("exit").firePress();
			}.bind(this));
		});

		QUnit.test("when RTA is initializes versioning in the customer layer, the versioning is not available", function(assert) {
			return this.oRta._initVersioning()
			.then(function () {
				this.oRta._oVersionsModel.setProperty("/versioningEnabled", false);
				assert.equal(this.oRta._isDraftAvailable(), false, "then the 'isDraftAvailable' is false");
			}.bind(this));
		});

		QUnit.test("when RTA is initializes versioning in the customer layer, the versioning is available, draft is available", function(assert) {
			return this.oRta._initVersioning()
			.then(function () {
				this.oRta._oVersionsModel.setProperty("/versioningEnabled", true);
				var oDraftAvailableStub = sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);
				var oPropertyBag = {
					selector: oCompCont.getComponentInstance(),
					layer: Layer.CUSTOMER
				};

				assert.equal(this.oRta._isDraftAvailable(), true, "then the 'isDraftAvailable' is true");
				assert.deepEqual(oDraftAvailableStub.lastCall.args[0], oPropertyBag, "and the property bag was set correctly");
			}.bind(this));
		});

		QUnit.test("when RTA is initializes versioning in the customer layer, and no uShell is available", function(assert) {
			var oDraftAvailableStub = sandbox.stub(VersionsAPI, "isDraftAvailable");
			sandbox.stub(Utils, "getUshellContainer").returns(undefined);

			return this.oRta._initVersioning()
				.then(function() {
					assert.equal(this.oRta._oVersionsModel.getProperty("/versioningEnabled"), false, "then the 'versioningEnabled' is false");
					assert.deepEqual(oDraftAvailableStub.callCount, 0, "and the draft available was not checked");
				}.bind(this));
		});

		QUnit.test("when RTA is initializes versioning in the customer layer, the versioning is available, draft is not available, no changes yet done", function(assert) {
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(false);
			sandbox.stub(this.oRta, "canUndo").returns(false);
			return this.oRta._initVersioning()
			.then(function () {
				this.oRta._oVersionsModel.setProperty("/versioningEnabled", true);
				assert.equal(this.oRta._isDraftAvailable(), false, "then the 'isDraftAvailable' is false");
			}.bind(this));
		});

		QUnit.test("when RTA is initializes versioning in the customer layer, the versioning is available, draft is not available, there are unsaved changes", function(assert) {
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(false);
			sandbox.stub(this.oRta, "canUndo").returns(true);

			return this.oRta._initVersioning()
			.then(function () {
				this.oRta._oVersionsModel.setProperty("/versioningEnabled", true);
				assert.equal(this.oRta._isDraftAvailable(), false, "then the 'isDraftAvailable' is false");
			}.bind(this));
		});

		QUnit.test("when RTA is started in the customer layer, app variant feature is available for a (key user) but the manifest of an app is not supported", function(assert) {
			sandbox.stub(this.oRta, "_getToolbarButtonsVisibility").returns(Promise.resolve({
				publishAvailable: true,
				saveAsAvailable: true,
				draftAvailable: false
			}));
			sandbox.stub(AppVariantUtils, "getManifirstSupport").returns(Promise.resolve({response: false}));
			sandbox.stub(Utils, "getAppDescriptor").returns({"sap.app": {id: "1"}});

			return this.oRta.start()
			.then(function() {
				assert.equal(this.oRta.getToolbar().getControl("manageApps").getVisible(), true, "then the 'AppVariant Overview' Icon Button is visible");
				assert.equal(this.oRta.getToolbar().getControl("manageApps").getEnabled(), false, "then the 'AppVariant Overview' Icon Button is not enabled");
				assert.equal(this.oRta.getToolbar().getControl("appVariantOverview").getVisible(), false, "then the 'AppVariant Overview' Menu Button is not visible");
				assert.equal(this.oRta.getToolbar().getControl("appVariantOverview").getEnabled(), false, "then the 'AppVariant Overview' Menu Button is not enabled");
				assert.equal(this.oRta.getToolbar().getControl("saveAs").getVisible(), true, "then the 'Save As' Button is visible");
				assert.equal(this.oRta.getToolbar().getControl("manageApps").getEnabled(), false, "then the 'Save As' Button is not enabled");
			}.bind(this));
		});

		QUnit.test("when RTA is started in the customer layer, app variant feature is available for an (SAP developer) but the manifest of an app is not supported", function(assert) {
			sandbox.stub(this.oRta, "_getToolbarButtonsVisibility").returns(Promise.resolve({
				publishAvailable: true,
				saveAsAvailable: true,
				draftAvailable: false
			 }));
			sandbox.stub(RtaAppVariantFeature, "isOverviewExtended").returns(true);
			sandbox.stub(RtaAppVariantFeature, "isManifestSupported").resolves(false);

			return this.oRta.start()
			.then(function() {
				assert.equal(this.oRta.getToolbar().getControl("manageApps").getVisible(), false, "then the 'AppVariant Overview' Icon Button is not visible");
				assert.equal(this.oRta.getToolbar().getControl("manageApps").getEnabled(), false, "then the 'AppVariant Overview' Icon Button is not enabled");
				assert.equal(this.oRta.getToolbar().getControl("appVariantOverview").getVisible(), true, "then the 'AppVariant Overview' Menu Button is visible");
				assert.equal(this.oRta.getToolbar().getControl("appVariantOverview").getEnabled(), false, "then the 'AppVariant Overview' Menu Button is not enabled");
				assert.equal(this.oRta.getToolbar().getControl("saveAs").getVisible(), true, "then the 'Save As' Button is visible");
				assert.equal(this.oRta.getToolbar().getControl("manageApps").getEnabled(), false, "then the 'Save As' Button is not enabled");
			}.bind(this));
		});
	});

	QUnit.module("Given that RuntimeAuthoring is started without toolbar...", {
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function() {
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp,
				showToolbars: false
			});

			return RtaQunitUtils.clear()
			.then(this.oRta.start.bind(this.oRta));
		},
		afterEach: function() {
			cleanInfoSessionStorage();
			this.oRta.destroy();
			sandbox.restore();
			return RtaQunitUtils.clear();
		}
	}, function() {
		QUnit.test("when RTA gets initialized,", function(assert) {
			assert.ok(this.oRta, " then RuntimeAuthoring is created");
			assert.strictEqual(jQuery(".sapUiRtaToolbar").length, 0, "then Toolbar is not visible.");
		});
	});

	QUnit.module("Undo/Redo functionality", {
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function() {
			this.bMacintoshOriginal = Device.os.macintosh;
			Device.os.macintosh = false;

			this.fnUndoStub = sandbox.stub().returns(Promise.resolve());
			this.fnRedoStub = sandbox.stub().returns(Promise.resolve());

			this.oToolbarDomRef = jQuery("<input>").appendTo("#qunit-fixture").get(0);
			this.oOverlayContainer = jQuery("<button></button>").appendTo("#qunit-fixture");
			this.oAnyOtherDomRef = jQuery("<button></button>").appendTo("#qunit-fixture").get(0);
			this.oContextMenu = jQuery('<button class="sapUiDtContextMenu" ></button>').appendTo("#qunit-fixture").get(0);
			this.oContextMenu2 = jQuery('<button class="sapUiDtContextMenu" ></button>').appendTo("#qunit-fixture").get(0);

			this.oUndoEvent = new Event("dummyEvent", new EventProvider());
			this.oUndoEvent.keyCode = KeyCodes.Z;
			this.oUndoEvent.ctrlKey = true;
			this.oUndoEvent.shiftKey = false;
			this.oUndoEvent.altKey = false;
			this.oUndoEvent.stopPropagation = function() {};

			this.oRedoEvent = new Event("dummyEvent", new EventProvider());
			this.oRedoEvent.keyCode = KeyCodes.Y;
			this.oRedoEvent.ctrlKey = true;
			this.oRedoEvent.shiftKey = false;
			this.oRedoEvent.altKey = false;
			this.oRedoEvent.stopPropagation = function() {};

			sandbox.stub(Overlay, "getOverlayContainer").returns(this.oOverlayContainer);

			this.mContext = {
				getToolbar: function () {
					return {
						getDomRef: function() {
							return this.oToolbarDomRef;
						}.bind(this)
					};
				}.bind(this),
				getShowToolbars: function () {
					return true;
				},
				_onUndo: this.fnUndoStub,
				_onRedo: this.fnRedoStub
			};
		},

		afterEach: function() {
			cleanInfoSessionStorage();
			sandbox.restore();
			Device.os.macintosh = this.bMacintoshOriginal;
		}
	}, function() {
		QUnit.test("with focus on an overlay", function(assert) {
			this.oOverlayContainer.get(0).focus();

			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
			assert.equal(this.fnUndoStub.callCount, 1, "then _onUndo was called once");
			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
			assert.equal(this.fnRedoStub.callCount, 1, "then _onRedo was called once");
		});

		QUnit.test("with focus on the toolbar", function(assert) {
			this.oToolbarDomRef.focus();

			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
			assert.equal(this.fnUndoStub.callCount, 1, "then _onUndo was called once");
			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
			assert.equal(this.fnRedoStub.callCount, 1, "then _onRedo was called once");
		});

		QUnit.test("with focus on the context menu", function(assert) {
			this.oContextMenu.focus();

			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
			assert.equal(this.fnUndoStub.callCount, 1, "then _onUndo was called once");
			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
			assert.equal(this.fnRedoStub.callCount, 1, "then _onRedo was called once");

			this.oContextMenu2.focus();

			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
			assert.equal(this.fnUndoStub.callCount, 2, "then _onUndo was called once again");
			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
			assert.equal(this.fnRedoStub.callCount, 2, "then _onRedo was called once again");
		});

		QUnit.test("with focus on an outside element (e.g. dialog)", function(assert) {
			this.oAnyOtherDomRef.focus();

			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
			assert.equal(this.fnUndoStub.callCount, 0, "then _onUndo was not called");
			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
			assert.equal(this.fnRedoStub.callCount, 0, "then _onRedo was not called");
		});

		QUnit.test("during rename", function(assert) {
			jQuery("<div></div>", {
				"class": "sapUiRtaEditableField",
				tabIndex: 1
			}).appendTo("#qunit-fixture").get(0).focus();

			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
			assert.equal(this.fnUndoStub.callCount, 0, "then _onUndo was not called");
			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
			assert.equal(this.fnRedoStub.callCount, 0, "then _onRedo was not called");
		});

		QUnit.test("using the public API", function(assert) {
			RuntimeAuthoring.prototype.undo.call(this.mContext);
			assert.equal(this.fnUndoStub.callCount, 1, "then _onUndo was called");
			RuntimeAuthoring.prototype.redo.call(this.mContext);
			assert.equal(this.fnRedoStub.callCount, 1, "then _onRedo was called");
		});

		QUnit.test("macintosh support", function(assert) {
			Device.os.macintosh = true;
			this.oUndoEvent.ctrlKey = false;
			this.oUndoEvent.metaKey = true;

			this.oOverlayContainer.get(0).focus();
			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
			assert.equal(this.fnUndoStub.callCount, 1, "then _onUndo was called once");

			this.oRedoEvent.keyCode = KeyCodes.Z;
			this.oRedoEvent.ctrlKey = false;
			this.oRedoEvent.metaKey = true;
			this.oRedoEvent.shiftKey = true;

			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
			assert.equal(this.fnRedoStub.callCount, 1, "then _onRedo was called once");
		});
	});

	QUnit.module("Given a test app..", {
		before: function () {
			return oComponentPromise;
		},
		afterEach: function() {
			cleanInfoSessionStorage();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when enabling restart", function(assert) {
			var sComponentId = "restartingComponent";
			var oComponent = RtaQunitUtils.createAndStubAppComponent(sandbox, sComponentId);
			var sLayer = "LAYER";
			RuntimeAuthoring.enableRestart(sLayer, {});
			var sRestartingComponent = window.sessionStorage.getItem("sap.ui.rta.restart." + sLayer);
			assert.ok(RuntimeAuthoring.needsRestart(sLayer), "then restart is needed");
			assert.equal(sRestartingComponent, sComponentId + ".Component", "and the component ID is set with an added .Component");
			oComponent.destroy();
		});

		QUnit.test("when enabling and disabling restart", function(assert) {
			var sLayer = "LAYER";
			RuntimeAuthoring.enableRestart(sLayer);
			RuntimeAuthoring.enableRestart(sLayer);
			RuntimeAuthoring.enableRestart(sLayer);

			RuntimeAuthoring.disableRestart(sLayer);

			assert.notOk(RuntimeAuthoring.needsRestart(sLayer), "then restart is not needed");
		});

		QUnit.test("when destroying RuntimeAuthoring after the rootControl of the UI Component was already destroyed", function(assert) {
			var oUiComponent = new UIComponent();
			var oRuntimeAuthoring = new RuntimeAuthoring({
				rootControl: oUiComponent
			});
			oRuntimeAuthoring.destroy();
			assert.ok(true, "the function does not throw an error");

			oUiComponent.destroy();
		});
	});

	QUnit.module("Given that RuntimeAuthoring based on test-view is available together with a CommandStack with changes...", {
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function(assert) {
			var fnDone = assert.async();

			sandbox.stub(ChangesWriteAPI, "getChangeHandler").resolves();

			// Prepare elements an designtime
			var oElement1 = oCore.byId("Comp1---idMain1--GeneralLedgerDocument.Name");
			var oElement2 = oCore.byId("Comp1---idMain1--GeneralLedgerDocument.CompanyCode");
			this.oGroupElementDesignTimeMetadata = new DesignTimeMetadata({
				data: {
					actions: {
						remove: {
							changeType: "hideControl"
						}
					}
				}
			});
			// Create commmands
			var oCommandFactory = new CommandFactory();
			oCommandFactory.getCommandFor(oElement1, "Remove", {
				removedElement: oElement1
			}, this.oGroupElementDesignTimeMetadata)

			.then(function(oRemoveCommand) {
				this.oRemoveCommand = oRemoveCommand;
				this.oCommandStack = new Stack();
				// Start RTA with command stack
				var oRootControl = oComp.getAggregation("rootControl");
				this.oRta = new RuntimeAuthoring({
					rootControl: oRootControl,
					commandStack: this.oCommandStack,
					showToolbars: true,
					flexSettings: {
						developerMode: false
					}
				});
				return RtaQunitUtils.clear()
					.then(this.oRta.start.bind(this.oRta))
					.then(function() {
						this.oRootControlOverlay = OverlayRegistry.getOverlay(oRootControl);
						this.oElement2Overlay = OverlayRegistry.getOverlay(oElement2);
						this.oCommandStack.pushAndExecute(oRemoveCommand);
					}.bind(this))
					.then(fnDone)
					.catch(function (oError) {
						assert.ok(false, "catch must never be called - Error: " + oError);
					});
			}.bind(this));
		},
		afterEach: function() {
			cleanInfoSessionStorage();
			sandbox.restore();
			this.oRemoveCommand.destroy();
			this.oCommandStack.destroy();
			this.oRta.destroy();
			return RtaQunitUtils.clear();
		}
	}, function() {
		QUnit.test("when cut is triggered by keydown-event on rootElementOverlay, with macintosh device and metaKey is pushed", function(assert) {
			var done = assert.async();
			var bMacintoshOriginal;
			var fnStackModifiedSpy = sinon.spy(function() {
				if (fnStackModifiedSpy.calledOnce) {
					assert.equal(this.oCommandStack.getAllExecutedCommands().length, 0, "after CMD + Z the stack is empty");
					//redo -> execute -> fireModified (inside promise)
					triggerKeydown(this.oElement2Overlay.getDomRef(), KeyCodes.Z, true, false, false, true);
				} else if (fnStackModifiedSpy.calledTwice) {
					assert.equal(this.oCommandStack.getAllExecutedCommands().length, 1, "after CMD + SHIFT + Z is again 1 command in the stack");
					Device.os.macintosh = bMacintoshOriginal;
					done();
				}
			}.bind(this));
			this.oCommandStack.attachModified(fnStackModifiedSpy);
			bMacintoshOriginal = Device.os.macintosh;
			Device.os.macintosh = true;
			assert.equal(this.oCommandStack.getAllExecutedCommands().length, 1, "1 commands is still in the stack");

			//undo -> _unExecute -> fireModified
			document.activeElement.blur(); // reset focus to body
			triggerKeydown(this.oRootControlOverlay.getDomRef(), KeyCodes.Z, false, false, false, true);
		});

		QUnit.test("when cut is triggered by keydown-event on rootElementOverlay, with no macintosh device and ctrlKey is pushed", function(assert) {
			var done = assert.async();
			var bMacintoshOriginal;
			var fnStackModifiedSpy = sinon.spy(function() {
				if (fnStackModifiedSpy.calledOnce) {
					assert.equal(this.oCommandStack.getAllExecutedCommands().length, 0, "after CTRL + Z the stack is empty");
					//redo -> execute -> fireModified (inside promise)
					triggerKeydown(this.oElement2Overlay.getDomRef(), KeyCodes.Y, false, false, true, false);
				} else if (fnStackModifiedSpy.calledTwice) {
					assert.equal(this.oCommandStack.getAllExecutedCommands().length, 1, "after CTRL + Y is again 1 command in the stack");
					Device.os.macintosh = bMacintoshOriginal;
					done();
				}
			}.bind(this));
			this.oCommandStack.attachModified(fnStackModifiedSpy);
			bMacintoshOriginal = Device.os.macintosh;
			Device.os.macintosh = false;
			assert.equal(this.oCommandStack.getAllExecutedCommands().length, 1, "1 commands is still in the stack");

			//undo -> _unExecute -> fireModified
			document.activeElement.blur(); // reset focus to body
			triggerKeydown(this.oRootControlOverlay.getDomRef(), KeyCodes.Z, false, false, true, false);
		});

		QUnit.test("when _handleElementModified is called if a create container command was executed on a simple form", function(assert) {
			var done = assert.async();
			var fnFireElementModifiedSpy = sandbox.spy(this.oRta.getPluginManager().getDefaultPlugins()["createContainer"], "fireElementModified");

			var oSimpleForm = oCore.byId("Comp1---idMain1--SimpleForm");
			var oSimpleFormOverlay = OverlayRegistry.getOverlay(oSimpleForm.getAggregation("form").getId());

			sandbox.stub(this.oRta.getPluginManager().getDefaultPlugins()["rename"], "startEdit").callsFake(function (oNewContainerOverlay) {
				oCore.applyChanges();
				var oArgs = fnFireElementModifiedSpy.getCall(0).args[0];
				var sNewControlContainerId = this.oRta.getPluginManager().getDefaultPlugins()["createContainer"].getCreatedContainerId(oArgs.action, oArgs.newControlId);
				assert.ok(fnFireElementModifiedSpy.calledOnce, "then 'fireElementModified' from the createContainer plugin is called once");
				assert.ok(true, "then the new container starts the edit for rename");
				assert.strictEqual(oNewContainerOverlay.getElement().getId(), sNewControlContainerId, "then rename is called with the new container's overlay");
				assert.ok(oNewContainerOverlay.isSelected(), "then the new container is selected");
				this.oCommandStack.undo().then(done);
			}.bind(this));

			this.oRta.getPlugins()["createContainer"].handleCreate(false, oSimpleFormOverlay);
			oCore.applyChanges();
		});

		QUnit.test("when _handleElementModified is called if a create container command was executed on a smart form", function(assert) {
			var done = assert.async();

			var fnFireElementModifiedSpy = sinon.spy(this.oRta.getPluginManager().getDefaultPlugins()["createContainer"], "fireElementModified");

			var oSmartForm = oCore.byId("Comp1---idMain1--MainForm");
			var oSmartFormOverlay = OverlayRegistry.getOverlay(oSmartForm.getId());

			sandbox.stub(this.oRta.getPlugins()["rename"], "startEdit").callsFake(function (oNewContainerOverlay) {
				var oArgs = fnFireElementModifiedSpy.getCall(0).args[0];
				var sNewControlContainerId = this.oRta.getPluginManager().getDefaultPlugins()["createContainer"].getCreatedContainerId(oArgs.action, oArgs.newControlId);
				oCore.applyChanges();
				assert.ok(true, "then the new container starts the edit for rename");
				assert.strictEqual(oNewContainerOverlay.getElement().getId(), sNewControlContainerId, "then rename is called with the new container's overlay");
				assert.ok(oNewContainerOverlay.isSelected(), "then the new container is selected");
				this.oCommandStack.undo().then(done);
			}.bind(this));

			this.oRta.getPlugins()["createContainer"].handleCreate(false, oSmartFormOverlay);
			oCore.applyChanges();
		});

		QUnit.test("when _handleElementModified is called if a create container command was executed on an empty form", function(assert) {
			var done = assert.async();

			// An existing empty Form is used for the test
			var oForm = oCore.byId("Comp1---idMain1--MainForm1");
			var oFormOverlay = OverlayRegistry.getOverlay(oForm.getId());

			sandbox.stub(this.oRta.getPlugins()["rename"], "startEdit").callsFake(function (oNewContainerOverlay) {
				oCore.applyChanges();
				assert.ok(oNewContainerOverlay.isSelected(), "then the new container is selected");
				assert.ok(true, "then the new container starts the edit for rename");
				this.oCommandStack.undo().then(done);
			}.bind(this));

			this.oRta.getPlugins()["createContainer"].handleCreate(false, oFormOverlay);
			oCore.applyChanges();
		});

		QUnit.test("when trying to stop rta with error in saving changes,", function(assert) {
			var fnStubSerialize = function() {
				return Promise.reject();
			};
			sandbox.stub(this.oRta, "_serializeToLrep").callsFake(fnStubSerialize);

			return this.oRta.stop(false).catch(function() {
				assert.ok(true, "then the promise got rejected");
				assert.ok(this.oRta, "RTA is still up and running");
				assert.equal(this.oCommandStack.getAllExecutedCommands().length, 1, "1 command is still in the stack");
				assert.strictEqual(jQuery(".sapUiRtaToolbar:visible").length, 1, "and the Toolbar is visible.");
			}.bind(this));
		});

		QUnit.test("when stopping rta without saving changes,", function(assert) {
			return this.oRta.stop(true)
				.then(function() {
					assert.ok(true, "then the promise got resolved");
					assert.equal(this.oCommandStack.getAllExecutedCommands().length, 1, "1 command is still in the stack");
				}.bind(this))
				.then(RtaQunitUtils.getNumberOfChangesForTestApp)
				.then(function (iNumOfChanges) {
					assert.equal(iNumOfChanges, 0, "there is no change written");
				});
		});

		QUnit.test("when stopping rta with saving changes", function(assert) {
			var oSaveSpy = sandbox.spy(PersistenceWriteAPI, "save");

			return this.oRta.stop()
				.then(function() {
					var oSavePropertyBag = oSaveSpy.getCall(0).args[0];
					assert.ok(oSavePropertyBag.removeOtherLayerChanges, "then removeOtherLayerChanges is set to true");
					assert.strictEqual(oSavePropertyBag.layer, this.oRta.getLayer(), "then the layer is properly passed along");
				}.bind(this))
				.then(RtaQunitUtils.getNumberOfChangesForTestApp)
				.then(function(iNumberOfChanges) {
					assert.strictEqual(iNumberOfChanges, 1, "then the change is written");
				});
		});

		QUnit.test("when stopping rta with saving changes and versioning is disabled", function(assert) {
			var oSaveStub = sandbox.stub(PersistenceWriteAPI, "save").resolves();

			return this.oRta._serializeToLrep()
			.then(function () {
				assert.equal(oSaveStub.callCount, 1, "save was triggered");
				var aSavePropertyBag = oSaveStub.getCall(0).args[0];
				assert.equal(aSavePropertyBag.draft, false, "the draft flag is set to false");
			});
		});

		QUnit.test("when stopping rta with saving changes and versioning is enabled", function(assert) {
			this.oRta._oVersionsModel.setProperty("/versioningEnabled", true);

			var oSaveStub = sandbox.stub(PersistenceWriteAPI, "save").resolves();

			return this.oRta._serializeToLrep()
			.then(function () {
				assert.equal(oSaveStub.callCount, 1, "save was triggered");
				var aSavePropertyBag = oSaveStub.getCall(0).args[0];
				assert.equal(aSavePropertyBag.draft, true, "the draft flag is set to true");
			});
		});

		QUnit.test("When transport function is called and transportChanges returns Promise.resolve() when the running application is not an application variant", function(assert) {
			sandbox.stub(PersistenceWriteAPI, "publish").resolves();
			var fnGetResetAndPublishInfoStub = sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").resolves({
				isPublishEnabled: false,
				isResetEnabled: true
			});
			var oMessageToastStub = sandbox.stub(MessageToast, "show");
			var oAppVariantRunningStub = sandbox.stub(SmartVariantManagementApplyAPI, "isApplicationVariant").returns(false);
			return this.oRta.transport().then(function() {
				assert.equal(oMessageToastStub.callCount, 1, "then the messageToast was shown");
				assert.equal(oAppVariantRunningStub.callCount, 1, "then isApplicationVariant() got called");
				assert.equal(fnGetResetAndPublishInfoStub.callCount, 1, "then the status of publish and reset button is evaluated");
			});
		});
	});

	QUnit.module("Given that RuntimeAuthoring is started with a scope set...", {
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function() {
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp.getAggregation("rootControl"),
				metadataScope: "someScope"
			});

			return RtaQunitUtils.clear()
			.then(this.oRta.start.bind(this.oRta));
		},
		afterEach: function() {
			cleanInfoSessionStorage();
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when RTA is started, then the overlay has the scoped metadata associated", function(assert) {
			assert.equal(this.oRta.getMetadataScope(), "someScope", "then RTA knows the scope");
			assert.equal(this.oRta._oDesignTime.getScope(), "someScope", "then designtime knows the scope");

			var oOverlayWithInstanceSpecificMetadata = OverlayRegistry.getOverlay("Comp1---idMain1--Dates.SpecificFlexibility");
			var mDesignTimeMetadata = oOverlayWithInstanceSpecificMetadata.getDesignTimeMetadata().getData();
			assert.equal(mDesignTimeMetadata.newKey, "new", "New scoped key is added");
			assert.equal(mDesignTimeMetadata.someKeyToOverwriteInScopes, "scoped", "Scope can overwrite keys");
			assert.equal(mDesignTimeMetadata.some.deep, null, "Scope can delete keys");

			var oRootOverlayWithInstanceSpecificMetadata = OverlayRegistry.getOverlay("Comp1---app");
			var mDesignTimeMetadata2 = oRootOverlayWithInstanceSpecificMetadata.getDesignTimeMetadata().getData();
			assert.equal(mDesignTimeMetadata2.newKey, "new", "New scoped key is added");
			assert.equal(mDesignTimeMetadata2.someKeyToOverwriteInScopes, "scoped", "Scope can overwrite keys");
			assert.equal(mDesignTimeMetadata2.some.deep, null, "Scope can delete keys");

			var oErrorStub = sandbox.stub(Log, "error");
			this.oRta.setMetadataScope("some other scope");
			assert.equal(this.oRta.getMetadataScope(), "someScope", "then the scope in RTA didn't change");
			assert.equal(oErrorStub.callCount, 1, "and an error was logged");
		});
	});

	QUnit.module("Given that RuntimeAuthoring is created but not started", {
		before: function () {
			this.oTextResources = oCore.getLibraryResourceBundle("sap.ui.rta");
			return oComponentPromise;
		},
		beforeEach: function() {
			this.oRootControl = oComp;
			var oService = {
				toExternal: function() {
					return true;
				},
				parseShellHash: function () {
					return {
						params: {
							"sap-ui-fl-version": [Layer.CUSTOMER]
						}
					};
				}
			};
			sandbox.stub(Utils, "getUshellContainer").returns({
				getServiceAsync: function () {
					return Promise.resolve(oService);
				}
			});
			this.oRta = new RuntimeAuthoring({
				rootControl: this.oRootControl,
				showToolbars: false,
				flexSettings: {
					layer: Layer.CUSTOMER
				}
			});
			sandbox.stub(this.oRta, "_serializeToLrep").returns(Promise.resolve());
			this.oDeleteChangesStub = sandbox.stub(this.oRta, "_deleteChanges").resolves();
			this.oEnableRestartSpy = sandbox.spy(RuntimeAuthoring, "enableRestart");
			this.oHandleParametersOnExitSpy = sandbox.spy(this.oRta, "_handleUrlParameterOnExit");
			this.oReloadPageStub = sandbox.stub(this.oRta, "_reloadPage");
			sandbox.stub(Utils, "getUShellService").returns(Promise.resolve({
				toExternal: function() {
					return true;
				},
				parseShellHash: function () {
					return {
						params: {
							"sap-ui-fl-version": [Layer.CUSTOMER]
						}
					};
				}
			}));

			return this.oRta._initVersioning();
		},
		afterEach: function() {
			cleanInfoSessionStorage();
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When transport function is called and transportChanges returns Promise.resolve() when the running application is not an application variant", function(assert) {
			var fnPublishStub = sandbox.stub(PersistenceWriteAPI, "publish").resolves();
			var oMessageToastStub = sandbox.stub(MessageToast, "show");
			var oAppVariantRunningStub = sandbox.stub(SmartVariantManagementApplyAPI, "isApplicationVariant").returns(false);
			return this.oRta.transport().then(function() {
				assert.equal(oMessageToastStub.callCount, 1, "then the messageToast was shown");
				assert.equal(oAppVariantRunningStub.callCount, 1, "then isApplicationVariant() got called");
				assert.deepEqual(fnPublishStub.firstCall.args[0], {
					selector: this.oRootControl,
					styleClass: RtaUtils.getRtaStyleClassName(),
					layer: Layer.CUSTOMER,
					appVariantDescriptors: []
				}, "then style class and layer was passed correctly");
			}.bind(this));
		});

		QUnit.test("When transport function is called and transportChanges returns Promise.resolve() when the running application is an application variant by navigation parameters", function(assert) {
			sandbox.stub(PersistenceWriteAPI, "publish").resolves();
			sandbox.stub(MessageToast, "show");
			sandbox.stub(SmartVariantManagementApplyAPI, "isApplicationVariant").returns(true);
			sandbox.stub(Utils, "isVariantByStartupParameter").returns(true);
			var oRtaAppVariantFeatureStub = sandbox.stub(RtaAppVariantFeature, "getAppVariantDescriptor");
			return this.oRta.transport().then(function() {
				assert.equal(oRtaAppVariantFeatureStub.callCount, 0, "the RtaAppVariantFeature.getAppVariantDescriptor was not called");
			});
		});

		QUnit.test("When transport function is called and transportChanges returns Promise.resolve() when the running application is an application variant", function(assert) {
			var fnPublishStub = sandbox.stub(PersistenceWriteAPI, "publish").resolves();
			var oMessageToastStub = sandbox.stub(MessageToast, "show");
			var oAppVariantRunningStub = sandbox.stub(SmartVariantManagementApplyAPI, "isApplicationVariant").returns(true);
			var oDummyObject = {
				foo: "hugo"
			};
			var aAppVariantDescriptors = [oDummyObject];
			sandbox.stub(RtaAppVariantFeature, "getAppVariantDescriptor").resolves(oDummyObject);
			return this.oRta.transport().then(function() {
				assert.equal(oMessageToastStub.callCount, 1, "then the messageToast was shown");
				assert.equal(oAppVariantRunningStub.callCount, 1, "then isAppVariantRunning() got called");
				assert.deepEqual(fnPublishStub.firstCall.args[0], {
					selector: this.oRootControl,
					appVariantDescriptors: aAppVariantDescriptors,
					layer: Layer.CUSTOMER,
					styleClass: "sapUiRTABorder"
				}, "then appVariantDescriptors, layer and styleClass parameters were passed correctly");
			}.bind(this));
		});

		QUnit.test("When transport function is called and Promise.reject() is returned from the flex persistence", function(assert) {
			sandbox.stub(PersistenceWriteAPI, "publish").rejects(new Error("Error"));
			var oMessageToastStub = sandbox.stub(MessageToast, "show");
			var oAppVariantRunningStub = sandbox.stub(SmartVariantManagementApplyAPI, "isApplicationVariant").returns(false);
			var oShowErrorStub = sandbox.stub(Log, "error");
			var oErrorBoxStub = sandbox.stub(MessageBox, "error");
			return this.oRta.transport().then(function() {
				assert.equal(oMessageToastStub.callCount, 0, "then the messageToast was not shown");
				assert.equal(oAppVariantRunningStub.callCount, 1, "then isAppVariantRunning() got called");
				assert.equal(oShowErrorStub.callCount, 1, "then the error was logged");
				assert.equal(oErrorBoxStub.callCount, 1, "and a MessageBox.error was shown");
			});
		});

		[{
			error: {
				userMessage: "Error text 1\nError text 2\n"
			},
			errorText: "Error text 1\nError text 2\n",
			propertyName: "userMessage"
		},
		{
			error: {
				messages: [],
				message: "messageText"
			},
			errorText: "messageText",
			propertyName: "message"
		},
		{
			error: {
				messages: [],
				stack: "messageText"
			},
			errorText: "messageText",
			propertyName: "stack"
		},
		{
			error: {
				messages: [],
				status: "messageText"
			},
			errorText: "messageText",
			propertyName: "status"
		}].forEach(function (oErrorResponse) {
			QUnit.test("When transport function is called and transportChanges returns Promise.reject() with error in the property: " + oErrorResponse.propertyName, function (assert) {
				var sErrorBoxText = this.oTextResources.getText("MSG_LREP_TRANSFER_ERROR") + "\n"
					+ this.oTextResources.getText("MSG_ERROR_REASON", oErrorResponse.errorText);
				sandbox.stub(PersistenceWriteAPI, "publish").rejects(oErrorResponse.error);
				var oAppVariantRunningStub = sandbox.stub(SmartVariantManagementApplyAPI, "isApplicationVariant").returns(false);
				var oMessageToastStub = sandbox.stub(MessageToast, "show");
				var oShowErrorStub = sandbox.stub(Log, "error");
				var oErrorBoxStub = sandbox.stub(MessageBox, "error");
				return this.oRta.transport().then(function () {
					assert.equal(oMessageToastStub.callCount, 0, "then the messageToast was not shown");
					assert.equal(oAppVariantRunningStub.callCount, 1, "then isAppVariantRunning() got called");
					assert.equal(oShowErrorStub.callCount, 1, "then the error was logged");
					assert.equal(oErrorBoxStub.callCount, 1, "and a MessageBox.error was shown");
					assert.equal(oErrorBoxStub.args[0][0], sErrorBoxText, "and the shown error text is correct");
				});
			});
		});

		QUnit.test("When transport function is called and transportChanges returns Promise.resolve() with 'Error' as parameter", function(assert) {
			sandbox.stub(PersistenceWriteAPI, "publish").resolves("Error");
			var oMessageToastStub = sandbox.stub(MessageToast, "show");
			var oAppVariantRunningStub = sandbox.stub(SmartVariantManagementApplyAPI, "isApplicationVariant").returns(false);
			return this.oRta.transport().then(function() {
				assert.equal(oMessageToastStub.callCount, 0, "then the messageToast was not shown");
				assert.equal(oAppVariantRunningStub.callCount, 1, "then isAppVariantRunning() got called");
			});
		});

		QUnit.test("When transport function is called and transportChanges returns Promise.resolve() with 'Cancel' as parameter", function(assert) {
			sandbox.stub(PersistenceWriteAPI, "publish").resolves("Cancel");
			var oMessageToastStub = sandbox.stub(MessageToast, "show");
			var oAppVariantRunningStub = sandbox.stub(SmartVariantManagementApplyAPI, "isApplicationVariant").returns(false);
			return this.oRta.transport().then(function() {
				assert.equal(oMessageToastStub.callCount, 0, "then the messageToast was not shown");
				assert.equal(oAppVariantRunningStub.callCount, 1, "then isAppVariantRunning() got called");
			});
		});

		QUnit.test("When restore function is called in the CUSTOMER layer", function(assert) {
			var oShowMessageBoxStub = sandbox.stub(RtaUtils, "showMessageBox").resolves(MessageBox.Action.OK);
			var sResetMessageKey = "FORM_PERS_RESET_MESSAGE";
			var sResetTitleKey = "FORM_PERS_RESET_TITLE";

			return this.oRta.restore().then(function() {
				assert.equal(oShowMessageBoxStub.callCount, 1, "then the message box was shown");
				assert.equal(oShowMessageBoxStub.lastCall.args[1], sResetMessageKey, "then the message key is correct");
				assert.notEqual(this.oTextResources.getText(sResetMessageKey), sResetMessageKey, "then the message text is available on the resource file");
				assert.equal(oShowMessageBoxStub.lastCall.args[2].titleKey, sResetTitleKey, "then the title key is correct");
				assert.notEqual(this.oTextResources.getText(sResetTitleKey), sResetTitleKey, "then the title text is available on the resource file");
				assert.equal(this.oDeleteChangesStub.callCount, 1, "then _deleteChanges was called");
				assert.equal(this.oEnableRestartSpy.callCount, 1, "then restart was enabled...");
				assert.equal(this.oEnableRestartSpy.lastCall.args[0], Layer.CUSTOMER, "for the correct layer");

				oShowMessageBoxStub.reset();
				oShowMessageBoxStub.resolves(MessageBox.Action.CANCEL);
				this.oRta.restore();
			}.bind(this))
			.then(function() {
				assert.equal(oShowMessageBoxStub.callCount, 1, "then the message box was shown");
				assert.equal(this.oDeleteChangesStub.callCount, 1, "then _deleteChanges was not called again");
				assert.equal(this.oEnableRestartSpy.callCount, 1, "then restart was not  enabled again");
			}.bind(this));
		});

		QUnit.test("When restore function is called in the USER layer", function(assert) {
			var oShowMessageBoxStub = sandbox.stub(RtaUtils, "showMessageBox").resolves(MessageBox.Action.OK);
			this.oRta.setFlexSettings({
				layer: Layer.USER
			});
			var sPersResetMessageKey = "FORM_PERS_RESET_MESSAGE_PERSONALIZATION";
			var sPersResetTitleKey = "BTN_RESTORE";

			return this.oRta.restore().then(function() {
				assert.equal(oShowMessageBoxStub.callCount, 1, "then the message box was shown");
				assert.equal(oShowMessageBoxStub.lastCall.args[1], sPersResetMessageKey, "then the message key is correct");
				assert.notEqual(this.oTextResources.getText(sPersResetMessageKey), sPersResetMessageKey, "then the message text is available on the resource file");
				assert.equal(oShowMessageBoxStub.lastCall.args[2].titleKey, sPersResetTitleKey, "then the title key is correct");
				assert.notEqual(this.oTextResources.getText(sPersResetTitleKey), sPersResetTitleKey, "then the message text is available on the resource file");
				assert.equal(this.oDeleteChangesStub.callCount, 1, "then _deleteChanges was called");
				assert.equal(this.oEnableRestartSpy.callCount, 1, "then restart was enabled...");
				assert.equal(this.oEnableRestartSpy.lastCall.args[0], Layer.USER, "for the correct layer");

				oShowMessageBoxStub.reset();
				oShowMessageBoxStub.resolves(MessageBox.Action.CANCEL);
				this.oRta.restore();
			}.bind(this))
			.then(function() {
				assert.equal(oShowMessageBoxStub.callCount, 1, "then the message box was shown");
				assert.equal(this.oDeleteChangesStub.callCount, 1, "then _deleteChanges was not called again");
				assert.equal(this.oEnableRestartSpy.callCount, 1, "then restart was not  enabled again");
			}.bind(this));
		});

		QUnit.test("when calling '_deleteChanges' successfully", function(assert) {
			assert.expect(4);
			this.oDeleteChangesStub.restore();
			sandbox.stub(PersistenceWriteAPI, "reset").callsFake(function() {
				assert.deepEqual(arguments[0], {
					selector: oCompCont.getComponentInstance(),
					layer: Layer.CUSTOMER
				}, "then the correct parameters were passed");
				return Promise.resolve();
			});
			var oFlexInfoResponse = {allContextsProvided: true, isResetEnabled: false, isPublishEnabled: false};
			var sFlexReference = FlexRuntimeInfoAPI.getFlexReference({element: oCompCont.getComponentInstance()});
			window.sessionStorage.setItem("sap.ui.fl.info." + sFlexReference, JSON.stringify(oFlexInfoResponse));

			return this.oRta._deleteChanges().then(function() {
				assert.equal(this.oHandleParametersOnExitSpy.callCount, 1, "then delete draft url parameter");
				assert.equal(this.oReloadPageStub.callCount, 1, "then page reload is triggered");
				var sFlexInfoFromSession = window.sessionStorage.getItem("sap.ui.fl.info." + sFlexReference);
				assert.equal(sFlexInfoFromSession, null, "then flex info from session storage is null");
			}.bind(this));
		});

		QUnit.test("when calling '_deleteChanges' successfully in AppVariant", function(assert) {
			assert.expect(3);
			this.oDeleteChangesStub.restore();
			sandbox.stub(SmartVariantManagementApplyAPI, "isApplicationVariant").returns(true);
			sandbox.stub(PersistenceWriteAPI, "reset").callsFake(function() {
				assert.deepEqual(arguments[0], {
					selector: oCompCont.getComponentInstance(),
					layer: Layer.CUSTOMER
				}, "then the correct generator and layer was passed");
				return Promise.resolve();
			});

			return this.oRta._deleteChanges().then(function() {
				assert.equal(this.oHandleParametersOnExitSpy.callCount, 1, "then delete draft url parameter");
				assert.equal(this.oReloadPageStub.callCount, 1, "then page reload is triggered");
			}.bind(this));
		});

		QUnit.test("when calling '_deleteChanges and there is an error', ", function(assert) {
			this.oDeleteChangesStub.restore();
			var sFlexReference = FlexRuntimeInfoAPI.getFlexReference({element: oCompCont.getComponentInstance()});
			var sInfoSessionName = "sap.ui.fl.info." + sFlexReference;
			var oFlexInfoResponse = {allContextsProvided: true, isResetEnabled: false, isPublishEnabled: false};
			window.sessionStorage.setItem(sInfoSessionName, JSON.stringify(oFlexInfoResponse));

			sandbox.stub(PersistenceWriteAPI, "reset").rejects("Error");

			sandbox.stub(RtaUtils, "showMessageBox").callsFake(function(sMessageType, sMessage, mPropertyBag) {
				assert.equal(mPropertyBag.error, "Error", "and a message box shows the error to the user");
			});

			return this.oRta._deleteChanges().then(function() {
				assert.equal(this.oReloadPageStub.callCount, 0, "then page reload is not triggered");
				var sFlexInfoFromSession = window.sessionStorage.getItem(sInfoSessionName);
				assert.equal(sFlexInfoFromSession, JSON.stringify(oFlexInfoResponse), "then flex info from session storage still exists");
			}.bind(this));
		});

		QUnit.test("when calling '_deleteChanges and reset is cancelled', ", function(assert) {
			this.oDeleteChangesStub.restore();
			var sFlexReference = FlexRuntimeInfoAPI.getFlexReference({element: oCompCont.getComponentInstance()});
			var sInfoSessionName = "sap.ui.fl.info." + sFlexReference;
			var oFlexInfoResponse = {allContextsProvided: true, isResetEnabled: false, isPublishEnabled: false};
			window.sessionStorage.setItem(sInfoSessionName, JSON.stringify(oFlexInfoResponse));

			sandbox.stub(PersistenceWriteAPI, "reset").returns(Promise.reject("cancel"));
			var oStubShowError = sandbox.stub(RtaUtils, "showMessageBox");

			return this.oRta._deleteChanges().then(function() {
				assert.equal(this.oReloadPageStub.callCount, 0, "then page reload is not triggered");
				assert.equal(oStubShowError.callCount, 0, "no error messages is shown");
				var sFlexInfoFromSession = window.sessionStorage.getItem(sInfoSessionName);
				assert.equal(sFlexInfoFromSession, JSON.stringify(oFlexInfoResponse), "then flex info from session storage still exists");
			}.bind(this));
		});

		QUnit.test("when calling '_handleElementModified' and the command fails because of dependencies", function(assert) {
			assert.expect(2);
			var oLogStub = sandbox.stub(Log, "error");
			var oMessageBoxStub = sandbox.stub(RtaUtils, "showMessageBox");
			var oCommandStack = {
				pushAndExecute: function() {
					return Promise.reject(Error("Some stuff.... The following Change cannot be applied because of a dependency .... some other stuff"));
				}
			};
			sandbox.stub(this.oRta, "getCommandStack").returns(oCommandStack);
			var oEvent = {
				getParameter: function(sParameter) {
					if (sParameter === "command") {
						return new RTABaseCommand();
					}
				}
			};
			return this.oRta._handleElementModified(oEvent)
			.then(function() {
				assert.equal(oLogStub.callCount, 1, "one error got logged");
				assert.equal(oMessageBoxStub.callCount, 1, "one MessageBox got shown");
			});
		});

		QUnit.test("when calling '_handleElementModified' and the command fails, but not because of dependencies", function(assert) {
			assert.expect(2);
			var oLogStub = sandbox.stub(Log, "error");
			var oMessageBoxStub = sandbox.stub(RtaUtils, "showMessageBox");
			var oCommandStack = {
				pushAndExecute: function() {
					return Promise.reject(Error("Some stuff........ some other stuff"));
				}
			};
			sandbox.stub(this.oRta, "getCommandStack").returns(oCommandStack);
			var oEvent = {
				getParameter: function(sParameter) {
					if (sParameter === "command") {
						return new RTABaseCommand();
					}
				}
			};
			return this.oRta._handleElementModified(oEvent)
			.then(function() {
				assert.equal(oLogStub.callCount, 1, "one error got logged");
				assert.equal(oMessageBoxStub.callCount, 0, "no MessageBox got shown");
			});
		});

		QUnit.test("when trying to start twice", function (assert) {
			var oDesigntimeAddRootElementSpy = sandbox.spy(DesignTime.prototype, "addRootElement");
			return Promise.all([this.oRta.start(), this.oRta.start()])
				.then(function () {
					assert.strictEqual(oDesigntimeAddRootElementSpy.callCount, 1, "the the designtime is going to start once");
				});
		});
	});

	QUnit.module("Given that RuntimeAuthoring is created without flexSettings", {
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function() {
			sandbox.stub(Utils, "buildLrepRootNamespace").returns("rootNamespace/");
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl: this.oRootControl,
				showToolbars: false
			});
		},
		afterEach: function() {
			cleanInfoSessionStorage();
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the uri-parameter sap-ui-layer is set to 'VENDOR',", function(assert) {
			assert.equal(this.oRta.getLayer(), Layer.CUSTOMER, "then the layer is the default 'CUSTOMER'");

			sandbox.stub(UriParameters.prototype, "get").withArgs("sap-ui-layer").returns(Layer.VENDOR);

			this.oRta.setFlexSettings(this.oRta.getFlexSettings());
			assert.equal(this.oRta.getLayer(), Layer.VENDOR, "then the function reacts to the URL parameter and sets the layer to VENDOR");
		});

		QUnit.test("when the uri-parameter sap-ui-layer is set to 'vendor',", function(assert) {
			assert.equal(this.oRta.getLayer(), Layer.CUSTOMER, "then the layer is the default 'CUSTOMER'");

			sandbox.stub(UriParameters.prototype, "get").withArgs("sap-ui-layer").returns("vendor");

			this.oRta.setFlexSettings(this.oRta.getFlexSettings());
			assert.equal(this.oRta.getLayer(), Layer.VENDOR, "then the function reacts to the URL parameter and sets the layer to VENDOR");
		});

		QUnit.test("when setFlexSettings is called", function(assert) {
			assert.deepEqual(
				this.oRta.getFlexSettings(),
				{
					layer: Layer.CUSTOMER,
					developerMode: true
				}
			);

			this.oRta.setFlexSettings({
				layer: Layer.USER,
				namespace: "namespace"
			});

			assert.deepEqual(this.oRta.getFlexSettings(), {
				layer: Layer.USER,
				developerMode: true,
				namespace: "namespace"
			});

			this.oRta.setFlexSettings({
				scenario: "scenario"
			});

			assert.deepEqual(
				this.oRta.getFlexSettings(),
				{
					layer: Layer.USER,
					developerMode: true,
					namespace: "rootNamespace/changes/",
					rootNamespace: "rootNamespace/",
					scenario: "scenario"
				}
			);
		});
	});

	QUnit.module("Given _onStackModified", {
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function() {
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl: this.oRootControl,
				showToolbars: true
			});
			return this.oRta.start();
		},
		afterEach: function() {
			cleanInfoSessionStorage();
			if (this.oRta._oDraftDiscardWarningPromise) {
				this.oRta._oDraftDiscardWarningPromise = undefined;
				this.oRta._oDraftDiscardWarningDialog.destroy();
			}
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when an undo operation can be done", function (assert) {
			sandbox.stub(this.oRta.getCommandStack(), "canUndo").returns(true);
			var oVersionsModel = this.oRta.getToolbar().getModel("versions");
			oVersionsModel.setProperty("/versioningEnabled", true);
			var oSetDirtyChangesSpy = sandbox.spy(oVersionsModel, "setDirtyChanges");
			return this.oRta._onStackModified().then(function () {
				assert.equal(oSetDirtyChangesSpy.callCount, 1, "dirtyChanges was set in the versions model");
				assert.equal(oSetDirtyChangesSpy.getCall(0).args[0], true, "to true");
			});
		});

		QUnit.test("when an undo operation is not available", function (assert) {
			sandbox.stub(this.oRta.getCommandStack(), "canUndo").returns(false);
			var oVersionsModel = this.oRta.getToolbar().getModel("versions");
			oVersionsModel.setProperty("/versioningEnabled", true);
			var oSetDirtyChangesSpy = sandbox.spy(oVersionsModel, "setDirtyChanges");
			return this.oRta._onStackModified().then(function () {
				assert.equal(oSetDirtyChangesSpy.callCount, 1, "dirtyChanges was set in the versions model");
				assert.equal(oSetDirtyChangesSpy.getCall(0).args[0], false, "to false");
			});
		});
	});

	QUnit.module("Given a started RTA", {
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function() {
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl: this.oRootControl,
				showToolbars: true
			});
			return this.oRta.start();
		},
		afterEach: function() {
			cleanInfoSessionStorage();
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the draft is activated failed", function (assert) {
			var done = assert.async();
			var oEvent = {
				versionTitle: "VersionTitle"
			};
			sandbox.stub(VersionsAPI, "activate").rejects("myFancyError");
			sandbox.stub(RtaUtils, "showMessageBox").callsFake(function(sIconType, sMessage, mPropertyBag) {
				assert.equal(sIconType, "error", "the error message box is used");
				assert.equal(mPropertyBag.error, "myFancyError", "and a message box shows the error to the user");
				assert.equal(sMessage, "MSG_DRAFT_ACTIVATION_FAILED", "the message is MSG_DRAFT_ACTIVATION_FAILED");
				done();
			});

			this.oRta.getToolbar().fireEvent("activate", oEvent);
		});
	});

	QUnit.done(function() {
		oComp.destroy();
		jQuery("#qunit-fixture").hide();
	});
});
