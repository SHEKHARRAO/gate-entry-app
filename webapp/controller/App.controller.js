sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("gateentry.controller.App", {

        onNavToCreate: function () {
            this.getOwnerComponent().getRouter().navTo("RouteView1");
        },

        onNavToSearch: function () {
            this.getOwnerComponent().getRouter().navTo("RouteSearch");
        },
        onNavToReport: function () {
    this.getOwnerComponent().getRouter().navTo("RouteReport");
},
onNavToWeighment: function () {
    this.getOwnerComponent().getRouter().navTo("RouteWeighment");
},
onNavToRGPReport: function () {
    this.getOwnerComponent().getRouter().navTo("RouteRGPReport");
},
onNavToUserMaster: function () {
    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
    oRouter.navTo("UserMaster");
}

    });
});