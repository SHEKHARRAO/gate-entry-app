sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("gateentry.controller.Report", {

        onInit: function () {

            var oData = {
                FromDate: null,
                ToDate: null,
                SearchText: "",
                GateEntryType: "",
                Status: "ALL",
                GateEntryNo: "",
                Transporter: "",
                Project: "",
                WBS: ""
            };

            this.getView().setModel(new JSONModel(oData), "local");
        },

        onFilter: function () {

    var oLocal = this.getView().getModel("local");
    var oData = oLocal.getData();
    var oModel = this.getOwnerComponent().getModel();

    var aFilters = [];

    // Date filter
    if (oData.FromDate && oData.ToDate) {
        aFilters.push(new sap.ui.model.Filter(
            "ChallanDate",
            sap.ui.model.FilterOperator.BT,
            oData.FromDate,
            oData.ToDate
        ));
    }

    // Gate Entry Type
    if (oData.GateEntryType) {
        aFilters.push(new sap.ui.model.Filter(
            "GateEntryType",
            sap.ui.model.FilterOperator.EQ,
            oData.GateEntryType
        ));
    }

    // Gate Entry No
    if (oData.GateEntryNo) {
        aFilters.push(new sap.ui.model.Filter(
            "GateEntryNo",
            sap.ui.model.FilterOperator.Contains,
            oData.GateEntryNo
        ));
    }

    // Transporter
    if (oData.Transporter) {
        aFilters.push(new sap.ui.model.Filter(
            "TransporterName",
            sap.ui.model.FilterOperator.Contains,
            oData.Transporter
        ));
    }

    sap.ui.core.BusyIndicator.show(0);

    oModel.read("/ZGTC_TGGATE_ENTRYRY", {

        filters: aFilters,

        success: function (oResponse) {

            sap.ui.core.BusyIndicator.hide();

            // 🔥 FULL DATA COMES HERE
            oLocal.setProperty("/results", oResponse.results);

            sap.m.MessageToast.show("Report Loaded");

        }.bind(this),

        error: function (oError) {

            sap.ui.core.BusyIndicator.hide();
            console.error(oError);
            sap.m.MessageBox.error("Failed to load report");
        }

    });
},

        onExport: function () {
            MessageToast.show("Export triggered");
            // 👉 later Excel export logic
        }

    });
});