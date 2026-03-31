sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("gateentry.controller.RGPReport", {

        onInit: function () {

            var oData = {
                FromDate: null,
                ToDate: null,
                Vendor: ""
            };

            this.getView().setModel(new JSONModel(oData), "local");
        },

        onFilter: function () {

            var oData = this.getView().getModel("local").getData();

            MessageToast.show("Filtering RGP Report");

            // 👉 Later: call backend with filters
        }

    });
});