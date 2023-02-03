sap.ui.define(function() {
	"use strict";
	return {
		name: "QUnit TestSuite for sap.ui.webc.main",
		defaults: {
			group: "Default",
			qunit: {
				version: "edge"
			},
			sinon: {
				version: 4
			},
			ui5: {
				language: "en",
				rtl: false,
				libs: ["sap.ui.webc.main"],
				"xx-waitForTheme": true
			},
			coverage: {
				only: ["sap/ui/webc/main"]
			},
			loader: {
				paths: {
					"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/",
					"qunit": "test-resources/sap/ui/webc/main/qunit/"
				}
			},
			runAfterLoader: "qunit/ResizeObserverErrorHandler",
			page: "test-resources/sap/ui/webc/main/qunit/testsandbox.qunit.html?test={name}",
			autostart: true
		},
		tests: {

			"Avatar": {
				coverage: {
					only: ["sap/ui/webc/main/Avatar"]
				}
			},

			"AvatarGroup": {
				coverage: {
					only: ["sap/ui/webc/main/AvatarGroup"]
				}
			},

			"Badge": {
				coverage: {
					only: ["sap/ui/webc/main/Badge"]
				}
			},

			"Breadcrumbs": {
				coverage: {
					only: ["sap/ui/webc/main/Breadcrumbs"]
				}
			},

			"BusyIndicator": {
				coverage: {
					only: ["sap/ui/webc/main/BusyIndicator"]
				}
			},

			"Button": {
				coverage: {
					only: ["sap/ui/webc/main/Button"]
				}
			},

			"Calendar": {
				coverage: {
					only: ["sap/ui/webc/main/Calendar"]
				}
			},

			"Card": {
				coverage: {
					only: ["sap/ui/webc/main/Card"]
				}
			},

			"CardHeader": {
				coverage: {
					only: ["sap/ui/webc/main/CardHeader"]
				}
			},

			"Carousel": {
				coverage: {
					only: ["sap/ui/webc/main/Carousel"]
				}
			},

			"CheckBox": {
				coverage: {
					only: ["sap/ui/webc/main/CheckBox"]
				}
			},

			"ColorPalette": {
				coverage: {
					only: ["sap/ui/webc/main/ColorPalette"]
				}
			},

			"ColorPicker": {
				coverage: {
					only: ["sap/ui/webc/main/ColorPicker"]
				}
			},

			"ComboBox": {
				coverage: {
					only: ["sap/ui/webc/main/ComboBox"]
				}
			},

			"DatePicker": {
				coverage: {
					only: ["sap/ui/webc/main/DatePicker"]
				}
			},

			"DateRangePicker": {
				coverage: {
					only: ["sap/ui/webc/main/DateRangePicker"]
				}
			},

			"DateTimePicker": {
				coverage: {
					only: ["sap/ui/webc/main/DateTimePicker"]
				}
			},

			"Dialog": {
				coverage: {
					only: ["sap/ui/webc/main/Dialog"]
				}
			},

			"FileUploader": {
				coverage: {
					only: ["sap/ui/webc/main/FileUploader"]
				}
			},

			"Icon": {
				coverage: {
					only: ["sap/ui/webc/main/Icon"]
				}
			},

			"Input": {
				coverage: {
					only: ["sap/ui/webc/main/Input"]
				}
			},

			"Label": {
				coverage: {
					only: ["sap/ui/webc/main/Label"]
				}
			},

			"Link": {
				coverage: {
					only: ["sap/ui/webc/main/Link"]
				}
			},

			"List": {
				coverage: {
					only: ["sap/ui/webc/main/List"]
				}
			},

			"MessageStrip": {
				coverage: {
					only: ["sap/ui/webc/main/MessageStrip"]
				}
			},

			"MultiComboBox": {
				coverage: {
					only: ["sap/ui/webc/main/MultiComboBox"]
				}
			},

			"MultiInput": {
				coverage: {
					only: ["sap/ui/webc/main/MultiInput"]
				}
			},

			"Panel": {
				coverage: {
					only: ["sap/ui/webc/main/Panel"]
				}
			},

			"Popover": {
				coverage: {
					only: ["sap/ui/webc/main/Popover"]
				}
			},

			"ProgressIndicator": {
				coverage: {
					only: ["sap/ui/webc/main/ProgressIndicator"]
				}
			},

			"RadioButton": {
				coverage: {
					only: ["sap/ui/webc/main/RadioButton"]
				}
			},

			"RangeSlider": {
				coverage: {
					only: ["sap/ui/webc/main/RangeSlider"]
				}
			},

			"RatingIndicator": {
				coverage: {
					only: ["sap/ui/webc/main/RatingIndicator"]
				}
			},

			"ResponsivePopover": {
				coverage: {
					only: ["sap/ui/webc/main/ResponsivePopover"]
				}
			},

			"SegmentedButton": {
				coverage: {
					only: ["sap/ui/webc/main/SegmentedButton"]
				}
			},

			"Select": {
				coverage: {
					only: ["sap/ui/webc/main/Select"]
				}
			},

			"Slider": {
				coverage: {
					only: ["sap/ui/webc/main/Slider"]
				}
			},

			"StepInput": {
				coverage: {
					only: ["sap/ui/webc/main/StepInput"]
				}
			},

			"Switch": {
				coverage: {
					only: ["sap/ui/webc/main/Switch"]
				}
			},

			"TabContainer": {
				coverage: {
					only: ["sap/ui/webc/main/TabContainer"]
				}
			},

			"Table": {
				coverage: {
					only: ["sap/ui/webc/main/Table"]
				}
			},

			"TextArea": {
				coverage: {
					only: ["sap/ui/webc/main/TextArea"]
				}
			},

			"TimePicker": {
				coverage: {
					only: ["sap/ui/webc/main/TimePicker"]
				}
			},

			"Title": {
				coverage: {
					only: ["sap/ui/webc/main/Title"]
				}
			},

			"Toast": {
				coverage: {
					only: ["sap/ui/webc/main/Toast"]
				}
			},

			"Tree": {
				coverage: {
					only: ["sap/ui/webc/main/Tree"]
				}
			}
		}
	};
});