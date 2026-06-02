sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/odata/v4/ODataModel"
], (Controller, MessageBox) => 
{
    "use strict";

    return Controller.extend("kalendersporer.controller.Login", 
    {
        
        onInit: function () 
        {
            this.byId("usernameInput").setValue("");
            this.byId("passwordInput").setValue("");
        },

        onLogin: async function () 
        {
            const oView = this.getView();
            const sUsername = oView.byId("usernameInput").getValue();
            const sPassword = oView.byId("passwordInput").getValue();



            try 
            {
                const response = await fetch("/odata/v4/kalender/validateLogin", 
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(
                    {
                        username: sUsername,
                        password: sPassword
                    })
                });

                if (!response.ok) 
                {
                    MessageBox.error("Invalid username or password.");
                    return;
                }

                const result = await response.json();

                if (!result.accessToken || !result.refreshToken) 
                {
                    MessageBox.error("Invalid username or password.");
                    return;
                }
                
                localStorage.setItem("accessToken", result.accessToken);
                localStorage.setItem("refreshToken", result.refreshToken);

                if (localStorage.getItem("accessToken") && localStorage.getItem("refreshToken")) 
                {
                    const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.navTo("calender");
                }

            } 
            catch (err) 
            {
                console.error("Error during login:", err);
                MessageBox.error("An error occurred during login. Please try again later.");
            }
        }
    });
});
