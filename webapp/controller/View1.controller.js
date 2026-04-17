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
onPOChange: function (oEvent) {
    var sPONumber = oEvent.getSource().getValue().trim();
    if (!sPONumber) {
        this._clearPOFields();
        return;
    }

    var oPOModel = this.getView().getModel("poModel");
    sPONumber = sPONumber.padStart(10, "0");

    // V4 Path based on your metadata
    var sPath = "/PurchaseOrder('" + sPONumber + "')"; 
    var oContextBinding = oPOModel.bindContext(sPath);

    sap.ui.core.BusyIndicator.show(0);

    oContextBinding.requestObject().then(function (oData) {
        sap.ui.core.BusyIndicator.hide();
        var oLocal = this.getView().getModel("local");

        // Map V4 fields
        // Note: Check if you need 'Supplier' or 'PurchaseOrder' fields from oData
        oLocal.setProperty("/VendorName", oData.Supplier); 
        oLocal.setProperty("/SoldToParty", oData.CompanyCode);
        oLocal.setProperty("/ShipToParty", oData.PurchasingOrganization);

        sap.m.MessageToast.show("PO fetched successfully");
    }.bind(this)).catch(function (oError) {
        sap.ui.core.BusyIndicator.hide();
        this._clearPOFields();
        sap.m.MessageBox.error("PO not found or Error fetching data");
        console.error(oError);
    }.bind(this));
},
onDOChange: function (oEvent) {
    var sDONumber = oEvent.getSource().getValue().trim();
    if (!sDONumber) {
        this._clearDOFields();
        return;
    }

    var oDOModel = this.getView().getModel("doModel");
    sDONumber = sDONumber.padStart(10, "0");

    // V2 Path
    var sPath = "/A_OutbDeliveryHeader('" + sDONumber + "')";

    sap.ui.core.BusyIndicator.show(0);

    oDOModel.read(sPath, {
        // Use expand to get items together with the header
        urlParameters: {
            "$expand": "to_DeliveryDocumentItem"
        },
        success: function (oData) {
            sap.ui.core.BusyIndicator.hide();
            var oLocal = this.getView().getModel("local");

            // 1. Map Header Fields
            oLocal.setProperty("/SoldToParty", oData.SoldToParty);
            oLocal.setProperty("/ShipToParty", oData.ShipToParty);
            oLocal.setProperty("/Remark", oData.DeliveryDocumentBySeller || "");

            // 2. Map Item Fields to your table (local model "/Items")
            if (oData.to_DeliveryDocumentItem && oData.to_DeliveryDocumentItem.results) {
                var aItems = oData.to_DeliveryDocumentItem.results.map(function (oItem, index) {
                    return {
                        SNo: index + 1,
                        item_no: oItem.DeliveryDocumentItem,
                        material: oItem.Material,
                        material_desc: oItem.DeliveryDocumentItemText,
                        order_qty: oItem.OriginalDeliveryQuantity,
                        quantity: oItem.ActualDeliveryQuantity,
                        uom: oItem.DeliveryQuantityUnit,
                        batch_no: oItem.Batch,
                        rate: "0" // Delivery API doesn't usually provide price/rate
                    };
                });
                oLocal.setProperty("/Items", aItems);
            }

            sap.m.MessageToast.show("DO Items fetched successfully");
        }.bind(this),
        error: function (oError) {
            sap.ui.core.BusyIndicator.hide();
            this._clearDOFields();
            sap.m.MessageBox.error("DO not found or Error fetching items");
        }.bind(this)
    });
},

_clearDOFields: function() {
    var oLocal = this.getView().getModel("local");
    oLocal.setProperty("/SoldToParty", "");
    oLocal.setProperty("/ShipToParty", "");
    oLocal.setProperty("/Remark", "");
    oLocal.setProperty("/Items", []); // Clear the table too
},



        // ================= SAVE =================
onSave: function () {
    var oModel = this.getOwnerComponent().getModel();
    var oLocalModel = this.getView().getModel("local");
    
    // Create a deep copy of the data to avoid breaking UI bindings
    var oRawData = oLocalModel.getData();
    var oPayload = JSON.parse(JSON.stringify(oRawData));

    // 1. -------- GENERATE GATE ENTRY NO --------
    if (!oPayload.GateEntryNo) {
        var now = new Date();
        oPayload.GateEntryNo = "GE" + now.getFullYear() +
            String(now.getMonth() + 1).padStart(2, "0") +
            String(now.getDate()).padStart(2, "0") +
            String(now.getHours()).padStart(2, "0") +
            String(now.getMinutes()).padStart(2, "0") +
            String(now.getSeconds()).padStart(2, "0");
    }

    // 2. -------- SAP DATE FORMATTING --------
    ["DueDate", "LrDate", "ChallanDate"].forEach(function (field) {
        if (oPayload[field]) {
            var oDate = new Date(oPayload[field]);
            oPayload[field] = !isNaN(oDate.getTime()) ? "/Date(" + oDate.getTime() + ")/" : null;
        } else {
            oPayload[field] = null;
        }
    });

    // 3. -------- DECIMAL FORMATTING --------
    ["ChallanGrossWt", "ChallanTareWt", "ChallanNetWt"].forEach(function(field) {
        var val = oPayload[field];
        oPayload[field] = (!val || isNaN(val)) ? "0.000" : parseFloat(val).toFixed(3);
    });

    // 4. -------- NAVIGATION PROPERTY FIX (Deep Insert) --------
    // Move the table data from 'Items' to the navigation name 'to_Items'
// 4. -------- NAVIGATION PROPERTY FIX --------
oPayload.to_Item = (oPayload.Items || []).map(function (item, index) {
    return {
        ItemNo: item.item_no || String(index + 1).padStart(6, "0"),
        Material: item.material || "",
        MaterialDesc: item.material_desc || "",
        Quantity: item.quantity || "0.000",
        Uom: item.uom || "",
        Plant: item.plant || "",
        StorageLocation: item.storage_location || ""
    };
});

delete oPayload.Items;
    sap.ui.core.BusyIndicator.show(0);

    // 5. -------- CREATE & ACTIVATE --------
    oModel.create("/ZGTC_TGGATE_ENTRYRY", oPayload, {
        success: function (oData) {
            sap.m.MessageToast.show("Draft Created: " + oData.GateEntryNo);

            // Step 2: Activate the Draft
            oModel.callFunction("/ZGTC_TGGATE_ENTRYRYActivate", {
                method: "POST",
                urlParameters: {
                    GateEntryNo: oData.GateEntryNo,
                    IsActiveEntity: false
                },
                success: function () {
                    sap.ui.core.BusyIndicator.hide();
                    sap.m.MessageBox.success("Gate Entry " + oData.GateEntryNo + " Saved & Activated ✅");
                },
                error: function () {
                    sap.ui.core.BusyIndicator.hide();
                    sap.m.MessageBox.error("Activation Failed.");
                }
            });
        },
        error: function (oError) {
            sap.ui.core.BusyIndicator.hide();
            console.error("Payload Error:", oError);
            sap.m.MessageBox.error("Save Failed: Ensure 'to_Items' matches your Metadata navigation name.");
        }
    });
}



    });
});