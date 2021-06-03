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
					"cardTitle": {
						"manifestpath": "/sap.card/configuration/parameters/cardTitle/value",
						"type": "string",
						"translatable": true,
						"required": true,
						"allowDynamicValues": true,
						"editableToUser": false,
						"visibleToUser": false
					},
					"separator1": {
						"type": "separator"
					},
					"string": {
						"manifestpath": "/sap.card/configuration/parameters/string/value",
						"type": "string",
						"label": "String Label",
						"translatable": true,
						"required": true,
						"editableToUser": false
					},
					"stringWithTranslatedValue": {
						"manifestpath": "/sap.card/configuration/parameters/stringWithTranslatedValue/value",
						"type": "string",
						"label": "{i18n>TRANSLATED_STRING_LABEL}",
						"translatable": true,
						"allowDynamicValues": false
					},
					"stringWithTranslatedValueIni18nFormat": {
						"manifestpath": "/sap.card/configuration/parameters/stringWithTranslatedValueIni18nFormat/value",
						"type": "string",
						"label": "String with translated value in i18n format",
						"description": "A very long description text that should wrap into the next line"
					},
					"separator2": {
						"type": "separator"
					},
					"stringInCols1": {
						"manifestpath": "/sap.card/configuration/parameters/stringInCols1/value",
						"label": "Column 1",
						"description": "Two columns in the same line",
						"type": "string",
						"cols": 1,
						"allowSettings": false,
						"translatable": true
					},
					"stringInCols2": {
						"manifestpath": "/sap.card/configuration/parameters/stringInCols2/value",
						"label": "Column 2",
						"type": "string",
						"cols": 1,
						"allowSettings": false
					},
					"separator3": {
						"type": "separator"
					},
					"integerLabel": {
						"manifestpath": "/sap.card/configuration/parameters/integerLabel/value",
						"type": "integer",
						"label": "Direct Integer Label"
					},
					"integer": {
						"manifestpath": "/sap.card/configuration/parameters/integer/value",
						"type": "integer",
						"label": "Integer with Slider",
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
					"separator4": {
						"type": "separator"
					},
					"number": {
						"manifestpath": "/sap.card/configuration/parameters/number/value",
						"type": "number",
						"label": "{i18n>TRANSLATED_NUMBER_LABEL}"
					},
					"separator5": {
						"type": "separator"
					},
					"booleanLabel": {
						"manifestpath": "/sap.card/configuration/parameters/booleanLabel/value",
						"label": "Boolean",
						"type": "boolean"
					},
					"boolean": {
						"manifestpath": "/sap.card/configuration/parameters/boolean/value",
						"description": "Description",
						"label": "Boolean with Switch",
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
					"separator6": {
						"type": "separator"
					},
					"date": {
						"manifestpath": "/sap.card/configuration/parameters/date/value",
						"type": "date",
						"label": "Date"
					},
					"dateTime": {
						"manifestpath": "/sap.card/configuration/parameters/dateTime/value",
						"type": "datetime",
						"label": "Date Time"
					},
					"separator7": {
						"type": "separator"
					},
					"enum": {
						"manifestpath": "/sap.card/configuration/parameters/enum/value",
						"label": "Enumerations",
						"type": "enum",
						"enum": [
							"Option A",
							"Option B",
							"Option C"
						]
					},
					"lists": {
						"type": "group",
						"label": "Value Selection"
					},
					"stringWithStaticList": {
						"manifestpath": "/sap.card/configuration/parameters/stringWithStaticList/value",
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
						"manifestpath": "/sap.card/configuration/parameters/stringWithRequestList/value",
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
					"stringArray": {
						"manifestpath": "/sap.card/configuration/parameters/stringArray/value",
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
						"manifestpath": "/sap.card/configuration/parameters/stringArrayNoValues/value",
						"label": "String Array With Request List",
						"type": "string[]"
					},
					"Customers": {
						"manifestpath": "/sap.card/configuration/parameters/Customers/value",
						"type": "string[]",
						"label": "String Array With No Values",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.Northwind_V3}}/Customers",
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
					"iconNotAllowFile": {
						"manifestpath": "/sap.card/configuration/parameters/iconNotAllowFile/src",
						"type": "string",
						"label": "Icon Selectioin",
						"visualization": {
							"type": "IconSelect",
							"settings": {
								"value": "{currentSettings>value}",
								"editable": "{currentSettings>editable}",
								"allowFile": false,
								"allowNone": true
							}
						}
					},
					"iconWithImageNotAllowNone": {
						"manifestpath": "/sap.card/configuration/parameters/iconWithImageNotAllowNone/value",
						"type": "string",
						"label": "icon Selected from File",
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
						"manifestpath": "/sap.card/header/icon/src",
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
					"color": {
						"manifestpath": "/sap.card/header/icon/backgroundColor",
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
						"manifestpath": "/sap.card/header/icon/shape",
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
					"group": {
						"label": "Dependent",
						"type": "group"
					},
					"stringDependent": {
						"manifestpath": "/sap.card/configuration/parameters/stringDependent/value",
						"label": "String: editable, visible, label",
						"type": "string",
						"translatable": true
					},
					"dependentString1": {
						"manifestpath": "/sap.card/configuration/parameters/dependentString1/value",
						"type": "string",
						"label": "{= ${items>stringDependent/value} === 'label'? 'stringDependent True' : 'stringDependent False' }",
						"editable": "{= ${items>stringDependent/value} === 'editable'}",
						"visible": "{= ${items>stringDependent/value} === 'visible'}"
					},
					"integerDependent": {
						"manifestpath": "/sap.card/configuration/parameters/integerDependent/value",
						"type": "integer",
						"label": "Integer: 1, 3, 6, 9"
					},
					"dependentInteger1": {
						"manifestpath": "/sap.card/configuration/parameters/dependentInteger1/value",
						"type": "string",
						"label": "{= ${items>integerDependent/value} > 8 ? 'integerDependent True' : 'integerDependent False' }",
						"editable": "{= ${items>integerDependent/value} > 5}",
						"visible": "{= ${items>integerDependent/value} > 2}"
					},
					"booleanDependent": {
						"manifestpath": "/sap.card/configuration/parameters/booleanDependent/value",
						"type": "boolean",
						"label": "Boolean",
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
						"manifestpath": "/sap.card/configuration/parameters/dependentBoolean1/value",
						"type": "string",
						"label": "{= ${items>booleanDependent/value} === true ? 'booleanDependent True' : 'booleanDependent False' }",
						"editable": "{items>booleanDependent/value}",
						"visible": "{items>booleanDependent/value}"
					}
				}
			},
			"preview": {
				"modes": "LiveAbstract"
			}
		});
	};
});
