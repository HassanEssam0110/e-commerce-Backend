const path = require('path')

const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');

const ApiError = require('./utils/ApiError');
const globalError = require('./middlewares/errorMiddlewares');
const dbConnection = require('./config/database');
//Routes
const mountRotes = require('./routes');

//configuration dotenv
dotenv.config({ path: "config.env" });

const app = express();

app.use(cors());//Enable All CORS Requests
app.options('*', cors()); // include before other routes

app.use(compression());// compress all responses

// Datebase connect
dbConnection();

//Middlewares
app.use(express.json());   //==>MW parsing
app.use(express.static(path.join(__dirname, 'uploads')))


//MW Logging by morgan in development mode
if (process.env.NODE_ENV === 'development') {
    //MW Logging
    app.use(morgan('dev'));
    console.log(`MODE: ${process.env.NODE_ENV}`)
}

//Mount Routes
mountRotes(app)



app.get('/', (req, res) => {
    res.send("Hello world")
})



//MW NOT FOUND Error handler
app.all('*', (req, res, next) => {
    next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400))
})


//MW Global Error handler for express
app.use(globalError)



const PORT = process.env.PORT || 5000
const server = app.listen(PORT, () => {
    console.log(`server running on prot: ${PORT}`)
})



//Events ==> list ==> callback(err)  
//@desc   Handle rejection outside express ex: database
process.on('unhandledRejection', (error) => {
    console.error(`unhandledRejection Error:   ErrorName:${error.name}  |  ErrorMessage:${error.message}`);
    server.close(() => {
        console.error(`Shutting down...`);
        process.exit(1);
    })
})
