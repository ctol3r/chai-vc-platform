// Cypress configuration
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // Adjust the baseUrl when the frontend server is running
    baseUrl: 'http://localhost:3000',
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.cy.js'
  }
});
