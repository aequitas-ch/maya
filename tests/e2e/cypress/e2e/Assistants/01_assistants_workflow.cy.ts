describe('Assistants Workflow', () => {
  beforeEach(() => {
    cy.login(); // Assuming a custom command exists or we simulate login
    cy.visit('/assistants');
  });

  it('allows creating an employee, adding a contract, logging hours and viewing dashboard', () => {
    // Navigate to create
    cy.contains('Add Employee').click();

    // Fill employee form
    cy.get('input[name="first_name"]').type('Petra');
    cy.get('input[name="last_name"]').type('Müller');
    cy.get('input[name="ahv_number"]').type('756.9876.5432.10');
    cy.get('select[name="type"]').select('IV_ASSISTANCE');
    cy.contains('button', 'Save').click();

    // Find in list and click
    cy.contains('Petra Müller').click();

    // Create contract
    cy.get('input[type="number"]').eq(0).type('35.00'); // Hourly wage
    cy.get('input[type="date"]').type('2023-01-01');
    cy.contains('button', 'Save Contract').click();

    // Go to log hours
    cy.contains('Log Working Hours').click();
    cy.get('input[type="number"]').eq(2).clear().type('40'); // Basic hours
    cy.contains('button', 'Save & Generate Payslip').click();

    // Check dashboard
    cy.visit('/assistants/dashboard');
    cy.contains('Costs Dashboard').should('exist');
    cy.contains('Monthly Costs').should('exist');
    cy.contains('Costs by Employment Type').should('exist');
  });
});
