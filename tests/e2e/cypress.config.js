const { defineConfig } = require("cypress");

module.exports = defineConfig({

  env: {
    apiUrl: (process.env.CYPRESS_API_URL || 'http://localhost:8000').replace(/\/+$/, ''),
  },

  projectId: "smcvoc",


    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:5173',

  },
});
