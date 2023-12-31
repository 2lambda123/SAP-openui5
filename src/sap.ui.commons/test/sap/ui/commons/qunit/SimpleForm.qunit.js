/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/form/SimpleForm",
	"sap/ui/commons/form/ResponsiveLayout",
	"sap/ui/commons/form/GridLayout",
	"sap/ui/commons/Title",
	"sap/ui/commons/Label",
	"sap/ui/commons/TextField",
	"sap/ui/commons/CheckBox",
	"sap/ui/commons/TextArea",
	"sap/ui/commons/layout/ResponsiveFlowLayoutData",
	"sap/ui/layout/form/GridContainerData",
	"sap/ui/layout/form/GridElementData",
	"sap/ui/commons/library"
], function(
	createAndAppendDiv,
	SimpleForm,
	ResponsiveLayout,
	GridLayout,
	Title,
	Label,
	TextField,
	CheckBox,
	TextArea,
	ResponsiveFlowLayoutData,
	GridContainerData,
	GridElementData,
	commonsLibrary
) {
	"use strict";

	// shortcut for sap.ui.commons.form
	var form = commonsLibrary.form;

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2", "uiArea3"]);


	var oSimpleForm = new SimpleForm(
			"sf1",
			{
				minWidth : 1024,
				maxContainerCols: 2,
				content:[
						new Title("title1",{text:"Title 1"}),
					new Label("L1",{text:"Label 1"}),
					new TextField("tf1",{value:"Value 1"}),
					new Label("L2",{text:"Label 2"}),
					new TextField("tf2",{value:"Value 2/1"}),
					new TextField("tf3",{value:"Value 2/2"}),
					new Label("L3",{text:"Label 3"}),
					new TextField("tf4",{value:"Value 3/1"}),
					new TextField("tf5",{value:"Value 3/2"}),
					new TextField("tf6",{value:"Value 3/3"}),
					new Label({text:"Label 4"}),
					new CheckBox({checked:false}),
					new Label({text:"Label 5"}),
					new TextArea({value:"Long Text,Long Text,Long Text,Long Text,Long TextLong Text,Long TextLong Text,Long TextLong TextLong TextLong TextLong TextLong TextLong TextLong TextLong TextLong TextLong TextLong TextLong TextLong Text"}),
					new Title("title2",{text:"Title 2"}),
					new Label("L2-1",{text:"Label 1"}),
					new TextField("tf2-1",{value:"Value 1"}),
					new Label("L2-2",{text:"Label 2"}),
					new TextField("tf2-2",{value:"Value 2/1"}),
					new TextField("tf2-3",{value:"Value 2/2", layoutData:new ResponsiveFlowLayoutData("LD_tf2-3", {linebreak:true,weight:8})}),
					new Label("L2-3",{text:"Label 3"}),
					new TextField("tf2-4",{value:"Value 3/1", layoutData:new ResponsiveFlowLayoutData("LD_tf2-4", {weight:3})}),
					new TextField("tf2-5",{value:"Value 3/2"}),
					new TextField("tf2-6",{value:"Value 3/3"})
				]
			}).placeAt("uiArea1");

	var oSimpleForm2 = new SimpleForm(
			"sf2",
			{
				minWidth : 1024,
				maxContainerCols: 2,
				layout: form.SimpleFormLayout.GridLayout,
				content:[
						new Title("SF2-title1",{text:"Title 1"}),
					new Label("SF2-L1",{text:"Label 1"}),
					new TextField("SF2-tf1",{value:"Value 1"}),
					new Label("SF2-L2",{text:"Label 2"}),
					new TextField("SF2-tf2",{value:"Value 2/1"}),
					new TextField("SF2-tf3",{value:"Value 2/2"}),
					new Title("SF2-title2",{text:"Title 2"}),
					new Label("SF2-L2-1",{text:"Label 1"}),
					new TextField("SF2-tf2-1",{value:"Value 1"}),
					new Label("SF2-L2-2",{text:"Label 2"}),
					new TextField("SF2-tf2-2",{value:"Value 2/1"}),
					new TextField("SF2-tf2-3",{value:"Value 2/2", layoutData:new ResponsiveFlowLayoutData("SF2-LD_tf2-3", {linebreak:true,weight:8})})
				]
			}).placeAt("uiArea2");

	var oSimpleForm3 = new SimpleForm(
			"sf3",
			{
				minWidth : 1024,
				maxContainerCols: 2,
				content:[
						new Title("SF3-title1",{text:"Title 1"}),
					new Label("SF3-L1",{text:"Label 1"}),
					new TextField("SF3-tf1",{value:"Value 1"}),
					new Label("SF3-L2",{text:"Label 2"}),
					new TextField("SF3-tf2",{value:"Value 2/1"}),
					new TextField("SF3-tf3",{value:"Value 2/2"}),
					new Title("SF3-title2",{text:"Title 2"}),
					new Label("SF3-L2-1",{text:"Label 1"}),
					new TextField("SF3-tf2-1",{value:"Value 1"}),
					new Label("SF3-L2-2",{text:"Label 2"}),
					new TextField("SF3-tf2-2",{value:"Value 2/1"}),
					new TextField("SF3-tf2-3",{value:"Value 2/2", layoutData:new ResponsiveFlowLayoutData("SF3-LD_tf2-3", {linebreak:true,weight:8})})
				]
			}).placeAt("uiArea3");

	// test functions

	QUnit.module("Setter/Getter");

	QUnit.test("used Layout", function(assert) {
		var oForm = oSimpleForm.getAggregation("form");
		var oLayout = oForm.getLayout();
		assert.equal(oLayout.getMetadata().getName(), "sap.ui.layout.form.ResponsiveLayout", "ResponsiveLayout used by default");

		oForm = oSimpleForm2.getAggregation("form");
		oLayout = oForm.getLayout();
		assert.equal(oLayout.getMetadata().getName(), "sap.ui.layout.form.GridLayout", "GridLayout used");
	});

	QUnit.test("first content", function(assert) {
		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 24, "Number of content entries");

		assert.ok(oSimpleForm.getAggregation("form"), "Internal Form exists");
		assert.ok(oSimpleForm.getAggregation("form").getDomRef(), "Internal Form rendered");

		//containers + title
		var aContainers = oSimpleForm.getAggregation("form").getFormContainers();
		assert.equal(aContainers.length, 2, "number of FormContainers");
		assert.equal(aContainers[1].getTitle().getId(), "title2", "Second container title");

		//FormElements
		var aElements1 = aContainers[0].getFormElements();
		assert.equal(aElements1.length, 5, "number of FormElements of first Container");
		assert.equal(aElements1[0].getLabel().getId(), "L1", "Label of first FormElement");
		assert.equal(aElements1[0].getFields().length, 1, "Number of Fields of first FormElement");
		assert.equal(aElements1[1].getLabel().getId(), "L2", "Label of second FormElement");
		assert.equal(aElements1[1].getFields().length, 2, "Number of Fields of second FormElement");

		var aElements2 = aContainers[1].getFormElements();
		assert.equal(aElements2.length, 4, "number of FormElements of second Container");
		assert.equal(aElements2[1].getLabel().getId(), "L2-2", "Label of second FormElement");
		assert.equal(aElements2[1].getFields().length, 1, "Number of Fields of second FormElement");
		assert.ok(!aElements2[2].getLabel(), "no Label on third FormElement");
		assert.equal(aElements2[2].getFields().length, 1, "Number of Fields of third FormElement");
	});

	QUnit.test("LayoutData", function(assert) {
		var oLabel = sap.ui.getCore().byId("L1");
		var oLayoutData = oLabel.getLayoutData();
		assert.ok(oLayoutData, "Label has LayoutData");
		assert.equal(oLayoutData.getWeight(), 3, "Label LayoutData weight");
		var oTextField = sap.ui.getCore().byId("tf1");
		oLayoutData = oTextField.getLayoutData();
		assert.ok(oLayoutData, "TextField has LayoutData");
		assert.equal(oLayoutData.getWeight(), 5, "TextField LayoutData weight");

		oLabel = sap.ui.getCore().byId("L2");
		oLayoutData = oLabel.getLayoutData();
		assert.ok(oLayoutData, "Label2 has LayoutData");
		assert.equal(oLayoutData.getWeight(), 3, "Label2 LayoutData weight");
		oTextField = sap.ui.getCore().byId("tf2");
		oLayoutData = oTextField.getLayoutData();
		assert.ok(oLayoutData, "TextField2 has LayoutData");
		assert.equal(oLayoutData.getWeight(), 3, "TextField2 LayoutData weight");
		oTextField = sap.ui.getCore().byId("tf3");
		oLayoutData = oTextField.getLayoutData();
		assert.ok(oLayoutData, "TextField3 has LayoutData");
		assert.equal(oLayoutData.getWeight(), 2, "TextField3 LayoutData weight");

		oLabel = sap.ui.getCore().byId("L3");
		oLayoutData = oLabel.getLayoutData();
		assert.ok(oLayoutData, "Label3 has LayoutData");
		assert.equal(oLayoutData.getWeight(), 3, "Label3 LayoutData weight");
		oTextField = sap.ui.getCore().byId("tf4");
		oLayoutData = oTextField.getLayoutData();
		assert.ok(oLayoutData, "TextField4 has LayoutData");
		assert.equal(oLayoutData.getWeight(), 2, "TextField4 LayoutData weight");
		oTextField = sap.ui.getCore().byId("tf5");
		oLayoutData = oTextField.getLayoutData();
		assert.ok(oLayoutData, "TextField5 has LayoutData");
		assert.equal(oLayoutData.getWeight(), 2, "TextField5 LayoutData weight");
		oTextField = sap.ui.getCore().byId("tf6");
		oLayoutData = oTextField.getLayoutData();
		assert.ok(oLayoutData, "TextField6 has LayoutData");
		assert.equal(oLayoutData.getWeight(), 1, "TextField6 LayoutData weight");

		oLabel = sap.ui.getCore().byId("L2-2");
		oLayoutData = oLabel.getLayoutData();
		assert.ok(oLayoutData, "Container2: Label2 has LayoutData");
		assert.equal(oLayoutData.getWeight(), 3, "Container2: Label2 LayoutData weight");
		oTextField = sap.ui.getCore().byId("tf2-2");
		oLayoutData = oTextField.getLayoutData();
		assert.ok(oLayoutData, "Container2: TextField2 has LayoutData");
		assert.equal(oLayoutData.getWeight(), 5, "Container2: TextField2 LayoutData weight");
		oTextField = sap.ui.getCore().byId("tf2-3");
		oLayoutData = oTextField.getLayoutData();
		assert.equal(oLayoutData.getId(), "LD_tf2-3", "Container2: TextField3 has own LayoutData");
		assert.equal(oLayoutData.getWeight(), 8, "Container2: TextField3 LayoutData weight");

		oTextField = sap.ui.getCore().byId("tf2-4");
		oLayoutData = oTextField.getLayoutData();
		assert.equal(oLayoutData.getId(), "LD_tf2-4", "Container2: TextField4 has own LayoutData");
		assert.equal(oLayoutData.getWeight(), 3, "Container2: TextField4 LayoutData weight");
		oTextField = sap.ui.getCore().byId("tf2-5");
		oLayoutData = oTextField.getLayoutData();
		assert.ok(oLayoutData, "Container2: TextField5 has LayoutData");
		assert.equal(oLayoutData.getWeight(), 1, "Container2: TextField5 LayoutData weight");
		oTextField = sap.ui.getCore().byId("tf2-6");
		oLayoutData = oTextField.getLayoutData();
		assert.ok(oLayoutData, "Container2: TextField6 has LayoutData");
		assert.equal(oLayoutData.getWeight(), 1, "Container2: TextField6 LayoutData weight");
	});

	QUnit.test("addContent", function(assert) {

		oSimpleForm.addContent(new Title("title3",{text:"Title 3"}));
		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 25, "Number of content entries after title added");
		var aContainers = oSimpleForm.getAggregation("form").getFormContainers();
		assert.equal(aContainers.length, 3, "number of FormContainers");
		assert.equal(aContainers[2].getTitle().getId(), "title3", "Third container title");

		oSimpleForm.addContent(new TextField("TF3-1",{value:"Text"}));
		aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 26, "Number of content entries after TextField added");
		var oTextField = sap.ui.getCore().byId("TF3-1");
		var oElement = oTextField.getParent();
		assert.equal(oElement.getParent().getId(), aContainers[2].getId(), "TextField is inside new container");
		assert.ok(!oElement.getLabel(), "First Element of new container has no label");

		oSimpleForm.addContent(new Label("L-X",{text:"Label"}));
		oSimpleForm.addContent(new TextField("TF-X-1",{value:"Text"}));
		oSimpleForm.addContent(new TextField("TF-X-2",{value:"Text"}));
		oSimpleForm.addContent(new TextField("TF-X-3",{value:"Text"}));
		aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 30, "Number of content entries after new Fields added");
		var oLabel = sap.ui.getCore().byId("L-X");
		oElement = oLabel.getParent();
		assert.equal(oElement.getParent().getId(), aContainers[2].getId(), "Label is inside new container");
		assert.equal(aContainers[2].getFormElements().length, 2, "Container has now 2 FormElemnts");
		assert.equal(oElement.getLabel().getId(), "L-X", "new FormElement has label");
		assert.equal(oElement.getFields().length, 3, "new FormElemnt number of fields");

		sap.ui.getCore().applyChanges();
	});

	QUnit.test("insertContent", function(assert) {
		oSimpleForm.insertContent(new Title("title4",{text:"Title 4"}), 26); // insert before Label
		var aContent = oSimpleForm.getContent();
		var oTitle = sap.ui.getCore().byId("title4");
		assert.equal(aContent.length, 31, "Number of content entries after new Title inserted");
		assert.equal(oSimpleForm.indexOfContent(oTitle), 26, "Index of new title");
		var aContainers = oSimpleForm.getAggregation("form").getFormContainers();
		assert.equal(aContainers.length, 4, "number of FormContainers");
		assert.equal(aContainers[3].getTitle().getId(), "title4", "container4 title");
		var oLabel = sap.ui.getCore().byId("L-X");
		var oElement = oLabel.getParent();
		assert.equal(oElement.getParent().getId(), aContainers[3].getId(), "Last label now in new container");

		oSimpleForm.insertContent(new Label("L-Y",{text:"Label"}), 26); // insert before title
		aContent = oSimpleForm.getContent();
		oLabel = sap.ui.getCore().byId("L-Y");
		assert.equal(aContent.length, 32, "Number of content entries after new Label inserted");
		assert.equal(oSimpleForm.indexOfContent(oLabel), 26, "Index of new Label");
		oElement = oLabel.getParent();
		assert.equal(oElement.getParent().getId(), aContainers[2].getId(), "new label in third container");

		oSimpleForm.insertContent(new Label("L-Z",{text:"Label"}), 28); // insert before Label
		aContent = oSimpleForm.getContent();
		oLabel = sap.ui.getCore().byId("L-Z");
		assert.equal(aContent.length, 33, "Number of content entries after new Label inserted");
		assert.equal(oSimpleForm.indexOfContent(oLabel), 28, "Index of new Label");
		oElement = oLabel.getParent();
		assert.equal(oElement.getParent().getId(), aContainers[3].getId(), "new label in container 4");
		var iIndex = aContainers[3].indexOfFormElement(oElement);
		assert.equal(iIndex, 0, "index of new FormElement in Container4");

		oSimpleForm.insertContent(new Label("L-Z1",{text:"Label"}), 32); // insert before TextField
		aContent = oSimpleForm.getContent();
		oLabel = sap.ui.getCore().byId("L-Z1");
		assert.equal(aContent.length, 34, "Number of content entries after new Label inserted");
		assert.equal(oSimpleForm.indexOfContent(oLabel), 32, "Index of new Label");
		oElement = oLabel.getParent();
		assert.equal(oElement.getParent().getId(), aContainers[3].getId(), "new label in container 4");
		iIndex = aContainers[3].indexOfFormElement(oElement);
		assert.equal(iIndex, 2, "index of new FormElement in Container4");

		oSimpleForm.insertContent(new Label("L-Z2",{text:"Label"}), 25); // insert before TextField, but no label before
		aContent = oSimpleForm.getContent();
		oLabel = sap.ui.getCore().byId("L-Z2");
		oElement = oLabel.getParent();
		assert.equal(oElement.getParent().getId(), aContainers[2].getId(), "new label in container 3");
		iIndex = aContainers[2].indexOfFormElement(oElement);
		assert.equal(iIndex, 0, "index of FormElement in Container3");
		var oLayoutData = oLabel.getLayoutData();
		assert.ok(oLayoutData, "Label has LayoutData");
		assert.equal(oLayoutData.getWeight(), 3, "Label LayoutData weight");

		oSimpleForm.insertContent(new TextField("TF-X",{value:"Text X"}), 28); // insert before title
		var oTextField = sap.ui.getCore().byId("TF-X");
		oElement = oTextField.getParent();
		assert.equal(oElement.getParent().getId(), aContainers[2].getId(), "new TextField in container 3");
		iIndex = aContainers[2].indexOfFormElement(oElement);
		assert.equal(iIndex, 1, "index of FormElement in Container3");

		oSimpleForm.insertContent(new TextField("TF-Y",{value:"Text Y"}), 34); // insert before Label
		oTextField = sap.ui.getCore().byId("TF-Y");
		oElement = oTextField.getParent();
		assert.equal(oElement.getParent().getId(), aContainers[3].getId(), "new TextField in container 4");
		iIndex = aContainers[3].indexOfFormElement(oElement);
		assert.equal(iIndex, 1, "index of FormElement in Container4");
		iIndex = oElement.indexOfField(oTextField);
		assert.equal(iIndex, oElement.getFields().length - 1, "TextField is last Field of FormElement");

		oSimpleForm.insertContent(new TextField("TF-Z",{value:"Text Z"}), 28); // insert before TextField
		oTextField = sap.ui.getCore().byId("TF-Z");
		oElement = oTextField.getParent();
		assert.equal(oElement.getParent().getId(), aContainers[2].getId(), "new TextField in container 2");
		iIndex = aContainers[2].indexOfFormElement(oElement);
		assert.equal(iIndex, 1, "index of FormElement in Container3");
		iIndex = oElement.indexOfField(oTextField);
		var iIndex2 = oElement.indexOfField(sap.ui.getCore().byId("TF-X"));
		assert.equal(iIndex, iIndex2 - 1, "TextField is before old TextField in FormElement");

		oSimpleForm.insertContent(new Title("title5",{text:"Title 5"}), 37); // insert before TextField
		oTitle = sap.ui.getCore().byId("title5");
		aContainers = oSimpleForm.getAggregation("form").getFormContainers();
		assert.equal(aContainers.length, 5, "number of FormContainers");
		assert.equal(aContainers[4].getTitle().getId(), "title5", "container5 title");
		oLabel = sap.ui.getCore().byId("L-Z1");
		oElement = oLabel.getParent();
		assert.equal(oElement.getParent().getId(), aContainers[3].getId(), "Last label still in container4");
		oTextField = sap.ui.getCore().byId("TF-X-3");
		oElement = oTextField.getParent();
		assert.equal(oElement.getParent().getId(), aContainers[4].getId(), "TextField now in container5");

		sap.ui.getCore().applyChanges();
	});

	QUnit.test("removeContent", function(assert) {
		var aContent = oSimpleForm.getContent();
		var iContentLengthBefore = aContent.length;
		var sOldContainerId = sap.ui.getCore().byId("title4").getParent().getId();
		oSimpleForm.removeContent("title4");
		aContent = oSimpleForm.getContent();
		var iContentLengthAfter = aContent.length;
		assert.equal(iContentLengthBefore, iContentLengthAfter + 1, "Number of content entries after title was removed");
		var aContainers = oSimpleForm.getAggregation("form").getFormContainers();
		assert.equal(aContainers.length, 4, "number of FormContainers");
		assert.ok(!sap.ui.getCore().byId(sOldContainerId), "Old container not longer exists");
		var oLabel = sap.ui.getCore().byId("L-X");
		var oElement = oLabel.getParent();
		assert.equal(oElement.getParent().getId(), aContainers[2].getId(), "Label now in container3");
		var oTextField = sap.ui.getCore().byId("TF-Y");
		oElement = oTextField.getParent();
		assert.equal(oElement.getParent().getId(), aContainers[2].getId(), "TextField now in container3");
		oTextField = sap.ui.getCore().byId("TF-X-3");
		oElement = oTextField.getParent();
		assert.equal(oElement.getParent().getId(), aContainers[3].getId(), "TextField still in container5");

		sOldContainerId = sap.ui.getCore().byId("title5").getParent().getId();
		oTextField = sap.ui.getCore().byId("TF-X-3");
		var sOldElementId = oTextField.getParent().getId();
		oSimpleForm.removeContent("title5"); // remove title before element without label
		aContent = oSimpleForm.getContent();
		iContentLengthAfter = aContent.length;
		assert.equal(iContentLengthBefore, iContentLengthAfter + 2, "Number of content entries after title was removed");
		aContainers = oSimpleForm.getAggregation("form").getFormContainers();
		assert.equal(aContainers.length, 3, "number of FormContainers");
		assert.ok(!sap.ui.getCore().byId(sOldContainerId), "Old container not longer exists");
		oElement = oTextField.getParent();
		assert.equal(oElement.getParent().getId(), aContainers[2].getId(), "TextField now in container3");
		assert.equal(oElement.indexOfField(oTextField), oElement.getFields().length - 1, "TextField now last Field in Element");
		assert.ok(!sap.ui.getCore().byId(sOldElementId), "Old element not longer exists");

		oLabel = sap.ui.getCore().byId("L-Y");
		sOldElementId = oLabel.getParent().getId();
		oSimpleForm.removeContent("L-Y"); // remove label
		aContent = oSimpleForm.getContent();
		iContentLengthAfter = aContent.length;
		assert.equal(iContentLengthBefore, iContentLengthAfter + 3, "Number of content entries after label was removed");
		oTextField = sap.ui.getCore().byId("TF-Z");
		oElement = oTextField.getParent();
		assert.equal(oElement.getLabel().getId(), "L-Z2", "TextField now in previous FormElement");
		assert.equal(oElement.indexOfField(oTextField), 1, "TextField now second Field in Element");
		assert.ok(!sap.ui.getCore().byId(sOldElementId), "Old element not longer exists");
		assert.ok(!oLabel.getLayoutData(), "Label has no LayoutData");

		oLabel = sap.ui.getCore().byId("L-Z2");
		oElement = oLabel.getParent();
		oSimpleForm.removeContent("L-Z2"); // remove label of first FormElement of Container
		assert.ok(!oElement.getLabel(), "FormElement has no longer a label");

		oTextField = sap.ui.getCore().byId("TF-X-2");
		oElement = oTextField.getParent();
		oSimpleForm.removeContent("TF-X-2"); // remove TextField
		assert.equal(oElement.getFields().length, 2, "FormElement number of fields after removing TextField");
		assert.ok(!oTextField.getLayoutData(), "TextField has no LayoutData");

		sap.ui.getCore().applyChanges();
	});

	QUnit.test("removeAllContent", function(assert) {
		var oLabel = sap.ui.getCore().byId("SF2-L1");
		var sOldContainerId = oLabel.getParent().getParent().getId();
		oSimpleForm2.removeAllContent();
		assert.equal(oSimpleForm2.getContent().length, 0, "No content");
		var aContainers = oSimpleForm2.getAggregation("form").getFormContainers();
		assert.equal(aContainers.length, 0, "No FormContainers");
		assert.ok(!oLabel.getLayoutData(), "Label has no LayoutData");
		assert.ok(!oLabel.getParent(), "Label has no parent");
		var oTextField = sap.ui.getCore().byId("SF2-tf1");
		assert.ok(!oTextField.getLayoutData(), "TextField has no LayoutData");
		assert.ok(!oTextField.getParent(), "TextField has no parent");
		oTextField = sap.ui.getCore().byId("SF2-tf2-3");
		assert.ok(oTextField.getLayoutData(), "TextField still has LayoutData");
		assert.equal(oTextField.getLayoutData().getId(), "SF2-LD_tf2-3", "TextField has original LayoutData");
		assert.ok(!sap.ui.getCore().byId(sOldContainerId), "FormContainer not longer exists");
		assert.ok(!sap.ui.getCore().byId(sOldContainerId), "FormElement not longer exists");

		sap.ui.getCore().applyChanges();
	});

	QUnit.test("destroyContent", function(assert) {
		var oLabel = sap.ui.getCore().byId("SF3-L1");
		var sOldContainerId = oLabel.getParent().getParent().getId();
		oSimpleForm3.destroyContent();
		assert.equal(oSimpleForm3.getContent().length, 0, "No content");
		var aContainers = oSimpleForm3.getAggregation("form").getFormContainers();
		assert.equal(aContainers.length, 0, "No FormContainers");
		oLabel = sap.ui.getCore().byId("SF3-L1");
		assert.ok(!oLabel, "Label no longer exist");
		var oTextField = sap.ui.getCore().byId("SF3-tf1");
		assert.ok(!oTextField, "TextField no longer exist");
		assert.ok(!sap.ui.getCore().byId(sOldContainerId), "FormContainer not longer exists");
		assert.ok(!sap.ui.getCore().byId(sOldContainerId), "FormElement not longer exists");

		sap.ui.getCore().applyChanges();
	});

	QUnit.module("Content changing");

	QUnit.test("toggle visibility", function(assert) {

		var oTextField = sap.ui.getCore().byId("TF-X-3");
		var oElement = oTextField.getParent();
		oTextField.setVisible(false);
		assert.equal(oElement.isVisible(), false, "FormElement is invisible if Field is invisible");

		oTextField = sap.ui.getCore().byId("TF-X-1");
		oElement = oTextField.getParent();
		oTextField.setVisible(false);
		assert.equal(oElement.isVisible(), true, "FormElement is still visible if only one Field is invisible");
		oTextField = sap.ui.getCore().byId("TF-Y");
		oTextField.setVisible(false);
		assert.equal(oElement.isVisible(), false, "FormElement is invisible if all fields are invisible");

		oTextField.setVisible(true);
		assert.equal(oElement.isVisible(), true, "FormElement is visible again if one field is visible");

		sap.ui.getCore().applyChanges();
	});
});