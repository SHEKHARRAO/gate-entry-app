sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("gateentry.controller.Login", {

        onLogin: function () {

            var sUser = this.byId("loginUser").getValue();
            var sPass = this.byId("loginPass").getValue();

            var oModel = this.getOwnerComponent().getModel("local");
            var aUsers = oModel.getProperty("/Users");

            var oMatch = aUsers.find(function (u) {
                return u.UserId === sUser && u.Password === sPass;
            });

            if (!oMatch) {
                sap.m.MessageBox.error("Invalid credentials");
                return;
            }

            if (!oMatch.AllowLogin) {
                sap.m.MessageBox.error("Login not allowed");
                return;
            }

            // ✅ UPDATE SESSION MODEL PROPERLY
            var oSession = this.getOwnerComponent().getModel("session");
            oSession.setProperty("/loggedIn", true);
            oSession.setProperty("/user", oMatch);

            // clear fields
            this.byId("loginUser").setValue("");
            this.byId("loginPass").setValue("");

            // ✅ NAVIGATE TO HOME PAGE
            this.getOwnerComponent().getRouter().navTo("RouteView1", {}, true);
        }

    });
});