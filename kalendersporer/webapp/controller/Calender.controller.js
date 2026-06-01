sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/date/UI5Date",
    "../utils/parseJWT",
    "../utils/dateUtil"
], (Controller, JSONModel, MessageBox, UI5Date, parseJWTModule, dateUtilModule) => {
    "use strict";

    // TODO: add colors into a table in the database
    const colors = 
    {
        bursdag: "Type07",
        ferie: "Type02",
        fravær: "Type08",
        fridager: "Type01",
        meeting: "Type04"
    };

    // TODO: change localstorage to session storage
    // TODO: move the filtering to backend for security
    // TODO: add better error handling 
    // TODO: move auth functions to the utils folder?
    // TODO: Fix the sequence of functions called as otherwise the tokens stay in the session even tho we already cleared
    // Like moving all the code from oninit into its own data functions since otherwise it gets called too early

    return Controller.extend("kalendersporer.controller.Calender", 
    {
        onInit: async function () 
        {

            // util functions
            const { parseJWT } = parseJWTModule;
            const { parseDate } = dateUtilModule;

            const token = localStorage.getItem("accessToken");
            const payload = parseJWT(token);
            const username = payload?.username || "Unknown";

            const userModel = new JSONModel({ username });
            this.getView().setModel(userModel, "user");

            const oView = this.getView();
            const viewModel = new JSONModel(
            {
                startDate: UI5Date.getInstance(2025, 0, 1),
                people: [],
                originalPeople: []
            });
            oView.setModel(viewModel);

            try 
            {
                // Fetch Ansatt and LoginInfo
                const [ansattResp, loginInfoResp, fravaerdResp, fridagerResp, reiseplanResp] = await Promise.all(
                [
                    this._fetchWithAuth("/odata/v4/kalender/Ansatt"),
                    this._fetchWithAuth("/odata/v4/kalender/LoginInfo"),
                    this._fetchWithAuth("/odata/v4/kalender/Fraværssøknad"),
                    this._fetchWithAuth("/odata/v4/kalender/Fridager"),
                    this._fetchWithAuth("/odata/v4/kalender/Reiseplan")
                ]);

                const ansattData = ansattResp.value || [];
                const loginInfoData = loginInfoResp.value || [];
                const fravaerData = fravaerdResp.value || [];
                const fridagerData = fridagerResp.value || [];
                const reiseplanData = reiseplanResp.value || [];

                const loginInfoRecord = loginInfoData.find(li => li.username.toLowerCase() === username.toLowerCase());

                if (!loginInfoRecord) 
                {
                    MessageBox.error("Kunne ikke finne brukerinformasjon (LoginInfo) for innlogget bruker.");
                    return;
                }

                const leader = ansattData.find(p => p.id === loginInfoRecord.ansatt_id);

                if (!leader) 
                {
                    MessageBox.error("Kunne ikke finne Ansatt tilknyttet innlogget bruker.");
                    return;
                }

                const leaderavdeling = leader.avdeling;

                if (!leaderavdeling) 
                {
                    MessageBox.error("Brukerens avdeling ble ikke funnet.");
                    return;
                }

                // Filter people in same department
                const filteredPeople = ansattData
                    .filter(person => person.avdeling === leaderavdeling)
                    .map(person => (
                    {
                        id: person.id,
                        pic: "sap-icon://employee",
                        name: person.navn,
                        avdeling: person.avdeling,
                        appointments: [],
                        headers: []
                    }));

                // Add birthdays only for those filtered
                filteredPeople.forEach(person =>
                {
                    const ans = ansattData.find(p => p.id === person.id);
                    const birthday = ans.fødselsdato;
                    if (!birthday) return;

                    const [, month, day] = birthday.split("-");
                    const birthdayDate = UI5Date.getInstance(2025, parseInt(month, 10) - 1, parseInt(day, 10));
                    person.appointments.push(
                    {
                        start: birthdayDate,
                        end: birthdayDate,
                        title: "Bursdag",
                        category: "Bursdag",
                        type: colors.bursdag
                    });
                });

                // Add absence
                fravaerData.forEach(entry =>
                {
                    const person = filteredPeople.find(p => p.id === entry.ansatt_id);
                    if (person) {
                        const startDate = parseDate(entry.fra_dato);
                        const endDate = parseDate(entry.til_dato);
                        if (startDate && endDate) {
                            person.appointments.push(
                            {
                                start: startDate,
                                end: endDate,
                                title: entry.fraværstype,
                                category: "Fravær",
                                type: colors.fravær
                            });
                        }
                    } 
                });


                // Add holidays
                fridagerData.forEach(day => {
                    const date = parseDate(day.dato);
                    filteredPeople.forEach(person => {
                        person.appointments.push({
                            start: date,
                            end: date,
                            title: day.type,
                            category: "Fridager",
                            type: colors.fridager
                        });
                    });
                });

                // Add travel plans
                reiseplanData.forEach(plan => {
                    const person = filteredPeople.find(p => p.id === plan.ansatt_id);
                    if (person) {
                        const startDate = parseDate(plan.fra_dato);
                        const endDate = parseDate(plan.til_dato);
                        if (startDate && endDate) {
                            person.appointments.push({
                                start: startDate,
                                end: endDate,
                                title: "Reise: " + plan.sted,
                                category: "Ferie",
                                type: colors.ferie
                            });
                        }
                    }
                });

                viewModel.setProperty("/people", filteredPeople);
                viewModel.setProperty("/originalPeople", JSON.parse(JSON.stringify(filteredPeople)));

            } catch (err) {
                console.error("Error fetching data:", err);
                MessageBox.error("Feil ved henting av data. Prøv igjen senere.");
            }
        },

        _fetchWithAuth: async function (url, options = {}) 
        {
            const token = localStorage.getItem("accessToken");
            options.headers = options.headers || {};
            options.headers["Authorization"] = `Bearer ${token}`;

            let response = await fetch(url, options);

            if (response.status === 401 || response.status === 403) 
            {
                const refreshToken = localStorage.getItem("refreshToken");
                const refreshResp = await fetch("/odata/v4/kalender/refreshToken", 
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refreshToken })
                });

                if (!refreshResp.ok) 
                {
                    MessageBox.error("Økten er utløpt. Logg inn på nytt.");
                    localStorage.clear();
                    sap.ui.core.UIComponent.getRouterFor(this).navTo("login");
                    throw new Error("Session expired");
                }

                const data = await refreshResp.json();
                localStorage.setItem("accessToken", data.accessToken);
                options.headers["Authorization"] = `Bearer ${data.accessToken}`;
                response = await fetch(url, options);
            }

            if (!response.ok) 
            {
                throw new Error("Failed to fetch: " + response.statusText);
            }

            return response.json();
        },

        onLogout: function () 
        {
            localStorage.clear();
            sap.ui.core.UIComponent.getRouterFor(this).navTo("login");
            location.reload(); // fully reset local storage
        },

        handleAppointmentSelect: function (oEvent) 
        {
            const oAppointment = oEvent.getParameter("appointment");
            if (oAppointment) {
                const sSelected = oAppointment.getSelected() ? "selected" : "deselected";
                MessageBox.show(`'${oAppointment.getTitle()}' ${sSelected}.`);
            } else {
                const aAppointments = oEvent.getParameter("appointments");
                MessageBox.show(`${aAppointments.length} Appointments selected`);
            }
        },

        handleSelectionFinish: function (oEvent) 
        {
            const aSelectedKeys = oEvent.getSource().getSelectedKeys();
            this.byId("PC1").setBuiltInViews(aSelectedKeys);
        },

        onToggleTheme: function () 
        {
            const currentTheme = sap.ui.getCore().getConfiguration().getTheme();
            const newTheme = currentTheme.includes("dark") ? "sap_horizon" : "sap_horizon_dark";
            sap.ui.getCore().applyTheme(newTheme);
        },

        _applyFilters: function ()
        {
            const { convertToUI5Date } = dateUtilModule;
            const oView = this.getView();
            const oModel = oView.getModel();
            const sSearchQuery = oView.byId("searchField").getValue().toLowerCase();
            const sCategory = oView.byId("appointmentTypeFilter").getSelectedKey();

            const aOriginalPeople = oModel.getProperty("/originalPeople") || [];
            const aFilteredPeople = aOriginalPeople
                .filter(person => 
                {
                    const matchesSearch = person.name.toLowerCase().includes(sSearchQuery);
                    const filteredAppointments = sCategory
                        ? person.appointments.filter(app => app.category === sCategory)
                        : person.appointments;
                    return matchesSearch && filteredAppointments.length > 0;
                })
                .map(person => (
                {
                    ...person,
                    appointments: (sCategory
                        ? person.appointments.filter(app => app.category === sCategory)
                        : person.appointments
                    ).map(app => (
                    {
                        ...app,
                        start: convertToUI5Date(app.start),
                        end: convertToUI5Date(app.end)
                    }))
                }));

            oModel.setProperty("/people", aFilteredPeople);
        },

        onResetFilters: function () 
        {
            const { convertToUI5Date } = dateUtilModule;
            const oView = this.getView();
            oView.byId("searchField").setValue("");
            oView.byId("appointmentTypeFilter").setSelectedKey("");

            const oModel = oView.getModel();
            const aOriginalPeople = oModel.getProperty("/originalPeople");
            
            const aPeopleWithDates = aOriginalPeople.map(person => (
            {
                ...person,
                appointments: person.appointments.map(app => (
                {
                    ...app,
                    start: convertToUI5Date(app.start),
                    end: convertToUI5Date(app.end)
                }))
            }));

            oModel.setProperty("/people", aPeopleWithDates);
        },

        onSearchPeople: function () 
        {
            this._applyFilters();
        },

        onFilterAppointments: function () 
        {
            this._applyFilters();
        },

        // place holders, updating later 
        handleAppointmentHeightChange: function (oEvent) 
        {
            const sKey = oEvent.getSource().getSelectedKey();
            this.byId("PC1").setAppointmentHeight(sKey);
        },

        handleSortChange: function (oEvent) 
        {
            const sKey = oEvent.getSource().getSelectedKey();
            console.log("Sort mode:", sKey);
        },

        handleAppointmentRoundingChange: function (oEvent) 
        {
            const sKey = oEvent.getSource().getSelectedKey();
            this.byId("PC1").setAppointmentRound(sKey);
        }
    });
});
