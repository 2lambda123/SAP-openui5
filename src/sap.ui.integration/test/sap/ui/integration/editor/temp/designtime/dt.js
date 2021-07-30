/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/integration/Designtime"], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"generalGroup": {
						"type": "group",
						"label": "General",
						"hint": "Please refer to the <a href='https://www.sap.com'>documentation</a> lets see how this will behave if the text is wrapping to the next line and has <a href='https://www.sap.com'>two links</a>. good?"
					},
					"separator1": {
						"type": "separator",
						"line": true
					},
					"cardTitle": {
						"manifestpath": "/temp/configuration/parameters/cardTitle/value",
						"type": "string",
						"translatable": true,
						"required": true,
						"allowDynamicValues": true,
						"editableToUser": false,
						"visibleToUser": false
					},
					"string": {
						"manifestpath": "/temp/configuration/parameters/string/value",
						"type": "string",
						"translatable": true,
						"required": true,
						"editableToUser": false
					},
					"stringLabel": {
						"manifestpath": "/temp/configuration/parameters/stringLabel/value",
						"type": "string",
						"label": "Direct String Label",
						"editableToUser": true,
						"visibleToUser": true
					},
					"separator2": {
						"type": "separator",
						"line": true
					},
					"separator3": {
						"type": "separator",
						"line": true
					},
					"stringLabelTrans": {
						"manifestpath": "/temp/configuration/parameters/stringLabelTrans/value",
						"type": "string",
						"label": "{i18n>TRANSLATED_STRING_LABEL}",
						"translatable": true,
						"allowDynamicValues": false
					},
					"stringLabelTrans2": {
						"manifestpath": "/temp/configuration/parameters/stringLabelTrans2/value",
						"type": "string",
						"label": "{{TRANSLATED_STRING_LABEL}}",
						"translatable": true,
						"allowDynamicValues": false
					},
					"separator4": {
						"type": "separator"
					},
					"stringWithDescription": {
						"manifestpath": "/temp/configuration/parameters/stringWithDescription/value",
						"type": "string",
						"label": "String with description",
						"description": "Description"
					},
					"stringWithLongDescription": {
						"manifestpath": "/temp/configuration/parameters/stringWithLongDescription/value",
						"type": "string",
						"label": "String with long description",
						"description": "A very long description text that should wrap into the next line"
					},
					"separator5": {
						"type": "separator",
						"line": true
					},
					"stringWithTranslatedValue": {
						"manifestpath": "/temp/configuration/parameters/stringWithTranslatedValue/value",
						"type": "string",
						"label": "String with translated value",
						"translatable": true
					},
					"stringWithTranslatedValueIni18nFormat": {
						"manifestpath": "/temp/configuration/parameters/stringWithTranslatedValueIni18nFormat/value",
						"type": "string",
						"label": "String with translated value in i18n format"
					},
					"separator6": {
						"type": "separator"
					},
					"stringInCols1": {
						"manifestpath": "/temp/configuration/parameters/stringInCols1/value",
						"label": "stringInCols1 long long long long long long long long long long long long label",
						"description": "aa",
						"type": "string",
						"cols": 1,
						"allowSettings": false,
						"translatable": true
					},
					"stringInCols2": {
						"manifestpath": "/temp/configuration/parameters/stringInCols2/value",
						"label": "URL",
						"type": "string",
						"cols": 1,
						"allowSettings": false
					},
					"separator7": {
						"type": "separator"
					},
					"integer": {
						"manifestpath": "/temp/configuration/parameters/integer/value",
						"type": "integer",
						"visualization": {
							"type": "sap/m/Slider",
							"settings": {
								"value": "{currentSettings>value}",
								"min": 0,
								"max": 10,
								"width": "100%",
								"showAdvancedTooltip": true,
								"showHandleTooltip": false,
								"inputsAsTooltips": true,
								"enabled": "{currentSettings>editable}"
							}
						}
					},
					"integerLabel": {
						"manifestpath": "/temp/configuration/parameters/integerLabel/value",
						"type": "integer",
						"label": "Direct Integer Label"
					},
					"integerLabelTrans": {
						"manifestpath": "/temp/configuration/parameters/integerLabelTrans/value",
						"type": "integer",
						"label": "{i18n>TRANSLATED_INTEGER_LABEL}"
					},
					"number": {
						"manifestpath": "/temp/configuration/parameters/number/value",
						"type": "number"
					},
					"numberLabel": {
						"manifestpath": "/temp/configuration/parameters/numberLabel/value",
						"type": "number",
						"label": "Direct number Label"
					},
					"numberLabelTrans": {
						"manifestpath": "/temp/configuration/parameters/numberLabelTrans/value",
						"type": "number",
						"label": "{i18n>TRANSLATED_NUMBER_LABEL}"
					},
					"boolean": {
						"manifestpath": "/temp/configuration/parameters/boolean/value",
						"description": "Description",
						"label": "long long long long long long long long long long label",
						"type": "boolean",
						"visualization": {
							"type": "sap/m/Switch",
							"settings": {
								"state": "{currentSettings>value}",
								"customTextOn": "Yes",
								"customTextOff": "No",
								"enabled": "{currentSettings>editable}"
							}
						}
					},
					"booleanLabel": {
						"manifestpath": "/temp/configuration/parameters/booleanLabel/value",
						"label": "long long long long long long long long long long label",
						"type": "boolean"
					},
					"booleanLabelTrans": {
						"manifestpath": "/temp/configuration/parameters/booleanLabelTrans/value",
						"type": "boolean",
						"label": "{i18n>TRANSLATED_BOOLEAN_LABEL}"
					},
					"date": {
						"manifestpath": "/temp/configuration/parameters/date/value",
						"type": "date"
					},
					"dateLabel": {
						"manifestpath": "/temp/configuration/parameters/dateLabel/value",
						"type": "date",
						"label": "Direct Date Label"
					},
					"dateLabelTrans": {
						"manifestpath": "/temp/configuration/parameters/dateLabelTrans/value",
						"type": "date",
						"label": "{i18n>TRANSLATED_DATE_LABEL}"
					},
					"dateTime": {
						"manifestpath": "/temp/configuration/parameters/dateTime/value",
						"type": "datetime"
					},
					"dateTimeLabel": {
						"manifestpath": "/temp/configuration/parameters/dateTimeLabel/value",
						"type": "datetime",
						"label": "Direct Date Time Label"
					},
					"dateTimeLabelTrans": {
						"manifestpath": "/temp/configuration/parameters/dateTimeLabelTrans/value",
						"type": "datetime",
						"label": "{i18n>TRANSLATED_DATETIME_LABEL}"
					},
					"enum": {
						"manifestpath": "/temp/configuration/parameters/enum/value",
						"label": "Enumerations",
						"type": "enum",
						"required": true,
						"enum": [
							"Option A",
							"Option B",
							"Option C"
						]
					},
					"separator8": {
						"type": "separator"
					},
					"formatterGroup": {
						"type": "group",
						"label": "Formatter"
					},
					"dateFormatter": {
						"manifestpath": "/temp/configuration/parameters/dateFormatter/value",
						"type": "date",
						"formatter": {
							"style": "long"
						}
						// "formatter": {
						// 	   format: 'yMMMMd'
						// }
						// "formatter": {
						// 	   pattern: 'yyyy-MM-dd'
						// }
					},
					"datetimeFormatter": {
						"manifestpath": "/temp/configuration/parameters/datetimeFormatter/value",
						"type": "datetime",
						"formatter": {
							"style": "long"
						}
					},
					"floatFormatter": {
						"manifestpath": "/temp/configuration/parameters/floatFormatter/value",
						"type": "number",
						"formatter": {
							"decimals": 3,
							"style":"short"
						}
					},
					"integerFormatter": {
						"manifestpath": "/temp/configuration/parameters/integerFormatter/value",
						"type": "integer",
						"formatter": {
							"minIntegerDigits": 3,
							"maxIntegerDigits": 6,
							"emptyString": ""
						}
					},
					"stringArrayFormatter": {
						"manifestpath": "/temp/configuration/parameters/stringArrayFormatter/value",
						"label": "String Array",
						"type": "string[]",
						"editable": true,
						"values": {
							"data": {
								"json": [
									{ "text": 0.3, "key": "key1", "additionalText": 1293883200000, "icon": "sap-icon://accept" },
									{ "text": 0.6, "key": "key2", "additionalText": 1293883200000, "icon": "sap-icon://cart" },
									{ "text": 0.8, "key": "key3", "additionalText": 1293883200000, "icon": "sap-icon://zoom-in" }
								],
								"path": "/"
							},
							"item": {
								"text": "Percent: {= format.percent(${text}) }",
								"key": "{key}",
								"additionalText": "datetime: {= format.dateTime(${additionalText}, {style: 'long'}) }",
								"icon": "{icon}"
							}
						}
					},
					"InvoiceswithStringArray": {
						"manifestpath": "/temp/configuration/parameters/InvoiceswithStringArray/value",
						"type": "string[]",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Invoices",
									"parameters": {
										"$select": "OrderID, ShipName, ShippedDate",
										"$skip": "5",
										"$top": "5"
									}
								},
								"path": "/value"
							},
							"item": {
								"text": "{OrderID}",
								"key": "{OrderID}",
								"additionalText": "{= format.dateTime(${ShippedDate}, {style: 'long'}) }"
							}
						}
					},
					"Invoices": {
						"manifestpath": "/temp/configuration/parameters/Invoices/value",
						"type": "string",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Invoices",
									"parameters": {
										"$select": "ShipName, ShippedDate",
										"$skip": "8",
										"$top": "8"
									}
								},
								"path": "/value"
							},
							"item": {
								"text": "{ShipName}",
								"key": "{ShipName}",
								"additionalText": "Shipped Date: {= format.dateTime(${ShippedDate}, {style: 'short'}) }"
							}
						}
					},
					"validationGroup": {
						"type": "group",
						"label": "Validation"
					},
					"stringphone": {
						"manifestpath": "/temp/configuration/parameters/string/value",
						"type": "string",
						"translatable": false,
						"required": true,
						"placeholder": "555-4555",
						"validation": {
							"type": "error",
							"maxLength": 20,
							"minLength": 1,
							"pattern": "^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$",
							"message": "The string does not match a telephone number"
						}
					},
					"stringphonenomessage": {
						"manifestpath": "/temp/configuration/parameters/string/value",
						"type": "string",
						"translatable": false,
						"required": true,
						"placeholder": "555-4555",
						"validation": {
							"type": "warning",
							"maxLength": 20,
							"minLength": 1,
							"pattern": "^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$"
						}
					},
					"stringmaxmin": {
						"manifestpath": "/temp/configuration/parameters/string/value",
						"type": "string",
						"translatable": false,
						"required": true,
						"placeholder": "MinMaxlength",
						"validation": {
							"type": "warning",
							"maxLength": 20,
							"minLength": 1
						},
						"hint": "Please refer to the <a href='https://www.sap.com'>documentation</a> lets see how this will behave if the text is wrapping to the next line and has <a href='https://www.sap.com'>two links</a>. good?"
					},
					"integerrequired": {
						"manifestpath": "/temp/configuration/parameters/integerrequired/value",
						"type": "integer",
						"translatable": false,
						"required": true
					},
					"integervalidation": {
						"manifestpath": "/temp/configuration/parameters/integer/value",
						"type": "integer",
						"visualization": {
							"type": "sap/m/Slider",
							"settings": {
								"value": "{currentSettings>value}",
								"min": 0,
								"max": 15,
								"width": "100%",
								"showAdvancedTooltip": true,
								"showHandleTooltip": false,
								"inputsAsTooltips": true,
								"enabled": "{currentSettings>editable}"
							}
						},
						"validations": [{
							"type": "warning",
							"validate": function (value) {
								return value !== 5;
							},
							"message": "5 might not be the best value"
						},
						{
							"type": "error",
							"validate": function (value) {
								return value > 5;
							},
							"message": function (value) {
								if (value <= 2) {
									return "value might not smaller than 2";
								}
								return "value might not smaller than 5";
							}
						},
						{
							"type": "error",
							"maximum": 9,
							"message": function (value) {
								if (value > 11) {
									return "value out of range 11";
								}
								return "Maximum is 9";
							}
						},
						{
							"type": "error",
							"minimum": 1,
							"exclusiveMinimum": true,
							"message": "Minimum is 2"
						},
						{
							"type": "error",
							"multipleOf": 2,
							"message": "Has to be multiple of 2"
						}]
					},
					"booleanvalidation1": {
						"manifestpath": "/temp/configuration/parameters/booleanvalidation1/value",
						"type": "boolean",
						"description": "description for boolean validation",
						"visualization": {
							"type": "sap/m/Switch",
							"settings": {
								"busy": "{currentSettings>_loading}",
								"state": "{currentSettings>value}",
								"customTextOn": "Yes",
								"customTextOff": "No",
								"enabled": "{currentSettings>editable}"
							}
						},
						"validations": [{
							"type": "error",
							"validate": function (value, config, context) {
								return context["requestData"]({
									"data": {
										"extension": {
											"method": "checkCanSeeCourses"
										},
										"path": "/values/canSeeCourses"
									}
								}).then(function (oData){
									if (oData === false && value === true) {
										context["control"].setState(false);
										return false;
									}
									return true;
								});
							},
							"message": "Do not have right to request data, disable it"
						}]
					},
					"booleanvalidation2": {
						"manifestpath": "/temp/configuration/parameters/booleanvalidation2/value",
						"type": "boolean",
						"validations": [{
							"type": "error",
							"validate": function (value, config, context) {
								return context["requestData"]({
									"data": {
										"extension": {
											"method": "checkCanSeeCourses"
										},
										"path": "/values/canSeeCourses"
									}
								}).then(function (oData){
									if (oData === false && value === true) {
										context["control"].setSelected(false);
										return false;
									}
									return true;
								});
							},
							"message": "Do not have right to request data, disable it"
						}]
					},
					"numberrequired": {
						"manifestpath": "/temp/configuration/parameters/number/value",
						"type": "number",
						"translatable": false,
						"required": true
					},
					"lists": {
						"type": "group",
						"label": "Value Selection"
					},
					"stringWithStaticList": {
						"manifestpath": "/temp/configuration/parameters/stringWithStaticList/value",
						"type": "string",
						"values": {
							"data": {
								"json": {
									"values": [
										{ "text": "text1", "key": "key1", "additionalText": "addtext1", "icon": "sap-icon://accept" },
										{ "text": "text2", "key": "key2", "additionalText": "addtext2", "icon": "sap-icon://cart" },
										{ "text": "text3", "key": "key3", "additionalText": "addtext3", "icon": "sap-icon://zoom-in" }
									]
								},
								"path": "/values"
							},
							"item": {
								"text": "{text}",
								"key": "{key}",
								"additionalText": "{additionalText}",
								"icon": "{icon}"
							}
						}
					},
					"stringWithRequestList": {
						"manifestpath": "/temp/configuration/parameters/stringWithRequestList/value",
						"type": "string",
						"values": {
							"data": {
								"request": {
									"url": "./stringWithRequestList.json"
								},
								"path": "/"
							},
							"item": {
								"text": "{text}",
								"key": "{key}",
								"additionalText": "{additionalText}",
								"icon": "{icon}"
							}
						}
					},
					"stringWithRequestExtensionList": {
						"manifestpath": "/temp/configuration/parameters/stringWithRequestExtensionList/value",
						"type": "string",
						"values": {
							"data": {
								"extension": {
									"method": "getData"
								},
								"path": "/values"
							},
							"item": {
								"text": "{trainer}",
								"key": "{title}",
								"additionalText": "{location}"
							}
						}
					},
					"stringWithDataFromExtensionList": {
						"manifestpath": "/temp/configuration/parameters/stringWithDataFromExtensionList/value",
						"type": "string",
						"values": {
							"item": {
								"text": "{trainer}",
								"key": "{title}",
								"additionalText": "{location}"
							},
							"path": "/values"
						}
					},
					"stringWithRequestFromDestinationList": {
						"manifestpath": "/temp/configuration/parameters/stringWithRequestDestinationList/value",
						"type": "string",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.local}}/stringWithRequestList.json"
								},
								"path": "/"
							},
							"item": {
								"text": "{text}",
								"key": "{key}",
								"additionalText": "{additionalText}",
								"icon": "{icon}"
							}
						}
					},
					"stringArray": {
						"manifestpath": "/temp/configuration/parameters/stringArray/value",
						"label": "String Array",
						"type": "string[]",
						"values": {
							"data": {
								"json": [
									{ "text": "text1", "key": "key1", "additionalText": "addtext1", "icon": "sap-icon://accept" },
									{ "text": "text2", "key": "key2", "additionalText": "addtext2", "icon": "sap-icon://cart" },
									{ "text": "text3", "key": "key3", "additionalText": "addtext3", "icon": "sap-icon://zoom-in" }
								],
								"path": "/"
							},
							"item": {
								"text": "{text}",
								"key": "{key}",
								"additionalText": "{additionalText}",
								"icon": "{icon}"
							}
						}
					},
					"stringArrayNoValues": {
						"manifestpath": "/temp/configuration/parameters/stringArrayNoValues/value",
						"label": "String Array With No Values",
						"type": "string[]"
					},
					"Customers": {
						"manifestpath": "/temp/configuration/parameters/Customers/value",
						"type": "string[]",
						"required": true,
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Customers",
									"parameters": {
										"$select": "CustomerID, CompanyName, Country, City, Address"
									}
								},
								"path": "/value"
							},
							"item": {
								"text": "{CompanyName}",
								"key": "{CustomerID}",
								"additionalText": "{= ${CustomerID} !== undefined ? ${Country} + ', ' +  ${City} + ', ' + ${Address} : ''}"
							}
						},
						"validations": [{
							"type": "error",
							"validate": function (value, config, context) {
								return context["requestData"]({
									"data": {
										"extension": {
											"method": "getMinLength"
										},
										"path": "/values/minLength"
									}
								}).then(function (minLength){
									if (value.length < minLength) {
										context["control"].setEditable(false);
										return {
											"isValid": false,
											"data": minLength
										};
									}
									return true;
								});
							},
							"message": function (value, config, minLength) {
								return "Please select at least " + minLength + " items!";
							}
						}]
					},
					"iconNotAllowFile": {
						"manifestpath": "/temp/configuration/parameters/iconNotAllowFile/src",
						"type": "string",
						"label": "Icon Not Allow File",
						"visualization": {
							"type": "IconSelect",
							"settings": {
								"value": "{currentSettings>value}",
								"editable": "{currentSettings>editable}",
								"allowFile": false
							}
						}
					},
					"iconNotAllowNone": {
						"manifestpath": "/temp/configuration/parameters/iconNotAllowNone/src",
						"type": "string",
						"label": "Icon Not Allow None",
						"visualization": {
							"type": "IconSelect",
							"settings": {
								"value": "{currentSettings>value}",
								"editable": "{currentSettings>editable}",
								"allowNone": false
							}
						}
					},
					"iconNotAllowFileAndNone": {
						"manifestpath": "/temp/configuration/parameters/iconNotAllowFileAndNone/src",
						"type": "string",
						"label": "Icon Not Allow File And None",
						"visualization": {
							"type": "IconSelect",
							"settings": {
								"value": "{currentSettings>value}",
								"editable": "{currentSettings>editable}",
								"allowFile": false,
								"allowNone": false
							}
						}
					},
					"iconWithImage": {
						"manifestpath": "/temp/configuration/parameters/iconWithImage/value",
						"type": "string",
						"label": "iconWithImage",
						"visualization": {
							"type": "IconSelect",
							"settings": {
								"value": "{currentSettings>value}",
								"editable": "{currentSettings>editable}"
							}
						}
					},
					"iconWithImageNotAllowNone": {
						"manifestpath": "/temp/configuration/parameters/iconWithImageNotAllowNone/value",
						"type": "string",
						"label": "iconWithImage Not Allow None",
						"visualization": {
							"type": "IconSelect",
							"settings": {
								"value": "{currentSettings>value}",
								"editable": "{currentSettings>editable}",
								"allowNone": false
							}
						}
					},
					"icon": {
						"manifestpath": "/temp/header/icon/src",
						"type": "string",
						"label": "Icon",
						"visualization": {
							"type": "IconSelect",
							"settings": {
								"value": "{currentSettings>value}",
								"editable": "{currentSettings>editable}"
							}
						}
					},
					"separator9": {
						"type": "separator",
						"line": true
					},
					"color": {
						"manifestpath": "/temp/header/icon/backgroundColor",
						"type": "string",
						"label": "Icon Background",
						"description": "Description",
						"visualization": {
							"type": "ColorSelect",
							"settings": {
								"enumValue": "{currentSettings>value}",
								"editable": "{currentSettings>editable}"
							}
						},
						"cols": 1
					},
					"shape": {
						"manifestpath": "/temp/header/icon/shape",
						"label": "Icon Shape",
						"type": "string",
						"description": "Description",
						"visualization": {
							"type": "ShapeSelect",
							"settings": {
								"value": "{currentSettings>value}",
								"editable": "{currentSettings>editable}"
							}
						},
						"cols": 1
					},
					"separator10": {
						"type": "separator",
						"line": true
					},
					"color1": {
						"manifestpath": "/temp/header/icon/backgroundColor",
						"type": "string",
						"description": "Description",
						"label": "Icon Background",
						"visualization": {
							"type": "ColorSelect",
							"settings": {
								"enumValue": "{currentSettings>value}",
								"editable": "{currentSettings>editable}"
							}
						},
						"cols": 1
					},
					"boolean2": {
						"manifestpath": "/temp/configuration/parameters/boolean2/value",
						"type": "boolean",
						"description": "Description",
						"label": "long long long long long long long long long long label",
						"visualization": {
							"type": "sap/m/Switch",
							"settings": {
								"state": "{currentSettings>value}",
								"customTextOn": "Yes",
								"customTextOff": "No",
								"enabled": "{currentSettings>editable}"
							}
						},
						"cols": 1
					},
					"separator11": {
						"type": "separator",
						"line": true
					},
					"maxItems": {
						"manifestpath": "/temp/content/maxItems",
						"type": "integer",
						"visualization": {
							"type": "sap/m/Slider",
							"settings": {
								"value": "{currentSettings>value}",
								"min": 0,
								"max": 10,
								"width": "100%",
								"showAdvancedTooltip": true,
								"showHandleTooltip": false,
								"inputsAsTooltips": true,
								"enabled": "{currentSettings>editable}"
							}
						}
					},
					"color2": {
						"manifestpath": "/temp/header/icon/backgroundColor",
						"type": "string",
						"description": "Description",
						"label": "Icon Background",
						"visualization": {
							"type": "ColorSelect",
							"settings": {
								"enumValue": "{currentSettings>value}",
								"editable": "{currentSettings>editable}"
							}
						},
						"cols": 1
					},
					"group": {
						"label": "Dependent",
						"type": "group"
					},
					"string1": {
						"manifestpath": "/temp/configuration/parameters/string1/value",
						"label": "String: editable, visible, label",
						"type": "string",
						"translatable": true
					},
					"dependentString1": {
						"manifestpath": "/temp/configuration/parameters/dependentString1/value",
						"type": "string",
						"editable": "{= ${items>string1/value} === 'editable'}"
					},
					"dependentString2": {
						"manifestpath": "/temp/configuration/parameters/dependentString2/value",
						"type": "string",
						"visible": "{= ${items>string1/value} === 'visible'}"
					},
					"dependentString3": {
						"manifestpath": "/temp/configuration/parameters/dependentString3/value",
						"label": "{= ${items>string1/value} === 'label'? 'dependentString3 True' : 'dependentString3 False' }",
						"type": "string"
					},
					"integer1": {
						"manifestpath": "/temp/configuration/parameters/integer1/value",
						"type": "integer",
						"label": "Integer: 1, 3, 6, 9"
					},
					"dependentInteger1": {
						"manifestpath": "/temp/configuration/parameters/dependentInteger1/value",
						"type": "string",
						"editable": "{= ${items>integer1/value} > 2}"
					},
					"dependentInteger2": {
						"manifestpath": "/temp/configuration/parameters/dependentInteger1/value",
						"type": "string",
						"visible": "{= ${items>integer1/value} > 5}"
					},
					"dependentInteger3": {
						"manifestpath": "/temp/configuration/parameters/dependentInteger3/value",
						"label": "{= ${items>integer1/value} > 8 ? 'dependentInteger3 True' : 'dependentInteger3 False' }",
						"type": "string"
					},
					"boolean1": {
						"manifestpath": "/temp/configuration/parameters/boolean1/value",
						"type": "boolean",
						"label": "long long long long long long long long long long label",
						"visualization": {
							"type": "sap/m/Switch",
							"settings": {
								"state": "{currentSettings>value}",
								"customTextOn": "Yes",
								"customTextOff": "No",
								"enabled": "{currentSettings>editable}"
							}
						}
					},
					"dependentBoolean1": {
						"manifestpath": "/temp/configuration/parameters/dependentBoolean1/value",
						"type": "string",
						"editable": "{items>boolean1/value}"
					},
					"dependentBoolean2": {
						"manifestpath": "/temp/configuration/parameters/dependentBoolean2/value",
						"type": "string",
						"visible": "{items>boolean1/value}"
					},
					"dependentBoolean3": {
						"manifestpath": "/temp/configuration/parameters/dependentBoolean3/value",
						"label": "{= ${items>boolean1/value} === true ? 'dependentBoolean3 True' : 'dependentBoolean3 False' }",
						"type": "string"
					},
					"CustomerWithVisibleDependent": {
						"manifestpath": "/temp/configuration/parameters/CustomerWithVisibleDependent/value",
						"type": "string",
						"visible": "{items>boolean1/value}",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.aaa}}/Customers"
								},
								"path": "/value"
							},
							"item": {
								"text": "{CompanyName}",
								"key": "{CustomerID}",
								"additionalText": "{= ${CustomerID} !== undefined ? ${Country} + ', ' +  ${City} + ', ' + ${Address} : ''}"
							}
						}
					},
					"filterBackendInStringArray": {
						"label": "Filter backend by input in MultiComboBox",
						"type": "group"
					},
					"CustomersWithMultiKeys": {
						"manifestpath": "/temp/configuration/parameters/CustomersWithMultiKeys/value",
						"type": "string[]",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Customers",
									"parameters": {
										"$select": "CustomerID, CompanyName, Country, City, Address",
										"$filter": "startswith(CompanyName,'{currentSettings>suggestValue}')"
									}
								},
								"path": "/value"
							},
							"item": {
								"text": "{CompanyName}",
								"key": "{CustomerID}/{CompanyName}",
								"additionalText": "{= ${CustomerID} !== undefined ? ${Country} + ', ' +  ${City} + ', ' + ${Address} : ''}"
							},
							"keySeparator": "/"
						},
						"validations": [{
							"type": "error",
							"validate": function (value, config, context) {
								return context["requestData"]({
									"data": {
										"request": {
											"url": "{{destinations.northwind}}/Customers",
											"parameters": {
												"$select": "CustomerID, CompanyName, Country, City, Address"
											}
										},
										"path": "/value"
									}
								}).then(function (oData){
									if (value.length === 6) {
										return false;
									}
									return true;
								});
							},
							"message": function (value, config) {
								return "Please do not select 6 items!";
							}
						}, {
							"type": "error",
							"minLength": 2,
							"maxLength": 4
						}]
					},
					"CustomersWithMultiKeysAndSeperator": {
						"manifestpath": "/temp/configuration/parameters/CustomersWithMultiKeysAndSeperator/value",
						"type": "string[]",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Customers",
									"parameters": {
										"$select": "CustomerID, CompanyName, Country, City, Address",
										"$filter": "startswith(CompanyName,'{currentSettings>suggestValue}')"
									}
								},
								"path": "/value"
							},
							"item": {
								"text": "{CompanyName}",
								"key": "{CustomerID}#{CompanyName}",
								"additionalText": "{= ${CustomerID} !== undefined ? ${Country} + ', ' +  ${City} + ', ' + ${Address} : ''}"
							}
						}
					},
					"CustomersWithFilterParameter": {
						"manifestpath": "/temp/configuration/parameters/CustomersWithFilterParameter/value",
						"type": "string[]",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Customers",
									"parameters": {
										"$select": "CustomerID, CompanyName, Country, City, Address",
										"$filter": "startswith(CompanyName,'{currentSettings>suggestValue}')"
									}
								},
								"path": "/value"
							},
							"item": {
								"text": "{CompanyName}",
								"key": "{CustomerID}",
								"additionalText": "{= ${CustomerID} !== undefined ? ${Country} + ', ' +  ${City} + ', ' + ${Address} : ''}"
							}
						}
					},
					"CustomersWithFilterInURL": {
						"manifestpath": "/temp/configuration/parameters/CustomersWithFilterInURL/value",
						"type": "string[]",
						"translatable": true,
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Customers?$select=CustomerID, CompanyName, Country, City, Address&$filter=contains(CompanyName,'{currentSettings>suggestValue}')"
								},
								"path": "/value"
							},
							"item": {
								"text": "{CompanyName}",
								"key": "{CustomerID}",
								"additionalText": "{= ${CustomerID} !== undefined ? ${Country} + ', ' +  ${City} + ', ' + ${Address} : ''}"
							}
						}
					},
					"filterBackendInString": {
						"label": "Filter backend by input in ComboBox",
						"type": "group"
					},
					"CustomerWithFilterParameter": {
						"manifestpath": "/temp/configuration/parameters/CustomerWithFilterParameter/value",
						"label": "Customer with filter parameter",
						"type": "string",
						"translatable": true,
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Customers",
									"parameters": {
										"$select": "CustomerID, CompanyName, Country, City, Address",
										"$filter": "contains(CompanyName,'{currentSettings>suggestValue}')"
									}
								},
								"path": "/value"
							},
							"item": {
								"text": "{CompanyName}",
								"key": "{CustomerID}",
								"additionalText": "{= ${CustomerID} !== undefined ? ${Country} + ', ' +  ${City} + ', ' + ${Address} : ''}"
							}
						}
					},
					"CustomerWithFilterInURL": {
						"manifestpath": "/temp/configuration/parameters/CustomerWithFilterInURL/value",
						"type": "string",
						"translatable": true,
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Customers?$select=CustomerID, CompanyName, Country, City, Address&$filter=contains(CompanyName,'{currentSettings>suggestValue}')"
								},
								"path": "/value"
							},
							"item": {
								"text": "{CompanyName}",
								"key": "{CustomerID}",
								"additionalText": "{= ${CustomerID} !== undefined ? ${Country} + ', ' +  ${City} + ', ' + ${Address} : ''}"
							}
						}
					},
					"linkedParameters": {
						"label": "Linked Parameters",
						"type": "group"
					},
					"Customer": {
						"manifestpath": "/temp/configuration/parameters/Customer/value",
						"type": "string",
						"translatable": true,
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Customers",
									"parameters": {
										"$select": "CustomerID, CompanyName, Country, City, Address"
									}
								},
								"path": "/value"
							},
							"item": {
								"text": "{CompanyName}",
								"key": "{CustomerID}",
								"additionalText": "{= ${CustomerID} !== undefined ? ${Country} + ', ' +  ${City} + ', ' + ${Address} : ''}"
							}
						}
					},
					"Employee": {
						"manifestpath": "/temp/configuration/parameters/Employee/value",
						"type": "string",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Employees",
									"parameters": {
										"$select": "EmployeeID, FirstName, LastName, Country, Title, HomePhone"
									}
								},
								"path": "/value"
							},
							"item": {
								"text": "{FirstName} {LastName}",
								"key": "{EmployeeID}",
								"additionalText": "{= ${EmployeeID} !== undefined ? ${Country} + ', ' +  ${Title} + ', ' + ${HomePhone} : ''}"
							}
						}
					},
					"Order": {
						"manifestpath": "/temp/configuration/parameters/Order/value",
						"type": "string",
						"translatable": true,
						"required": true,
						"validation": {
							"type": "warning",
							"maxLength": 4,
							"minLength": 1
						},
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Orders",
									"parameters": {
										"$select": "OrderID, OrderDate, CustomerID, EmployeeID",
										"$filter": "(CustomerID eq '{items>Customer/value}') and (EmployeeID eq {items>Employee/value})"
									}
								},
								"path": "/value"
							},
							"item": {
								"text": "{= ${OrderID} !== undefined ? ${OrderID} + '-' +  ${CustomerID} + '-' + ${EmployeeID} : ''}",
								"key": "{OrderID}",
								"additionalText": "{OrderDate}"
							}
						}
					},
					"Product": {
						"manifestpath": "/temp/configuration/parameters/Product/value",
						"type": "string",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Order_Details",
									"parameters": {
										"$expand": "Product",
										"$filter": "OrderID eq {items>Order/value}"
									}
								},
								"path": "/value"
							},
							"item": {
								"text": "{= ${OrderID} !== undefined ? ${OrderID} + '-' +  ${ProductID} + ':' + ${Product/ProductName} : ''}",
								"key": "{ProductID}",
								"additionalText": "{= ${OrderID} !== undefined ? ${UnitPrice} + ' USD, count: '+ ${Quantity} : ''}"
							}
						}
					},
					"Orders": {
						"manifestpath": "/temp/configuration/parameters/Orders/value",
						"type": "string[]",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Orders",
									"parameters": {
										"$select": "OrderID, OrderDate, CustomerID, EmployeeID",
										"$filter": "(CustomerID eq '{items>Customer/value}') and (EmployeeID eq {items>Employee/value})"
									}
								},
								"path": "/value"
							},
							"item": {
								"text": "{= ${OrderID} !== undefined ? ${OrderID} + '-' +  ${CustomerID} + '-' + ${EmployeeID} : ''}",
								"key": "{OrderID}",
								"additionalText": "{OrderDate}"
							}
						}
					},
					"CustomerWithTopAndSkipOption": {
						"manifestpath": "/temp/configuration/parameters/CustomerWithTopAndSkipOption/value",
						"type": "string",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Customers",
									"parameters": {
										"$select": "CustomerID, CompanyName, Country, City, Address",
										"$skip": "5",
										"$top": "5"
									}
								},
								"path": "/value"
							},
							"item": {
								"text": "{CompanyName}",
								"key": "{CustomerID}",
								"additionalText": "{= ${CustomerID} !== undefined ? ${Country} + ', ' +  ${City} + ', ' + ${Address} : ''}"
							}
						}
					}
				}
			},
			"preview": {
				"modes": "LiveAbstract"
			}
		});
	};
});
