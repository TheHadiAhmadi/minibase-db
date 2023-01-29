// api for minibase db

// query => filter sort paginate, preloads, ...
// insert => insert data with support of preloads, ...
// update => update data (preloads)
// remove => hard delete 

const express = require('express')
const { addMigration, getLatestSchema, getSchemaById, queryHandler, insertHandler, updateHandler, removeHandler, rollback } = require('./lib')
const mainRouter = express.Router()

function getHandler(func) {
    return async (req, res) => {
        const body = req.body 
        const params = req.params
        const query = req.query
        const output = await func({body, params, query})
        res.json(output)
    }
}

mainRouter.post('/migrate', getHandler(addMigration))
mainRouter.post('/schema', getHandler(getLatestSchema))
mainRouter.post('/schema/:id', getHandler(getSchemaById))
mainRouter.post('/rollback/:id', getHandler(rollback))
mainRouter.post('/', getHandler(queryHandler))
mainRouter.post('/insert', getHandler(insertHandler))
mainRouter.post('/update', getHandler(updateHandler))
mainRouter.post('/remove', getHandler(removeHandler))

const app = express()

app.use(express.json())
app.use(mainRouter)

const port = process.env.PORT || 2999
app.listen(port, () => console.log(`listening on port ${port}`))
module.exports = app
