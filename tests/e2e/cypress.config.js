const { defineConfig } = require("cypress");

module.exports = defineConfig({
  env: {
    apiUrl: (process.env.CYPRESS_API_URL || 'http://localhost:8000').replace(/\/+$/, ''),
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:5173',
  },
});
