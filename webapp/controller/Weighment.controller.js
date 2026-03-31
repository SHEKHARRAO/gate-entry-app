sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("gateentry.controller.Weighment", {
onInit: function () {

    var oLocal = {
        GateEntryNo: "",
        showData: false
    };

    this.getView().setModel(new JSONModel(oLocal), "local");
    this.getView().setModel(new JSONModel({}), "data");
},

onSearch: function () {

    var oLocalModel = this.getView().getModel("local");
    var sGateEntry = oLocalModel.getProperty("/GateEntryNo");
    var oModel = this.getOwnerComponent().getModel();

    if (!sGateEntry) {
        MessageToast.show("Enter Gate Entry Number");
        return;
    }

    var aFilters = [];

    // ✅ Exact match (important)
    aFilters.push(new sap.ui.model.Filter(
        "GateEntryNo",
        sap.ui.model.FilterOperator.EQ,
        sGateEntry
    ));

    sap.ui.core.BusyIndicator.show(0);

    oModel.read("/ZGTC_TGGATE_ENTRYRY", {

        filters: aFilters,

        success: function (oResponse) {

            sap.ui.core.BusyIndicator.hide();

            if (!oResponse.results.length) {
                MessageToast.show("No Data Found");
                return;
            }

            // 👉 Take first record (single gate entry)
            var oResult = oResponse.results[0];

            // 🔥 Map backend → UI model
           var oData = {

    // HEADER
    GateEntryType: oResult.GateEntryType || "N/A",
    PoNo: oResult.PurchaseOrderNo || "N/A",
    Delivery: oResult.DeliveryOrderNo || "N/A",
    EWay: oResult.EWayBill || "N/A",

    // VEHICLE
    Vehicle: oResult.VehicleNumber,
    Transporter: oResult.TransporterName,

    // CHALLAN
    Challan: oResult.ChallanNo,
    ChallanDate: this.formatDate(oResult.ChallanDate),

    // WEIGHTS
    Gross: oResult.ChallanGrossWt,
    Tare: oResult.ChallanTareWt,
    Net: oResult.ChallanNetWt,
    Weight: oResult.ChallanGrossWt,

    // PARTY
    Vendor: oResult.VendorName,
    SoldTo: oResult.SoldToPartyName,
    ShipTo: oResult.ShipToPartyName,
    Project: oResult.PartyName || "N/A",   // empty in backend

    // DRIVER
    Driver: oResult.DriverName,
    Mobile: oResult.DriverMobileNo,
    License: oResult.DriverLicenseNo,

    // TRANSPORT
    LRNo: oResult.LrNo,
    LRDate: this.formatDate(oResult.LrDate),
    TP: oResult.TpNo,

    // OTHER
    Employee: oResult.EmpName,
    DueDate: this.formatDate(oResult.DueDate),
    RGPNo: oResult.RgpOutwardGeNo || "N/A",
    RGPType: oResult.RgpType || "N/A",

    Passing: oResult.Passing || "0",
    Freight: oResult.FreightCondition,

    Remark: oResult.Remark,

    Items: []
};

            this.getView().getModel("data").setData(oData);

            // ✅ Show screen
            oLocalModel.setProperty("/showData", true);

            MessageToast.show("Data Loaded");

        }.bind(this),

        error: function (oError) {

            sap.ui.core.BusyIndicator.hide();
            console.error(oError);
            sap.m.MessageBox.error("Failed to fetch data");
        }

    });
},
formatDate: function (sDate) {
    if (!sDate) return "";

    try {
        var oDate = new Date(sDate);
        return oDate.toLocaleDateString("en-GB"); // 30/03/2026
    } catch (e) {
        return sDate;
    }
}
    });
});