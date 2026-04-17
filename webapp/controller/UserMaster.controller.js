sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("gateentry.controller.UserMaster", {

       onInit: function () {

    var oData = {
        Users: [
            {
                UserId: "3110",
                Password: "123",
                FirstName: "GE-3110",
                Plant: "3110",
                AllowLogin: true,
                CreateGateEntry: true,
                EditGateEntry: true,
                CancelTruck: true,
                OutTruck: true
            },
            {
                UserId: "1120",
                Password: "123",
                FirstName: "GE-1120",
                Plant: "1120",
                AllowLogin: true,
                CreateGateEntry: true,
                EditGateEntry: false,
                CancelTruck: false,
                OutTruck: true
            },
            {
                UserId: "9999",
                Password: "admin",
                FirstName: "ADMIN",
                Plant: "ALL",
                AllowLogin: true,
                CreateGateEntry: true,
                EditGateEntry: true,
                CancelTruck: true,
                OutTruck: true
            }
        ]
    };

    var oModel = new sap.ui.model.json.JSONModel(oData);
    this.getView().setModel(oModel, "local");
},

       onAddUser: function () {

    var oEmpty = {
        FirstName: "",
        LastName: "",
        UserId: "",
        Plant: "",
        HomeUrl: "GATE ENTRY",
        AllowLogin: true,
        UserAccess: false,
        CancelTruck: false,
        OutTruck: false
    };

    var oModel = new sap.ui.model.json.JSONModel(oEmpty);
    this.getView().setModel(oModel, "user");

    this._editIndex = null; // NEW MODE

    this.byId("userDialog").open();
},

      onEditUser: function (oEvent) {

    var oContext = oEvent.getSource().getBindingContext("local");
    var oData = oContext.getObject();

    var oModel = new sap.ui.model.json.JSONModel(Object.assign({}, oData));
    this.getView().setModel(oModel, "user");

    this._editIndex = oContext.getPath(); // STORE PATH

    this.byId("userDialog").open();
},
onSaveUser: function () {

    var oUser = this.getView().getModel("user").getData();
    var oMainModel = this.getView().getModel("local");

    if (this._editIndex) {
        // EDIT
        oMainModel.setProperty(this._editIndex, oUser);
    } else {
        // ADD
        var aUsers = oMainModel.getProperty("/Users");
        aUsers.push(oUser);
        oMainModel.setProperty("/Users", aUsers);
    }

    this.byId("userDialog").close();
},
onCloseUserDialog: function () {
    this.byId("userDialog").close();
},
        formatDateTime: function (date) {
            if (!date) return "";
            return new Date(date).toLocaleString();
        }

    });
});