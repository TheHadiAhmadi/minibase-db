const knex = require('knex')
const knexfile = require('./knexfile')

/**
 * @type {knex.Knex}
 */
const db = knex(knexfile.staging)

// if(using postgresql) {
const pg = require('pg')
pg.types.setTypeParser(pg.types.builtins.NUMERIC, Number)
// }

module.exports = { db }