const { defineConfig } = require("cypress");

module.exports = defineConfig({
  allowCypressEnv: false,
  e2e: {
    specPattern: "**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "support/commands.cy.js",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
