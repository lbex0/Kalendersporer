sap.ui.define([], function() 
{
    "use strict";
    return {
        parseJWT: function(token) 
        {
            try 
            {
                const base64Url = token.split('.')[1];
                const base64 = decodeURIComponent(atob(base64Url).split('').map(c =>
                    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                ).join(''));
                return JSON.parse(base64);
            } 
            catch (e) 
            {
                console.error("Failed to parse JWT:", e);
                return null;
            }
        }
    };
});
