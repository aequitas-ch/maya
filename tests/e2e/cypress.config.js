const { defineConfig } = require("cypress");

module.exports = defineConfig({

  env: {
    apiUrl: (process.env.CYPRESS_API_URL || 'http://localhost:8000').replace(/\/+$/, ''),
    testUserPassword: process.env.CYPRESS_TEST_USER_PASSWORD,
    adminUserPassword: process.env.CYPRESS_ADMIN_USER_PASSWORD,
  },

  projectId: "smcvoc",

  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:5173',
  },
});
