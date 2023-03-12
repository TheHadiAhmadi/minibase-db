const { db } = require("./db")

let tables = {}
let data = {}

/**
 * 
 * @param {any} builder 
 * @param {Column} column 
 */
function addColumn(builder, column) {
    if (!column.type || !column.name) throw new Error("column should have type and name fields");

    if (column.type === 'number') {
        return builder.decimal(column.name)
    } else if (column.type === 'id') {
        return builder.increments(column.name)
    } else if (column.type === 'string') {
        return builder.text(column.name)
    } else if (column.type === 'date') {
        return builder.timestamp(column.name)
    } else if (column.type === 'boolean') {
        return builder.boolean(column.name)
    } else {
        throw new Error('this type is not supported ' + column.type)
        // return builder.timestamp(column.name)
    }
}

function updateColumn(builder, column) {
    return addColumn(builder, column).alter()
}

/**
 * 
 * @param {Migration} command 
 * @param {Schema} schema 
 * @returns 
 */
async function addTableMigration(command) {
    console.log('addTableMigration', command)

    const { name, columns } = command

    console.log('addTableMigration', name, columns)

    await db.schema.createTable(name, builder => {
        addColumn(builder, { name: 'id', type: 'id' })

        columns.map(column => {
            if (column.name === 'id') return;
            addColumn(builder, column)
        })
    })


    return {
        type: 'remove-table',
        name,
        prev: command
    }
}

/**
 * 
 * @param {Schema} schema 
 * @param {string} table 
 * @param {string} column 
 * 
 * @returns {Migration}
 */
function getMigration(schema, table = '', column = '') {

    if (column) {
        return {
            type: 'add-column',
            table,
            name: column,
            schema: schema[table][column]
        }
    } else if (table) {
        const columns = Object.keys(schema[table])
            .map((columnName) => getMigration(schema, table, columnName))
            .map(migration => ({
                name: migration.name,
                type: migration.type
            }))

        return {
            type: 'add-table',
            name: table,
            columns
        }
    } else {
        // TODO
        console.log('not implemented!')
    }
}

/**
 * 
 * @param {Migration} command 
 * @param {Schema} schema 
 * @returns 
 */
async function renameTableMigration(command) {
    console.log('renameTableMigration', command)
    const { from, to } = command;

    await db.schema.renameTable(from, to)

    return {
        type: 'rename-table',
        from: to,
        to: from
    }
}


async function removeTableMigration(command) {
    const { name, prev } = command

    await db.schema.dropTable(name)

    const schema = await getSchema(0);
    const columns = Object.keys(schema[name] ?? {}).map(key => {
        return {
            type: schema[name][key],
            name: key
        }
    })

    return {
        type: 'add-table',
        name,
        columns
    }
}

async function addColumnMigration(command) {
    // console.log(command)
    const { table, name, schema } = command

    let defaultValue = null
    if (schema === 'number') defaultValue = 0
    if (schema === 'string') defaultValue = ''
    if (schema === 'boolean') defaultValue = false

    if (!table) {
        // 
    }
    // validate schema


    await db.schema.alterTable(table, (builder) => {
        addColumn(builder, { type: schema, name }).defaultTo(defaultValue)
    })

    return {
        type: 'remove-column',
        table,
        name,
    }

    // if (!tables[table]) {
    //     throw new Error('table does not exist')
    // }

    // data[table] = data[table].map(row => {
    //     return {
    //         ...row,
    //         [name]: defaultValue
    //     }
    // })

    // tables[table][name] = schema

    // return true
}
async function removeColumnMigration(command) {
    const { table, name } = command
    console.log('remove-column: ', { table, name })

    const schema = await getSchema(0)

    const result = await db.schema.alterTable(table, (builder) => {
        console.log(builder, name)
        builder.dropColumn(name)

    })

    console.log(result)
    return {
        type: 'add-column',
        table,
        name,
        schema: schema[table][name]
    }

    // if (!tables[table]) {
    //     throw new Error('table does not exist')
    // }

    // if (!tables[table][name]) {
    //     throw new Error('column does not exist')
    // }

    // delete tables[table][name]

    // data[table] = data[table].map(row => {
    //     delete row[name]
    //     return row
    // })

    // return true
}

// TODO: Schema does not change in rollback 
async function updateColumnMigration(command) {

    let { table, from, to, name, schema } = command

    if (name) {
        from = name
        to = name
    }

    await db.schema.alterTable(table, (builder) => {
        let q;

        if (schema) q = updateColumn(builder, { name: from, type: schema })
        if (from !== to) builder.renameColumn(from, to)

    })

    return {
        type: 'update-column',
        table,
        from: to,
        to: from,
    }
}

const migrationHandlers = {
    'add-table': addTableMigration,
    'remove-table': removeTableMigration,
    'rename-table': renameTableMigration,
    'add-column': addColumnMigration,
    'remove-column': removeColumnMigration,
    'update-column': updateColumnMigration
}

async function runMigration(command) {
    if (!migrationHandlers[command.type]) {
        console.log(command)
        throw new Error('this migration type is not valid: ' + command.type)
    }

    return await migrationHandlers[command.type](command)
}

// run Migration
exports.addMigration = async function (request) {
    const command = request.body

    // create migrations table
    if (!await db.schema.hasTable('__migrations__')) {
        console.log('table not exists')
        await db.schema.createTable('__migrations__', (builder) => {
            addColumn(builder, { name: 'id', type: 'id' })
            addColumn(builder, { name: 'value', type: 'string' })
            addColumn(builder, { name: 'rollback', type: 'string' })
        })
    }


    try {
        const output = await runMigration(command)
        const result = await db('__migrations__').insert({ value: command, rollback: output });

        return {
            id: result.id,
        }
        // res.send(output)
    } catch (err) {
        // res.send({message: 'failed to run migration', error: err.message})
        console.log('error', err)
        return {
            message: 'failed to run migration',
            error: err.message
        }
    }
}

