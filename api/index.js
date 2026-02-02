const express = require('express')
const app = express();
const morgan = require('morgan')
app.set('port',8000)
app.listen(app.get('port'),()=> console.log(`Ésta rodando na porta ${app.get('port')}` )
)