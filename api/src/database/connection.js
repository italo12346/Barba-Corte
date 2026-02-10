const mongoose = require('mongoose')
require('dotenv').config()

const { DB_URI } = process.env
const URI = DB_URI

mongoose.connect(URI).then(db => console.log('DB is connected')).catch(err => console.error(err))
