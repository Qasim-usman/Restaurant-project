const express = require('express');
const router = express.Router();
const path = require("path")
const Menu = require('../models/menu');

// Import the restaurant controller
router.get('/', async(req, res) => {
    const menus =await Menu.find()
    res.render('pages/restautrant',{menus});
})

module.exports =router