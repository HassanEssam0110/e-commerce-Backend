//@desc  ==>  script to insert or remove data to Database 

const fs = require('fs');
require('colors');
const dotenv = require('dotenv');
const productModel = require('../../models/productModel');
const dbConnection = require('../../config/database');

dotenv.config({ path: '../../config.env' });

// connect to DB
dbConnection();

// Read data
const products = JSON.parse(fs.readFileSync('./products.json'));


// Insert data into DB
const insertData = async () => {
  try {
    await productModel.create(products);

    console.log('Data Inserted'.green.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// Delete data from DB
const destroyData = async () => {
  try {
    await productModel.deleteMany();
    console.log('Data Destroyed'.red.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === '-i') {
  //to run ==>  node seeder.js -i
  insertData();
} else if (process.argv[2] === '-d') {
  //to run ==> node seeder.js -d
  destroyData();
}
