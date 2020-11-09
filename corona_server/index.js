/**
 * @file Run this file on a server to start the Corona-Timeslot application application
 * @version 0.0.1
 */

const Express = require('express')
const o_apiRouter = require('./modules/api/apiRouter')
const o_app = Express();


// TODO: change port assignment when server gets deployed to production
// TODO: maybe also rework local log, if needed create log modules to make it easier to change later on
const n_port = process.env.PORT || 8000;


// Initialize API-Router
o_app.use('/api', o_apiRouter)

// TODO: Remove before going production
// simple test to see if server is accessible
o_app.get('/', (req, res) => {
  res.send('Hello World!')
});

// local log that server ist listening
o_app.listen(n_port, () => {
  console.log(`Example app listening on port ${n_port}!`)
});





