/*!
 * ${copyright}
 */

// Provides utility class sap.m.DynamicDateUtil
sap.ui.define([
	"./StandardDynamicDateOption",
	"./StandardDynamicDateRangeKeys",
	"sap/base/Log"
], function(
	StandardDynamicDateOption, StandardDynamicDateRangeKeys, Log) {
	"use strict";

	/**
	 * A utility class for working with the DynamicDateOption instances.
	 *
	 * @alias sap.m.DynamicDateUtil
	 * @static
	 * @public
	 * @experimental Since 1.92. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var DynamicDateUtil = {
		_options: {
			"TODAY": new StandardDynamicDateOption({ key: "TODAY", valueTypes: [] }),
			"YESTERDAY": new StandardDynamicDateOption({ key: "YESTERDAY", valueTypes: [] }),
			"TOMORROW": new StandardDynamicDateOption({ key: "TOMORROW", valueTypes: [] }),
			"THISWEEK": new StandardDynamicDateOption({ key: "THISWEEK", valueTypes: [] }),
			"THISMONTH": new StandardDynamicDateOption({ key: "THISMONTH", valueTypes: [] }),
			"THISQUARTER": new StandardDynamicDateOption({ key: "THISQUARTER", valueTypes: [] }),
			"THISYEAR": new StandardDynamicDateOption({ key: "THISYEAR", valueTypes: [] }),
			"LASTWEEK": new StandardDynamicDateOption({ key: "LASTWEEK", valueTypes: [] }),
			"LASTMONTH": new StandardDynamicDateOption({ key: "LASTMONTH", valueTypes: [] }),
			"LASTQUARTER": new StandardDynamicDateOption({ key: "LASTQUARTER", valueTypes: [] }),
			"LASTYEAR": new StandardDynamicDateOption({ key: "LASTYEAR", valueTypes: [] }),
			"NEXTWEEK": new StandardDynamicDateOption({ key: "NEXTWEEK", valueTypes: [] }),
			"NEXTMONTH": new StandardDynamicDateOption({ key: "NEXTMONTH", valueTypes: [] }),
			"NEXTQUARTER": new StandardDynamicDateOption({ key: "NEXTQUARTER", valueTypes: [] }),
			"NEXTYEAR": new StandardDynamicDateOption({ key: "NEXTYEAR", valueTypes: [] }),
			"LASTDAYS": new StandardDynamicDateOption({ key: "LASTDAYS", valueTypes: ["int"] }),
			"LASTWEEKS": new StandardDynamicDateOption({ key: "LASTWEEKS", valueTypes: ["int"] }),
			"LASTMONTHS": new StandardDynamicDateOption({ key: "LASTMONTHS", valueTypes: ["int"] }),
			"LASTQUARTERS": new StandardDynamicDateOption({ key: "LASTQUARTERS", valueTypes: ["int"] }),
			"LASTYEARS": new StandardDynamicDateOption({ key: "LASTYEARS", valueTypes: ["int"] }),
			"NEXTDAYS": new StandardDynamicDateOption({ key: "NEXTDAYS", valueTypes: ["int"] }),
			"NEXTWEEKS": new StandardDynamicDateOption({ key: "NEXTWEEKS", valueTypes: ["int"] }),
			"NEXTMONTHS": new StandardDynamicDateOption({ key: "NEXTMONTHS", valueTypes: ["int"] }),
			"NEXTQUARTERS": new StandardDynamicDateOption({ key: "NEXTQUARTERS", valueTypes: ["int"] }),
			"NEXTYEARS": new StandardDynamicDateOption({ key: "NEXTYEARS", valueTypes: ["int"] }),
			"FROM": new StandardDynamicDateOption({ key: "FROM", valueTypes: ["date"] }),
			"TO": new StandardDynamicDateOption({ key: "TO", valueTypes: ["date"] }),
			"YEARTODATE": new StandardDynamicDateOption({ key: "YEARTODATE", valueTypes: [] }),
			"TODAYFROMTO": new StandardDynamicDateOption({ key: "TODAYFROMTO", valueTypes: ["int", "int"] }),
			"QUARTER1": new StandardDynamicDateOption({ key: "QUARTER1", valueTypes: [] }),
			"QUARTER2": new StandardDynamicDateOption({ key: "QUARTER2", valueTypes: [] }),
			"QUARTER3": new StandardDynamicDateOption({ key: "QUARTER3", valueTypes: [] }),
			"QUARTER4": new StandardDynamicDateOption({ key: "QUARTER4", valueTypes: [] }),
			"SPECIFICMONTH": new StandardDynamicDateOption({ key: "SPECIFICMONTH", valueTypes: ["int"] }),
			"DATERANGE": new StandardDynamicDateOption({ key: "DATERANGE", valueTypes: ["date", "date"] }),
			"DATE": new StandardDynamicDateOption({ key: "DATE", valueTypes: ["date"] })
		}
	};

	/**
	 * Adds an option to be reused as a global object.
	 *
	 * @param {sap.m.DynamicDateOption} option The option to be added
	 * @static
	 * @public
	 */
	DynamicDateUtil.addOption = function(option) {
		if (!option || !option.getKey()) {
			return;
		}

		DynamicDateUtil._options[option.getKey()] = option;
	};

	/**
	 * Gets an option by its key.
	 *
	 * @param {string} sKey The option key
	 * @returns {sap.m.DynamicDateOption} The option
	 * @static
	 * @public
	 */
	DynamicDateUtil.getOption = function(sKey) {
		return DynamicDateUtil._options[sKey];
	};

	/**
	 * Parses a string to an array of objects in the DynamicDateRange's value format.
	 * Uses the provided formatter.
	 *
	 * @param {string} sValue The string to be parsed
	 * @param {sap.m.DynamicDateFormat} oFormatter A dynamic date formatter
	 * @returns {object[]} An array of value objects in the DynamicDateRange's value format
	 * @static
	 * @public
	 */
	DynamicDateUtil.parse = function(sValue, oFormatter) {
		if (typeof sValue !== 'string') {
			Log.error("DynamicDateFormat can only parse a String.");
			return [];
		}

		var aResults = [],
			oResult;

		var aOptions = Object.keys(DynamicDateUtil._options).sort(function(sKey1, sKey2) {
			return StandardDynamicDateRangeKeys.indexOf(sKey1) - StandardDynamicDateRangeKeys.indexOf(sKey2);
		}).map(function(sKey) {
			return DynamicDateUtil._options[sKey];
		});

		for (var i = 0; i < aOptions.length; i++) {
			oResult = aOptions[i].parse(sValue.trim(), oFormatter);

			if (oResult) {
				oResult.operator = aOptions[i].getKey();
				aResults.push(oResult);
			}
		}

		return aResults;
	};

	/**
	 * Calculates a date range from a provided object in the format of the DynamicDateRange's value.
	 *
	 * @param {string} oValue The provided value
	 * @returns {sap.ui.core.date.UniversalDate[]} An array of two date objects - start and end date
	 * @static
	 * @public
	 */
	DynamicDateUtil.toDates = function(oValue) {
		var sKey = oValue.operator;
		return DynamicDateUtil._options[sKey].toDates(oValue);
	};

	return DynamicDateUtil;

}, true);
