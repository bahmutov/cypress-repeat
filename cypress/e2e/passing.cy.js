/// <reference types="cypress" />

// this spec is always passing
describe('cypress-repeat passing', () => {
  it('first', () => {
    cy.wait(100)
  })

  it('second', () => {
    cy.wait(100)
  })

  it('third', () => {
    cy.wait(100)
  })
})
