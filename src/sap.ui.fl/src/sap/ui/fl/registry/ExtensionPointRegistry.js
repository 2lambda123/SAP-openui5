/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/util/reflection/JsControlTreeModifier"
], function(
	ManagedObjectObserver,
	JsControlTreeModifier
) {
	"use strict";

	/**
	 * Object to register extension points to track their locations
	 * @constructor
	 * @alias sap.ui.fl.registry.ExtensionPointRegistry
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	var ExtensionPointRegistry = function() {
		this._bEnabledObserver = sap.ui.getCore().getConfiguration().getDesignMode();
		this._mObservers = {};
		this._mExtensionPointsByParent = {};
		this._mExtensionPointsByViewId = {};
		this._aApplyExtensionPointPromises = [];
	};

	ExtensionPointRegistry._instance = undefined;

	/**
	 * Returns the singleton instance of the extension point registry.
	 *
	 * @returns {sap.ui.fl.registry.ExtensionPointRegistry} Instance (singleton) of the extension point registry
	 */
	ExtensionPointRegistry.getInstance = function() {
		if (!ExtensionPointRegistry._instance) {
			ExtensionPointRegistry._instance = new ExtensionPointRegistry();
		}
		return ExtensionPointRegistry._instance;
	};

	ExtensionPointRegistry.prototype._observeIndex = function(oEvent) {
		var sParentId = oEvent.object.getId();
		var sAggregationName;

		this._mExtensionPointsByParent[sParentId].forEach(function(oExtensionPoint) {
			sAggregationName = oExtensionPoint.aggregationName;
			if (sAggregationName === oEvent.name) {
				var vControlIds = JsControlTreeModifier.getAggregation(oEvent.object, sAggregationName);
				var aControlIds = [].concat(vControlIds || []).map(function(oControl) {
					return oControl.getId();
				});

				if (oEvent.mutation === "insert") {
					if (aControlIds.indexOf(oEvent.child.getId()) < oExtensionPoint.index) {
						oExtensionPoint.index++;
					}
				} else if (oExtensionPoint.aggregation.indexOf(oEvent.child.getId()) < oExtensionPoint.index) {
					oExtensionPoint.index--;
				}

				oExtensionPoint.aggregation = aControlIds;
			}
		});
	};

	ExtensionPointRegistry.prototype._startObserver = function (oParent, sAggregationName) {
		if (this._bEnabledObserver) {
			var sParentId = oParent.getId();
			if (!this._mObservers[sParentId]) {
				var oObserver = new ManagedObjectObserver(this._observeIndex.bind(this));
				oObserver.observe(oParent, {
					aggregations: [sAggregationName]
				});
				this._mObservers[sParentId] = {
					observer: oObserver,
					aggregations: [sAggregationName]
				};
			} else {
				var bIsObserved = this._mObservers[sParentId].observer.isObserved(oParent, {aggregations: [sAggregationName]});
				if (!bIsObserved) {
					this._mObservers[sParentId].aggregations.push(sAggregationName);
					this._mObservers[sParentId].observer.observe(oParent, {
						aggregations: this._mObservers[sParentId].aggregations
					});
				}
			}
		}
	};

	/**
	 * Registration of extension points for observing the aggregation to track the index.
	 *
	 * @param {Object} mExtensionPointInfo - Map of extension point information
	 * @param {Object} mExtensionPointInfo.viewId - View id
	 * @param {string} mExtensionPointInfo.name - Name of the extension point
	 * @param {Object} mExtensionPointInfo.targetControl - Parent control of the extension point
	 * @param {string} mExtensionPointInfo.aggregationName - Name of the aggregation where the extension point is
	 * @param {number} mExtensionPointInfo.index - Index of the extension point
	 * @param {Array} mExtensionPointInfo.defaultContent - Array of control ids which belong to the default aggregation
	 */
	ExtensionPointRegistry.prototype.registerExtensionPoints = function(mExtensionPointInfo) {
		var oParent = mExtensionPointInfo.targetControl;
		var sViewId = mExtensionPointInfo.viewId;
		var sAggregationName = mExtensionPointInfo.aggregationName;
		this._startObserver(oParent, sAggregationName);

		var vAggregation = JsControlTreeModifier.getAggregation(oParent, sAggregationName);
		var aControlIds = [].concat(vAggregation || []).map(function(oControl) {
			return oControl.getId();
		});

		var sParentId = oParent.getId();
		if (!this._mExtensionPointsByParent[sParentId]) {
			this._mExtensionPointsByParent[sParentId] = [];
		}
		if (!this._mExtensionPointsByViewId[sViewId]) {
			this._mExtensionPointsByViewId[sViewId] = {};
		}
		mExtensionPointInfo.aggregation = aControlIds;
		this._mExtensionPointsByParent[sParentId].push(mExtensionPointInfo);
		this._mExtensionPointsByViewId[sViewId][mExtensionPointInfo.name] = mExtensionPointInfo;
	};

	/**
	 * Returns the extension point information.
	 *
	 * @param {string} sExtensionPointName - Name of the extension point
	 * @param {Object} oView - View object
	 * @returns {Object} mExtensionPointInfo - Map of extension point information
	 */
	ExtensionPointRegistry.prototype.getExtensionPointInfo = function (sExtensionPointName, oView) {
		return this._mExtensionPointsByViewId[oView.getId()]
			&& this._mExtensionPointsByViewId[oView.getId()][sExtensionPointName];
	};

	/**
	 * Returns the extension point information by view ID.
	 * @param {string} oViewId - ID of the view
	 * @returns {object} Map of extension points
	 */
	ExtensionPointRegistry.prototype.getExtensionPointInfoByViewId = function (oViewId) {
		return this._mExtensionPointsByViewId[oViewId] || {};
	};

	/**
	 * Returns the extension point information by parent id.
	 *
	 * @param {string} sParentId - Id of the extension point parent control
	 * @returns {Array} of extension point informations.
	 */
	ExtensionPointRegistry.prototype.getExtensionPointInfoByParentId = function (sParentId) {
		return this._mExtensionPointsByParent[sParentId] || [];
	};

	/**
	 * Adds a promise of applying an extension point into a list.
	 *
	 * @param {Promise} oPromise - Promise of applying an extension point
	 */
	ExtensionPointRegistry.prototype.addApplyExtensionPointPromise = function (oPromise) {
		return this._aApplyExtensionPointPromises.push(oPromise);
	};

	/**
	 * Gets a promise from list of all applying extension points.
	 *
	 * @returns {Promise} Promise of all applying extension points
	 */
	ExtensionPointRegistry.prototype.getApplyExtensionPointsPromise = function () {
		return Promise.all(this._aApplyExtensionPointPromises);
	};

	/**
	 * Destroys the registered observers and initializes the registry.
	 */
	ExtensionPointRegistry.prototype.exit = function() {
		Object.keys(this._mObservers).forEach(function(sParentId) {
			this._mObservers[sParentId].observer.disconnect();
			this._mObservers[sParentId].observer.destroy();
		}.bind(this));
		this._mObservers = {};
		this._mExtensionPointsByParent = {};
		this._mExtensionPointsByViewId = {};
		this._aApplyExtensionPointPromises = [];
		ExtensionPointRegistry._instance = undefined;
	};

	return ExtensionPointRegistry;
}, true);