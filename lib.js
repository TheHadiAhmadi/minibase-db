let migrations = []
let logs = []
let tables = {}
let data = {}

function addTableMigration(command, tables) {
    const name = command.name
    tables[name] = {}
    data[name] = []

    return true
}

function renameTableMigration(command, tables) {
    const {from, to} = command;
    tables[to] = tables[from]
    data[to] = data[from]

    delete tables[from]
    delete data[from]
    
    console.log('renameTable: ', {data, tables}, data[to])
    return true 
}
function removeTableMigration(command, tables) {
    const name = command.name
    delete tables[name]
    delete data[name]

    return true    
}

function addColumnMigration(command, tables) {
    // console.log(command)
    const {table, name, schema} = command

    let defaultValue = null
    if(schema === 'number') defaultValue = 0
    if(schema === 'string') defaultValue = ''
    if(schema === 'boolean') defaultValue = false

    if(!tables[table]) {
        throw new Error('table does not exist')
    }

    data[table] = data[table].map(row => {
        return {
            ...row,
            [name]: defaultValue
        }
    })
    
    tables[table][name] = schema

    return true
}
function removeColumnMigration(command, tables) {
    const {table, name} = command

    
    if(!tables[table]) {
        throw new Error('table does not exist')
    }
    
    if(!tables[table][name]) {
        throw new Error('column does not exist')
    }

    delete tables[table][name]

    data[table] = data[table].map(row => {
        delete row[name]
        return row
    })

    return true
}

function updateColumnMigration(command) {

    let {table, from, to, name, schema} = command

    if(name) {
        from = name
        to = name
    }

    if(!schema) {
        schema = tables[table][from]
    }
        
    if(!tables[table]) {
        throw new Error('table does not exist')
    }
    
    if(!tables[table][from]) {
        throw new Error('column does not exist')
    }
    
    tables[table][to] = schema

    data[table] = data[table].map(row => {
        row[to] = row[from]
        delete row[from]
        return row
    })
    
    return true
}

const migrationHandlers = {
    'add-table': addTableMigration,
    'remove-table': removeTableMigration,
    'rename-table': renameTableMigration,
    'add-column': addColumnMigration,
    'remove-column': removeColumnMigration,
    'update-column': updateColumnMigration
}

// run Migration
exports.addMigration = function(request) {
    const command = request.body

    try {
        if(!migrationHandlers[command.type]) {
            throw new Error('this migration type is not valid')
        }
        const output = migrationHandlers[command.type](command, tables)
        migrations.push(command)
        return {
            id: migrations.length,
            output
        }
        // res.send(output)
    } catch(err) {
        // res.send({message: 'failed to run migration', error: err.message})
        console.log('error', err )
        return {
            message: 'failed to run migration',
            error: err.message
        }
    }
} 

function getSchema(level) {
    const result = {}

    const last = Math.max(0, migrations.length - level)
    
    for(let i=0; i<last; i++) {
        const currentMigration = migrations[i]
        migrationHandlers[currentMigration.type](currentMigration, result)
    }
    return result
}

exports.rollback = function(request) {
    const { id } = request.params
    migrations = migrations.slice(0, migrations.length - id)
    // return 
    return migrations.length
}

// get Latest schema
exports.getLatestSchema = function(request) {
    return getSchema(0)
}
// get Schema by Id
exports.getSchemaById = function(request) {
    return getSchema(request.params.id)
}

exports.queryHandler = (request) => {
    let {page, perPage, filters, sort} = request.query
    const {table} = request.params   

    if(!tables[table]) {
        throw new Error('table doesn\'t exists')
    }

    if(!perPage) perPage = 10;
    if(!page) page = 1;
    if(!filters) filters = "[]";

    const rows = data[table] ?? []


    console.log(rows)


    return {
        data: rows,
        total: rows.length,
        perPage,
        page
    }
}

exports.updateHandler = function(request) {
    const body = request.body
    const {id, table} = request.params
    
    if(!tables[table]) {
        throw new Error('table doesn\'t exists')
    }

    delete body['id']

    data[table] = data[table].map(row => {
        if(row.id === +id) return {...row, ...body}
        return row
    })

    return body;
}

function getNextId(table) {
    const ids = data[table].map(row => row.id)
    return (ids.reduce((prev, curr)=> prev > curr ? prev : curr, 0) + 1)
}
exports.insertHandler = function(request) {
    const body = request.body
    const {table} = request.params

    if(!tables[table]) {
        throw new Error('table doesn\'t exists')
    }
    
    body.id = getNextId(table)
    data[table] = [...data[table], body]

    return body;
}


exports.removeHandler = function(request) {
    const {table, id} = request.params

    if(!tables[table]) {
        throw new Error('table doesn\'t exists')
    }

    data[table] = data[table].filter(row => row.id !== +id);

    return true;
}