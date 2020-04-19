require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express')
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
const app = express()

mongoose
    .connect(process.env.DB_STRING, {
        useNewUrlParser: true,
        useFindAndModify: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
    .then(res => console.log(`DB connected`))
    .catch(err => console.log(`DB error: ${err}`))

app.use(express.json())
app.use(morgan('dev'))
app.use(cors())

app.use('/api', authRoutes)
app.use('/api', userRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`listening at port ${PORT}`));