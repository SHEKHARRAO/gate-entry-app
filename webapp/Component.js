sap.ui.define([
    "sap/ui/core/UIComponent",
    "gateentry/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("gateentry.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            UIComponent.prototype.init.apply(this, arguments);

            // ✅ DEVICE MODEL
            this.setModel(models.createDeviceModel(), "device");

            // ✅ ADD THIS (VERY IMPORTANT)
            var oData = {
                Users: [
                    {
                        UserId: "3110",
                        Password: "123",
                        FirstName: "GE-3110",
                        AllowLogin: true,
                        CreateGateEntry: true,
                        EditGateEntry: true
                    },
                    {
                        UserId: "1120",
                        Password: "123",
                        FirstName: "GE-1120",
                        AllowLogin: true,
                        CreateGateEntry: true,
                        EditGateEntry: false
                    },
                    {
                        UserId: "9999",
                        Password: "admin",
                        FirstName: "ADMIN",
                        AllowLogin: true,
                        CreateGateEntry: true,
                        EditGateEntry: true
                    }
                ]
            };
var oSession = new sap.ui.model.json.JSONModel({
    loggedIn: false
});
this.setModel(oSession, "session");
            var oLocalModel = new sap.ui.model.json.JSONModel(oData);
            this.setModel(oLocalModel, "local");

            // ✅ ROUTER
            this.getRouter().initialize();
        }
    });
});