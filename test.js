const { addMigration, insertHandler, queryHandler, removeHandler } = require("./lib");

addMigration({body: {type: 'add-table', name: 'users'}})
// addMigration({body: {type: 'rename-table', from: 'users', to: 'edited_users'}})
addMigration({body: {type: 'add-column', table: 'users', name: 'id', schema: 'number'}})
addMigration({body: {type: 'add-column', table: 'users', name: 'name', schema: 'string'}})
// addMigration({body: {type: 'add-column', table: 'edited_users', name: 'name', schema: 'string'}})
// addMigration({body: {type: 'add-column', table: 'edited_users', name: 'email', schema: 'string'}})
// addMigration({body: {type: 'update-column', table: 'edited_users', from: 'email', to: 'test', schema: 'string'}})
// addMigration({body: {type: 'remove-column', table: 'edited_users', name: 'name'}})
// addMigration({body: {type: 'remove-table', name: 'edited_users'}})

const result = insertHandler({body: {name: 'test'}, params: {table: 'users'}})
console.log(result)

addMigration({body: {type: 'update-column', table: 'users', from: 'name', to: 'firstname',}})
addMigration({body: {type: 'add-column', table: 'users', name: 'lastname', schema: 'string'}})

insertHandler({body: {firstname: 'hadi2', lastname: 'ahmadi2'}, params: {table: 'users'}})

const result2 = insertHandler({body: {firstname: 'hadi', lastname: 'ahmadi'}, params: {table: 'users'}})
console.log(result2)

const result3 = queryHandler({params: {table: 'users'}, query: {}})
console.log(result3)

addMigration({body: {type: 'rename-table', from: 'users', to: 'new_users'}})

const result4 = removeHandler({params: {table: 'new_users', id: 2}})
console.log(result4)

const result5 = queryHandler({params: {table: 'new_users'}, query: {}})
console.log(result5)
