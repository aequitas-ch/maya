const { defineConfig } = require("cypress");

module.exports = defineConfig({

  env: {
    apiUrl: (process.env.CYPRESS_API_URL || 'http://localhost:8000').replace(/\/+$/, ''),
  },

  projectId: "smcvoc",

<<<<<<< HEAD
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:5173',
=======

    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:5173',

>>>>>>> origin/main
  },
});
