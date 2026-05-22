describe('Registration Flow', () => {
  it('successfully registers a new user', () => {
    cy.visit('/register')

    // Generate random string to prevent test collision
    const randomString = Math.random().toString(36).substring(2, 10);
    const username = `testuser_${randomString}`;
    const email = `testuser_${randomString}@example.com`;

    // Fill in the form
    cy.get('input[name="username"]').type(username)
    cy.get('input[name="email"]').type(email)
    cy.get('input[name="first_name"]').type('John')
    cy.get('input[name="last_name"]').type('Doe')
    cy.get('input[name="display_name"]').type('John Doe Jr.')
    cy.get('input[name="password"]').type('StrongPassword123!')

    // Submit the form
    cy.get('button[type="submit"]').click()

    // Assuming successful registration redirects to /login
    cy.url().should('include', '/login')

    // Check if redirect contains login success UI/Message if any
    cy.contains('Sign in to your account').should('be.visible')
  })

  it('shows error on duplicate username', () => {
    cy.visit('/register')

    // First we register a user via API to guarantee it exists
    const randomString = Math.random().toString(36).substring(2, 10);
    const username = `testuser_${randomString}`;
    const email = `testuser_${randomString}@example.com`;

    cy.request({
      method: 'POST',
      url: 'http://localhost:8000/api/users/register/',
      body: {
        username: username,
        email: email,
        first_name: 'John',
        last_name: 'Doe',
        password: 'StrongPassword123!'
      },
      failOnStatusCode: false
    })

    // Try to register with the same username
    cy.get('input[name="username"]').type(username)
    cy.get('input[name="email"]').type(`another_${email}`)
    cy.get('input[name="first_name"]').type('John')
    cy.get('input[name="last_name"]').type('Doe')
    cy.get('input[name="password"]').type('StrongPassword123!')

    cy.get('button[type="submit"]').click()

    // Assuming there is an error message displayed in the UI
    cy.contains('A user with that username already exists.').should('be.visible')
  })
})
