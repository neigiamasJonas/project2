const express = require("express"); 
const app = express(); 
const port = 3006; 
const cors = require("cors");

const mysql = require("mysql");
const md5 = require('js-md5');
const uuid = require('uuid');

app.use(express.json({ limit: '10mb' }));     // padidintas photo upload limitas + sql confige taip pat padidintas

app.use(cors());

app.use(

express.urlencoded({
    extended: true,
})
);

app.use(express.json());

const con = mysql.createConnection({

host: "localhost",
user: "root",
password: "",
database: "movies",
});