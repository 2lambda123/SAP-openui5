sap.ui.define(["sap/ui/core/HTML", "sap/m/Panel", "sap/m/TimePicker", "sap/m/Label", "sap/m/App", "sap/m/Page", "sap/ui/core/library"], function(HTML, Panel, TimePicker, Label, App, Page, coreLibrary) {
	"use strict";

	var TitleLevel = coreLibrary.TitleLevel;

	/*
	TimePicker inherits two artifacts that hold useful information which can be used as a WAI-ARIA label or description - placeholder and tooltip.
	To do this, we need to render a hidden span element with a value that is the same with the value of the corresponding artifact (if present) and associate it
	by adding its ID to one of its "aria-labelledby" or "aria-describedby" DOM attributes. We also have into consideration that its "displayFormat" pattern is
	assigned as a default placeholder if no placeholder value is set by the application developer.

	In addition, it can also be referenced with external label like any other Input control either by using the "labelFor" association of the given label or
	by using its own "ariaLabelledBy" association. By design, it has an ARIA custom string role which is also rendered as a hidden child span element
	with particular ID and added to its "aria-describedby" DOM attribute.

	So here are all possible reference combinations.
	|===============================================================================================================================================================|
	|	TP is labelled by other label(X)		|		Placeholder		|	 Tooltip 	|	ariaDescribedBy			|			ariaLabelledBy 						|
	|===============================================================================================================================================================|
	1						no					|		yes (default)	|		no		|	"TimePicker"			|		default placeholder						|
	2						no					|			yes			|		no		|	"TimePicker"			|		custom placeholder						|
	3						no					|		yes (default)	|		yes		|	"TimePicker" tooltip	|		default placeholder						|
	4						no					|			yes			|		yes		|	"TimePicker" tooltip	|		custom placeholder						|
	5						yes					|			yes			|		yes		|	"TimePicker" tooltip	|		X + custom placeholder					|
	6						yes					|			yes			|		no		|	"TimePicker"			|		X + custom placeholder					|
	7						yes					|		yes (default)	|		yes		|	"TimePicker" tooltip	|		X + default placeholder					|
	8						yes					|		yes (default)	|		no		|	"TimePicker"			|		X + default placeholder					|
	*/
	var aScenarios = [
		/* External labelling, Custom Placeholder, Custom Tooltip */
		[false, false, false],
		[false, true, false],
		[false, false, true],
		[false, true, true],
		[true, true, true],
		[true, true, false],
		[true, false, true],
		[true, false, false]
	];
	function generateScenarios() {
		var aPageContent = [
				new HTML({
					content: "<h2>Test case description</h2><p>TimePicker inherits two artifacts that hold useful information which can be used as a WAI-ARIA label or description - placeholder and tooltip.\n" +
					"\t\t\tTo do this, we need to render a hidden span element with a value that is the same with the value of the corresponding artifact (if present) and associate it\n" +
					"\t\t\tby adding its ID to one of its \"aria-labelledby\" or \"aria-describedby\" DOM attributes. We also have into consideration that its \"displayFormat\" pattern is\n" +
					"\t\t\tassigned as a default placeholder if no placeholder value is set by the application developer.\n" +
					"\n" +
					"\t\t\tIn addition, it can also be referenced with external label like any other Input control either by using the \"labelFor\" association of the given label or\n" +
					"\t\t\tby using its own \"ariaLabelledBy\" association. By design, it has an ARIA custom string role which is also rendered as a hidden child span element\n" +
					"\t\t\twith particular ID and added to its \"aria-describedby\" DOM attribute.\n" +
					"\n" +
					"\t\t\tSo here are all possible reference combinations.</p><h3>Expectation table</h3>"
				}),
				new HTML({
					content: "<table><thead><tr><th>TP is labelled by other label(X)</th><th>Placeholder</th><th>Tooltip</th><th>ariaDescribedBy</th><th>ariaLabelledBy</th></tr></thead><tbody><tr><td>no</td><td>yes (default)</td><td>no</td><td>\"TimePicker\"</td><td>default placeholder</td></tr><tr><td>no</td><td>yes</td><td>no</td><td>\"TimePicker\"</td><td>custom placeholder</td></tr><tr><td>no</td><td>yes (default)</td><td>yes</td><td>\"TimePicker\" + tooltip</td><td>default placeholder</td></tr><tr><td>no</td><td>yes</td><td>yes</td><td>\"TimePicker\" + tooltip</td><td>custom placeholder</td></tr><tr><td>yes</td><td>yes</td><td>yes</td><td>\"TimePicker\" + tooltip</td><td>X + default placeholder</td></tr><tr><td>yes</td><td>yes</td><td>no</td><td>\"TimePicker\"</td><td>X + default placeholder</td></tr><tr><td>yes</td><td>yes (default)</td><td>yes</td><td>\"TimePicker\" + tooltip</td><td>X + custom placeholder</td></tr><tr><td>yes</td><td>yes (default)</td><td>no</td><td>\"TimePicker\"</td><td>X + custom placeholder</td></tr></tbody></table></br></br>"
				})
			],
			fnGenarateCombinationDescription = function (aCombination) {
				return "External labelling: " + aCombination[0] + "; "
					+ " Custom Placeholder: " + aCombination[1] + "; "
					+ " Custom Tooltip: " + aCombination[2];
			};
		aScenarios.forEach(function (aCombination) {
			var oPanel = new Panel({
				width: "auto",
				accessibleRole: "Region",
				headerText: fnGenarateCombinationDescription(aCombination)
			});
			var oTimePicker = new TimePicker();

			aCombination.forEach(function (bSimulate, iIndex) {
				if (bSimulate) {
					switch (iIndex) {
						case 0:
							oPanel.addContent(new Label({
								text: "When did you get up today?",
								labelFor: oTimePicker
							}));
							break;
						case 1:
							oTimePicker.setPlaceholder("Enter time");
							break;
						case 2:
							oTimePicker.setTooltip("Enter your local time");
							break;
						default:
							break;
					}
				}
			});
			oPanel.addContent(oTimePicker);
			aPageContent.push(oPanel);
		});
		return aPageContent;
	}
	new App({
		pages: [
			new Page({
				enableScrolling: false,
				title: "TimePicker accessibility example",
				titleLevel: TitleLevel.H1,
				content: generateScenarios()
			})
		]
	}).placeAt("content");
});
