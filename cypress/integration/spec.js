/// <reference types="cypress" />

describe('cypress-repeat', () => {
  it('first', () => {
    cy.wait(100)
  })

  it('second', () => {
    cy.wait(100)
  })

  it('third', () => {
    cy.wait(100)

    // if you want the test to fail on purpose
    // expect(false, 'always fails').to.be.true

    // if you want randomly fail
    // expect(Math.random(), 'random float').to.be.lessThan(0.4)
  })
})
