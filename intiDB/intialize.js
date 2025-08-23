const expres = require('express');
const mongoose = require('mongoose');
const Menu = require('../models/menu');
const foodItems = require('./data'); // Import the food items data
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/restaurant', );

}
const intiDB =async()=>{
 await Menu.deleteMany({}); // Clear existing data
 await Menu.insertMany(foodItems); // Insert food items from data.js
    console.log("Database initialized with food items");
}
intiDB()