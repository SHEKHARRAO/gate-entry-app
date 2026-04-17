sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, MessageToast, MessageBox, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("gateentry.controller.Search", {

        // ================= INIT =================
        onInit: function () {

            var oData = {
                SearchText: "",
                FromDate: null,
                ToDate: null,
                GateEntryType: "",
                Status: "ALL",
                results: []
            };

            this.getView().setModel(new JSONModel(oData), "local");
        },

        // ================= SEARCH =================
        onSearch: function () {

            var oLocal = this.getView().getModel("local");
            var oData = oLocal.getData();

            var oModel = this.getOwnerComponent().getModel();

            var aFilters = [];

            // 🔍 Gate Entry No / Vehicle / PO search
            if (oData.SearchText) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("GateEntryNo", FilterOperator.Contains, oData.SearchText),
                        new Filter("VehicleNumber", FilterOperator.Contains, oData.SearchText),
                        new Filter("PurchaseOrderNo", FilterOperator.Contains, oData.SearchText)
                    ],
                    and: false
                }));
            }

            // 📅 Date range
            if (oData.FromDate && oData.ToDate) {
                aFilters.push(new Filter(
                    "ChallanDate",
                    FilterOperator.BT,
                    oData.FromDate,
                    oData.ToDate
                ));
            }

            // 🚪 Gate Entry Type
            if (oData.GateEntryType) {
                aFilters.push(new Filter(
                    "GateEntryType",
                    FilterOperator.EQ,
                    oData.GateEntryType
                ));
            }

            // 🔄 Status (only if not ALL)
            if (oData.Status && oData.Status !== "ALL") {
                aFilters.push(new Filter(
                    "Passing",
                    FilterOperator.EQ,
                    oData.Status
                ));
            }

            sap.ui.core.BusyIndicator.show(0);

            // 🔥 ODATA CALL
            oModel.read("/ZGTC_TGGATE_ENTRYRY", {

                filters: aFilters,

                success: function (oResponse) {

                    sap.ui.core.BusyIndicator.hide();

                    oLocal.setProperty("/results", oResponse.results);

                    MessageToast.show("Data Loaded Successfully");

                }.bind(this),

                error: function (oError) {

                    sap.ui.core.BusyIndicator.hide();

                    console.error(oError);
                    MessageBox.error("Search failed");
                }

            });
        },
      onOpenDialog: function (oEvent) {

    var oContext = oEvent.getSource().getBindingContext();
    this._selectedData = oContext.getObject();   // 🔥 STORE DATA

    this.byId("moreOptionDialog").open();
},

onPrintPress: function (oEvent) {

    var oContext = oEvent.getSource().getBindingContext();
    var oData = oContext.getObject();

    var oModel = new sap.ui.model.json.JSONModel(oData);
    this.getView().setModel(oModel, "print");

    this.byId("printDialog").open();
},

onPrintNow: function () {

    var sHtml = this.byId("printArea").getDomRef().innerHTML;

    var win = window.open("", "", "width=800,height=600");
    win.document.write("<html><body>");
    win.document.write(sHtml);
    win.document.write("</body></html>");
    win.document.close();

    win.print();
},

onClosePrint: function () {
    this.byId("printDialog").close();
},

formatDateTime: function (val) {
    if (!val) return "";
    return new Date(val).toLocaleString();
},

onCloseDialog: function () {
    this.byId("moreOptionDialog").close();
},


    });
});