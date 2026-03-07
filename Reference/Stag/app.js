// Import
const express = require("express");	// Express

// Initiate
const server = express().use(express.static(__dirname));

// Routes
server.get("/", (req,res) => { res.sendFile(`${__dirname}/index.html`) });	// Index

// Console
server.listen(80, () => { console.log(`Running`) });