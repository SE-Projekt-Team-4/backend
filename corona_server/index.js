/**
 * @file Run this file on a server to start the Corona-Timeslot application application
 * @version 0.0.1
 */

const Express = require('express')
const o_apiRouter = require('./modules/api/apiRouter')
const o_app = Express();

// If this is started on locahost and not a cloud foundry environment, use Port 8000 as default port
const n_port = process.env.PORT || 8000;


// Initialize API-Router
o_app.use('/api', o_apiRouter)

// Log server start
o_app.listen(n_port, () => {
  console.log(`Example app listening on port ${n_port}!`)
});