async function getSchema(level) {
    const result = {}

    const migrations = (await db('__migrations__').select('*')).map(migration => migration.value)

    console.log(migrations)
    const last = Math.max(0, migrations.length - level)

    const shouldRunMigrations = migrations // todo

    for (let i = 0; i < last; i++) {
        const currentMigration = JSON.parse(shouldRunMigrations[i])

        switch (currentMigration.type) {

            case 'add-table': {
                result[currentMigration.name] = {};
                (currentMigration.columns ?? []).map(column => {
                    result[currentMigration.name][column.name] = column.type
                })
            } break;
            case 'add-column': result[currentMigration.table][currentMigration.name] = currentMigration.schema; break;
            case 'update-column': {
                result[currentMigration.table][currentMigration.to] = result[currentMigration.table][currentMigration.from]

                if (currentMigration.schema) result[currentMigration.table][currentMigration.to] = currentMigration.schema
                delete result[currentMigration.table][currentMigration.from]
            } break;
            case 'remove-table': delete result[currentMigration.name]; break;
            case 'remove-column': delete result[currentMigration.table][currentMigration.name]; break;
            case 'rename-table': {
                result[currentMigration.to] = result[currentMigration.from];
                delete result[currentMigration.from]
            } break;

        }

        // migrationHandlers[currentMigration.type](currentMigration, result)
    }

    console.log('schema: ', result)
    return result
}

exports.rollback = async function (request) {
    const { id } = request.params


    const allMigrations = await db('__migrations__').select('*')


    //  allMigrations.slice(id)
    let shouldRemoveMigrations = allMigrations.slice(allMigrations.length - id)

    for (let migration of shouldRemoveMigrations.reverse()) {
        await runMigration(JSON.parse(migration.rollback))  // get rollback from schema



        await db('__migrations__').delete().where({ id: migration.id })
    }
    // migrations = migrations.slice(0, migrations.length - id)
    // // return 
    // return migrations.length
}

// get Latest schema
exports.getLatestSchema = function (request) {
    return getSchema(0)
}
// get Schema by Id
exports.getSchemaById = function (request) {
    return getSchema(request.params.id)
}

exports.queryHandler = async (request) => {
    let { page, perPage, fields, filters, sort } = request.query
    const { table } = request.params

    // if (!await db.schema.hasTable(table)) {
    //     throw new Error('table doesn\'t exists')
    // }

    if (!perPage) perPage = 10;
    if (!page || page < 1) page = 1;
    if (!filters) filters = "[]";
    if (!fields) fields = "*";
    if (!sort) sort = ""

    try {

        let query = db(table).select(fields)

        const filtersJson = JSON.parse(filters);

        for (let filter of filtersJson) {
            const [key, value, operator] = filter.split(':');

            if (value === 'null') {
                if (operator === '!=') {
                    query = query.whereNotNull(key)
                } else if ((operator ?? '=') === '=') {
                    query = query.whereNull(key)
                }
            }
            if (operator === 'like') {
                query = query.whereLike(key, value)
            } else if (operator === 'in') {
                const values = value.split(',')
                query = query.whereIn(key, values)
            } else if (operator === 'between') {
                const [first, last] = value.split(',')
                query = query.whereBetween(key, [first, last])
            } else {
                query = query.where(key, operator ?? '=', value)
            }
        }

        if (sort) {
            let sortDirection = 'ASC'

            if (sort.startsWith('-')) {
                sort = sort.substring(1)
                sortDirection = 'DESC'
            }

            query = query.orderBy(sort, sortDirection)
        }

        const offset = (page - 1) * perPage;
        const [total, rows] = await Promise.all([
            db.count('* as count').from(table).first(),
            query.offset(offset).limit(perPage)
        ])

        return {
            data: rows,
            total: +total.count,
            perPage,
            page
        }
    } catch (err) {
        if (!await db.schema.hasTable(table)) {

            console.log(request)
            return 'Table not found'
        }
        else {
            console.log(err.message)
            return err.message

        }
    }

}

exports.updateHandler = async function (request) {
    const body = request.body
    const { id, table } = request.params

    if (!await db.schema.hasTable(table)) {
        throw new Error('table doesn\'t exists')
    }

    const result = await db(table).update(body).where({ id })

    return true;
}

function getNextId(table) {
    const ids = data[table].map(row => row.id)
    return (ids.reduce((prev, curr) => prev > curr ? prev : curr, 0) + 1)
}
exports.insertHandler = async function (request) {
    const body = request.body
    const { table } = request.params

    if (!await db.schema.hasTable(table)) {
        throw new Error('table doesn\'t exists')
    }

    const result = await db(table).insert(body).returning('*');

    return result;
}

exports.removeHandler = async function (request) {
    const { table, id } = request.params

    if (!await db.schema.hasTable(table)) {
        throw new Error('table doesn\'t exists')
    }

    await db(table).delete().where({ id })

    return true;
}

exports.getByIdHandler = async function (request) {
    const { table, id } = request.params
    const { fields } = request.query

    if (!await db.schema.hasTable(table)) {
        throw new Error('table doesn\'t exists')
    }

    return await db(table).select(fields).where({ id }).first()
}