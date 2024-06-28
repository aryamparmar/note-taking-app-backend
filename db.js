
const {MONGO_URI} = require('./config.js');
const mongoose = require('mongoose');

const db = mongoose.connect(MONGO_URI)
.then(()=>{
    console.log({message:'Databases are connected!'})
})
.catch((error)=>{
    console.log({message:error.message})
})

module.exports = db

