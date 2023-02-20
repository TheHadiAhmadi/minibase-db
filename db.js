const knex = require('knex')
const knexfile = require('./knexfile')

/**
 * @type {knex.Knex}
 */
const db = knex(knexfile.development)

module.exports = { db }