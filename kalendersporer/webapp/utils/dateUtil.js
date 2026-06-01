sap.ui.define(["sap/ui/core/date/UI5Date"], function(UI5Date) 
{
    "use strict";
    return {
        convertToUI5Date: function(date) 
        {
            if (!date) return null;
            if (date instanceof UI5Date) return date;
            if (date instanceof Date) return UI5Date.getInstance(date.getFullYear(), date.getMonth(), date.getDate());

            if (typeof date === "string") 
            {
                const parts = date.split("-");
                if (parts.length === 3) 
                {
                    const [year, month, day] = parts.map(Number);

                    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) 
                    {
                        return UI5Date.getInstance(year, month - 1, day);
                    }
                }

                const parsed = new Date(date);

                if (!isNaN(parsed)) 
                {
                    return UI5Date.getInstance(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
                }
            }

            console.warn("Could not convert to UI5Date:", date);
            return null;
        },

        parseDate: function (dateString) 
        {
            if (!dateString) return null;
            const parts = dateString.split("-").map(Number);
            if (parts.length !== 3) return null;
            const [year, month, day] = parts;
            return UI5Date.getInstance(year, month - 1, day);
        }
    };
});
