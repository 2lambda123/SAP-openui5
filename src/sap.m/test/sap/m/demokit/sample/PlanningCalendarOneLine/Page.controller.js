sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessageBox',
		'sap/ui/core/date/UI5Date'
	],
	function (Controller, JSONModel, MessageBox, UI5Date) {
		"use strict";

		return Controller.extend("sap.m.sample.PlanningCalendarOneLine.Page", {

			onInit: function () {
				// create model
				var oModel = new JSONModel();
				oModel.setData({
					startDate: UI5Date.getInstance("2017", "2", "08", "8", "0"),
					people: [{
						pic: "test-resources/sap/ui/documentation/sdk/images/John_Miller.png",
						name: "John Miller",
						role: "team member",
						appointments: [
							{
								start: UI5Date.getInstance("2017", "2", "7", "18", "00"),
								end: UI5Date.getInstance("2017", "2", "7", "19", "10"),
								title: "Discussion of the plan",
								info: "Online meeting",
								type: "Type04",
								tentative: false
							},
							{
								start: UI5Date.getInstance("2017", "2", "7", "14", "00"),
								end: UI5Date.getInstance("2017", "2", "7", "15", "15"),
								title: "Department meeting",
								type: "Type04",
								tentative: false
							},
							{
								start: UI5Date.getInstance("2017", "2", "3", "10", "0"),
								end: UI5Date.getInstance("2017", "2", "7", "12", "0"),
								title: "Workshop out of the country",
								type: "Type07",
								pic: "sap-icon://sap-ui5",
								tentative: false
							},
							{
								start: UI5Date.getInstance("2017", "2", "8", "9", "0"),
								end: UI5Date.getInstance("2017", "2", "8", "11", "0"),
								title: "Team meeting",
								info: "room 105",
								type: "Type01",
								pic: "sap-icon://sap-ui5",
								tentative: false
							},
							{
								start: UI5Date.getInstance("2017", "2", "8", "9", "30"),
								end: UI5Date.getInstance("2017", "2", "8", "11", "30"),
								title: "Meeting with Max",
								type: "Type02",
								pic: "sap-icon://sap-ui5",
								tentative: false
							},
							{
								start: UI5Date.getInstance("2017", "2", "8", "11", "0"),
								end: UI5Date.getInstance("2017", "2", "8", "13", "0"),
								title: "Lunch",
								type: "Type03",
								pic: "",
								tentative: true
							},
							{
								start: UI5Date.getInstance("2017", "2", "8", "11", "0"),
								end: UI5Date.getInstance("2017", "2", "8", "13", "0"),
								title: "Meeting with the crew",
								type: "Type04",
								pic: "",
								tentative: false
							},
							{
								start: UI5Date.getInstance("2017", "2", "9", "9", "0"),
								end: UI5Date.getInstance("2017", "2", "9", "16", "0"),
								title: "Busy",
								type: "Type08",
								tentative: false
							},
							{
								start: UI5Date.getInstance("2017", "2", "10", "9", "0"),
								end: UI5Date.getInstance("2017", "2", "10", "11", "0"),
								title: "Team meeting",
								info: "room 105",
								type: "Type01",
								pic: "sap-icon://sap-ui5",
								tentative: false
							},
							{
								start: UI5Date.getInstance("2017", "2", "10", "9", "30"),
								end: UI5Date.getInstance("2017", "2", "10", "16", "30"),
								title: "Meeting with Max",
								type: "Type02",
								tentative: false
							},
							{
								start: UI5Date.getInstance("2017", "2", "11", "0", "0"),
								end: UI5Date.getInstance("2017", "2", "13", "23", "59"),
								title: "Vacation",
								info: "out of office",
								type: "Type04",
								tentative: false
							},
							{
								start: UI5Date.getInstance("2017", "2", "16", "00", "30"),
								end: UI5Date.getInstance("2017", "2", "16", "23", "30"),
								title: "New Colleague",
								info: "room 115",
								type: "Type10",
								tentative: true
							},
							{
								start: UI5Date.getInstance("2017", "9", "11", "0", "0"),
								end: UI5Date.getInstance("2017", "10", "13", "23", "59"),
								title: "Vacation",
								info: "out of office",
								type: "Type04",
								tentative: false
							}
						],
						headers: [{
							start: UI5Date.getInstance("2016", "8", "1", "0", "0"),
							end: UI5Date.getInstance("2016", "11", "30", "23", "59"),
							title: "New quarter",
							type: "Type10",
							tentative: false
						},
							{
								start: UI5Date.getInstance("2017", "2", "9", "8", "0"),
								end: UI5Date.getInstance("2017", "2", "9", "9", "0"),
								title: "UI5",
								pic: "sap-icon://sap-ui5",
								type: "Type05"
							},
							{
								start: UI5Date.getInstance("2017", "5", "1", "0", "0"),
								end: UI5Date.getInstance("2017", "8", "30", "23", "59"),
								title: "New quarter",
								type: "Type10",
								tentative: false
							}
						]
					},
						{
							pic: "sap-icon://employee",
							name: "Max Mustermann",
							role: "team member",
							appointments: [{
								start: UI5Date.getInstance("2016", "11", "1", "00", "30"),
								end: UI5Date.getInstance("2017", "0", "31", "23", "30"),
								title: "New product release",
								info: "room 105",
								type: "Type03",
								tentative: true
							},
								{
									start: UI5Date.getInstance("2017", "2", "2", "07", "0"),
									end: UI5Date.getInstance("2017", "2", "3", "09", "0"),
									title: "Education",
									type: "Type05",
									tentative: false
								},
								{
									start: UI5Date.getInstance("2017", "2", "5", "00", "30"),
									end: UI5Date.getInstance("2017", "2", "5", "23", "30"),
									title: "New Product",
									info: "room 105",
									type: "Type03",
									tentative: true
								},
								{
									start: UI5Date.getInstance("2017", "2", "8", "08", "0"),
									end: UI5Date.getInstance("2017", "2", "8", "09", "0"),
									title: "Meet Donna",
									type: "Type06",
									tentative: false
								},
								{
									start: UI5Date.getInstance("2017", "2", "8", "9", "0"),
									end: UI5Date.getInstance("2017", "2", "8", "11", "0"),
									title: "Team meeting",
									info: "room 1",
									type: "Type01",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: UI5Date.getInstance("2017", "2", "9", "14", "00"),
									end: UI5Date.getInstance("2017", "2", "9", "15", "15"),
									title: "Department meeting",
									type: "Type04",
									tentative: false
								},
								{
									start: UI5Date.getInstance("2017", "2", "10", "9", "30"),
									end: UI5Date.getInstance("2017", "2", "10", "11", "30"),
									title: "Meeting with John",
									type: "Type02",
									tentative: false
								},
								{
									start: UI5Date.getInstance("2017", "2", "11", "0", "0"),
									end: UI5Date.getInstance("2017", "2", "12", "23", "59"),
									title: "Team Building",
									info: "out of office",
									type: "Type10",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
								{
									start: UI5Date.getInstance("2017", "2", "19", "00", "30"),
									end: UI5Date.getInstance("2017", "2", "17", "23", "30"),
									title: "New Product",
									info: "room 325",
									type: "Type07",
									tentative: true
								},
								{
									start: UI5Date.getInstance("2017", "2", "21", "00", "30"),
									end: UI5Date.getInstance("2017", "2", "21", "23", "30"),
									title: "New Product",
									info: "room 105",
									type: "Type03",
									tentative: true
								},
								{
									start: UI5Date.getInstance("2017", "5", "1", "0", "0"),
									end: UI5Date.getInstance("2017", "6", "15", "23", "59"),
									title: "Vacation",
									info: "out of office",
									type: "Type04",
									tentative: false
								},
								{
									start: UI5Date.getInstance("2017", "11", "1", "00", "30"),
									end: UI5Date.getInstance("2018", "1", "31", "23", "30"),
									title: "New product release",
									info: "room 105",
									type: "Type03",
									tentative: true
								}
							],
							headers: [{
								start: UI5Date.getInstance("2017", "2", "8", "8", "0"),
								end: UI5Date.getInstance("2017", "2", "8", "10", "0"),
								title: "Development of UI5",
								pic: "sap-icon://sap-ui5",
								type: "Type07"
							},
								{
									start: UI5Date.getInstance("2017", "4", "1", "0", "0"),
									end: UI5Date.getInstance("2017", "7", "30", "23", "59"),
									title: "New quarter",
									type: "Type10",
									tentative: false
								}
							]
						}
					]
				});
				this.getView().setModel(oModel);
			},

			handleAppointmentSelect: function (oEvent) {
				var oAppointment = oEvent.getParameter("appointment"),
					oButtonBadgeCustomData = this.byId("MultiSelect").getBadgeCustomData(),
					iSelectedAppointments = this.byId("PC1").getSelectedAppointments().length;

				if (oAppointment) {
					var sSelected = oAppointment.getSelected() ? "selected" : "deselected";
					MessageBox.show("'" + oAppointment.getTitle() + "' " + sSelected + ". \n Selected appointments: " + iSelectedAppointments);
				} else {
					var aAppointments = oEvent.getParameter("appointments");
					var sValue = aAppointments.length + " Appointments selected";
					MessageBox.show(sValue);
				}

				oButtonBadgeCustomData.setValue(iSelectedAppointments);
			},

			handleIntervalSelect: function (oEvent) {
				var oPC = oEvent.getSource(),
					oStartDate = oEvent.getParameter("startDate"),
					oEndDate = oEvent.getParameter("endDate"),
					oRow = oEvent.getParameter("row"),
					oModel = this.getView().getModel(),
					oData = oModel.getData(),
					iIndex = -1,
					oAppointment = {
						start: oStartDate,
						end: oEndDate,
						title: "new appointment",
						type: "Type09"
					},
					aSelectedRows,
					i;

				if (oRow) {
					iIndex = oPC.indexOfRow(oRow);
					oData.people[iIndex].appointments.push(oAppointment);
				} else {
					aSelectedRows = oPC.getSelectedRows();
					for (i = 0; i < aSelectedRows.length; i++) {
						iIndex = oPC.indexOfRow(aSelectedRows[i]);
						oData.people[iIndex].appointments.push(oAppointment);
					}
				}

				oModel.setData(oData);

			},

			handleSortChange: function (oEvent) {
				//make a custom sort regarding alphabetical order
				var oPC = this.byId("PC1"),
					fnSelectedSort = oEvent.getParameter("selectedItem").getKey() === "custom" ? this.fnAlphabeticalOrder : null;

				oPC.setCustomAppointmentsSorterCallback(fnSelectedSort);

			},

			onPress: function (oEvent) {
				var oPC = this.byId("PC1"),
					oButton = this.byId("MultiSelect");
				oPC.setMultipleAppointmentsSelection(!oPC.getMultipleAppointmentsSelection());
				if (oEvent.getParameter("pressed")) {
					oButton.setTooltip("Disable multiple appointments selection");
				} else {
					oButton.setTooltip("Enable multiple appointments selection");
				}
			},

			// custom function for appointments sort by alphabetical order
			fnAlphabeticalOrder : function(oApp1, oApp2) {
				if (oApp1.getTitle().toLowerCase() > oApp2.getTitle().toLowerCase()) {
					return 1;
				}
				if (oApp1.getTitle().toLowerCase() < oApp2.getTitle().toLowerCase()) {
					return -1;
				}
				return 0;
			}

		});

	});