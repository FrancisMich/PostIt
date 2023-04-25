const mongoose = require('mongoose');

const uri = process.env.URI;

async function connect(){
    try {
        await mongoose.connect(uri);
        console.log('connected to MongoDB');
    } catch (error) {
        console.error(error);

    } 
    }
connect();

module.exports = connect;
