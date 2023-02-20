const { addMigration, rollback, getLatestSchema } = require("./lib");

async function test() {
    // await addMigration({
    //     body: {
    //         type: 'add-table', name: 'users', columns: [{
    //             name: 'id', type: 'id'
    //         }, {
    //             name: 'abc', type: 'string'
    //         }]
    //     }
    // })

    // await addMigration({
    //     body: {
    //         type: 'rename-table', to: 'new_users2', from: 'users'
    //     }
    // })

    // await addMigration({
    //     body: {
    //         type: 'remove-table', name: 'new_users2'
    //     }
    // })
    // // await addMigration({
    // //     body: {
    // //         type: 'rename-table', to: 'test4', from: 'new_users2'
    // //     }
    // // })
    // // await addMigration({
    // //     body: {
    // //         type: 'update-column', table: 'test4', from: 'abc', to: 'def', schema: 'number'
    // //     }
    // // })

    // // await getLatestSchema({})

    // // await rollback({ params: { id: 1 } })

    // // await getLatestSchema({})
}


test()
// addMigration({
//     body: {
//         type: 'add-column', table: 'new_users3', name: 'name', schema: 'string'
//     }
// })

// addMigration({body: {type: 'add-table', name: 'users'}})