const { addMigration, rollback, getLatestSchema, queryHandler, updateHandler, insertHandler, removeHandler, getByIdHandler } = require("./lib");

async function test() {

    // const result = await queryHandler({
    //     params: {
    //         table: 'users'
    //     },
    //     query: {
    //         fields: ['name', 'email', "age"],
    //         filters: '["age:3,18:between"]',
    //         sort: '-name',
    //         perPage: 5,
    //         page: 1
    //     }
    // })

    // const result = await getByIdHandler({
    //     params: {
    //         table: 'users',
    //         id: 1
    //     },
    //     query: {}
    // })

    // const result = await insertHandler({
    //     params: {
    //         table: 'users',
    //     },
    //     body: [{
    //         name: 'HAdi',
    //         email: 'hadi@gmail.com'
    //     }, {
    //         name: 'testttttststst',
    //         email: 'testststst@gmail.com'
    //     }]
    // })

    // const result = await updateHandler({
    //     params: {
    //         table: 'users',
    //         id: 4
    //     },
    //     body: {
    //         age: 5
    //     }
    // })

    await addMigration({
        body: {
            type: 'add-table', name: 'users', columns: [
                {
                    name: 'id', type: 'id'
                },
                {
                    name: 'email', type: 'string'
                },
                {
                    name: 'name', type: 'string'
                },
                {
                    name: 'age', type: 'number'
                },

            ]
        }
    })

    // await addMigration({
    //     body: {
    //         type: 'remove-table', name: 'another'
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

    // await getLatestSchema({})
    // await rollback({ params: { id: 1 } })

    // await getLatestSchema({})
    // await rollback({ params: { id: 1 } })


    // await getLatestSchema({})
}


test().then(() => {
    process.exit()
})
// addMigration({
//     body: {
//         type: 'add-column', table: 'new_users3', name: 'name', schema: 'string'
//     }
// })

// addMigration({body: {type: 'add-table', name: 'users'}})