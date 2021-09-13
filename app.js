const express = require("express");
const path = require("path");
const mysql = require("mysql");
const dotenv = require("dotenv");


dotenv.config({
    path: './.env'
});



const app = express();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE,
    port: process.env.DATABASE_PORT

});

const publicDirectory = path.join(__dirname,'./public');
app.use(express.static(publicDirectory));

//Parse URL-encoded bodies (as sent by HTML forms): means that make sure that you grab data from any form
app.use(express.urlencoded({
    extended: false
}));

//Parse JSON bodies (as sent by API clients)
app.use(express.json());



app.set('view engine', 'hbs');




//Connect DB
db.connect((error)=>{
    if(error) {
        console.log(error);
    }
    else{
        console.log("Database Connected");
    }
})


//Define routes
app.use('/',require('./routes/pages.js'));
app.use('/auth', require('./routes/auth'));




app.listen(3306,()=>{
    console.log("Server started at Port 33306");
});



