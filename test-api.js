const base = 'http://localhost:2999';
// const base = 'https://test-db-1234.vercel.app';

// create table
// fetch(base + '/migrate', {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//         type: 'add-table',
//         name: 'products',
//         columns: [
//             { name: 'name', type: 'string' },
//             { name: 'sku', type: 'string' },
//             { name: 'count', type: 'number' },
//         ]
//     })
// })

// get schema
fetch(base + '/schema', { method: 'POST' }).then(res => res.json()).then(console.log)

fetch(base + '/products?test=123').then(res => res.json()).then(console.log);
// fetch(base + '/products', {
//     method: 'POST', body: JSON.stringify({
//         name: 'product 2', sku: 'sdfd', count: 8
//     })
// })