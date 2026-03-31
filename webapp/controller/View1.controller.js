sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("gateentry.controller.View1", {

        // ================= INIT =================
        onInit: function () {

            var oData = {
                GateEntryType: "",
                PurchaseOrderNo: "",
                VendorCode: "",
                VendorName: "",
                DeliveryOrderNo: "",
                SoldToParty: "",
                SoldToPartyName: "",
                ShipToParty: "",
                ShipToPartyName: "",
                VehicleNumber: "",
                TransporterCode: "",
                TransporterName: "",
                DriverName: "",
                DriverMobileNo: "",
                DriverLicenseNo: "",
                LrNo: "",
                LrDate: null,
                TpNo: "",
                RgpOutwardGeNo: "",
                RgpType: "",
                EWayBill: "",
                Remark: "",
                PartyName: "",
                ContainerNumber: "",
                FreightCondition: "",
                WbFirst: "",
                FirstWtBy: "",
                EmpName: "",
                DueDate: null,
                Passing: "",
                ChallanNo: "",
                ChallanDate: null,
                ChallanGrossWt: "",
                ChallanTareWt: "",
                ChallanNetWt: ""
            };

            this.getView().setModel(new JSONModel(oData), "local");
        },

        // ================= PO FETCH =================
// onPOChange: function(oEvent) {
//     var sPONumber = oEvent.getSource().getValue();
//     if (!sPONumber) return;

//     var oPOModel = this.getView().getModel("poModel");
//     if (!oPOModel) {
//         sap.m.MessageBox.error("PO Model not available");
//         return;
//     }

//     // Optional: pad PO number if needed
//     // sPONumber = sPONumber.padStart(10, "0");

//     var sPath = "/A_PurchaseOrder('" + sPONumber + "')";

//     sap.ui.core.BusyIndicator.show(0);

//     oPOModel.read(sPath, {
//         success: function(oData) {
//             sap.ui.core.BusyIndicator.hide();

//             // Map relevant fields to UI
//             this.byId("vendorName").setValue(oData.Supplier || "");
//             this.byId("soldTo").setValue(oData.CompanyCode || "");
//             this.byId("shipTo").setValue(oData.PurchasingOrganization || "");

//             sap.m.MessageToast.show("PO details fetched successfully");
//         }.bind(this),
//         error: function(oError) {
//             sap.ui.core.BusyIndicator.hide();
//             sap.m.MessageBox.error("PO not found");
//             oEvent.getSource().setValue("");
//         }
//     });
// },
        // ================= SAVE =================
        onSave: function () {

            var oModel = this.getOwnerComponent().getModel();
            var oPayload = this.getView().getModel("local").getData();

            // -------- GENERATE GATE ENTRY NO --------
            if (!oPayload.GateEntryNo) {

                var now = new Date();

                var gateNo = "GE" +
                    now.getFullYear() +
                    String(now.getMonth() + 1).padStart(2, "0") +
                    String(now.getDate()).padStart(2, "0") +
                    String(now.getHours()).padStart(2, "0") +
                    String(now.getMinutes()).padStart(2, "0") +
                    String(now.getSeconds()).padStart(2, "0");

                oPayload.GateEntryNo = gateNo;
            }

            // -------- DATE FIX --------
            ["DueDate", "LrDate", "ChallanDate"].forEach(function (field) {

                if (oPayload[field]) {
                    var oDate = new Date(oPayload[field]);

                    if (!isNaN(oDate.getTime())) {
                        oPayload[field] = "/Date(" + oDate.getTime() + ")/";
                    } else {
                        oPayload[field] = null;
                    }
                } else {
                    oPayload[field] = null;
                }

            });

            // -------- DECIMAL FIX --------
            ["ChallanGrossWt", "ChallanTareWt", "ChallanNetWt"]
            .forEach(function(field) {

                var val = oPayload[field];

                if (!val || isNaN(val)) {
                    oPayload[field] = "0.000";
                } else {
                    oPayload[field] = parseFloat(val).toFixed(3);
                }

            });

            // -------- CHAR FIELD --------
            oPayload.FreightCondition = oPayload.FreightCondition || "";

            console.log("FINAL PAYLOAD:", oPayload);

            // -------- CREATE --------
            oModel.create("/ZGTC_TGGATE_ENTRYRY", oPayload, {
                success: function (oData) {

                    MessageToast.show("Draft Created");

                    oModel.callFunction("/ZGTC_TGGATE_ENTRYRYActivate", {
                        method: "POST",
                        urlParameters: {
                            GateEntryNo: oData.GateEntryNo,
                            IsActiveEntity: false
                        },
                        success: function () {
                            MessageToast.show("Saved & Activated ✅");
                        },
                        error: function () {
                            MessageBox.error("Activation Failed");
                        }
                    });

                },
                error: function (oError) {
                    console.error(oError);
                    MessageBox.error("Error in Create");
                }
            });
        }

    });
});