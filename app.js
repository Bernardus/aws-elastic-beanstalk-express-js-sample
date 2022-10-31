require('dotenv').config()
const express = require('express');
const app = express();
const port = 8080;
const xml2js = require('xml2js');

const getProducts = require("./getProducts");
const getCategories = require("./getCategories");
const getMatch = require("./getMatch");
const getVariants = require("./getVariants");
const getStock = require("./getStock");

const xml = new xml2js.Builder({explicitChildren: true, preserveChildrenOrder : true});

const addTweakwiseHeader = (obj) =>{
    return {
      'tweakwise': {  
        $: {
          'xmlns:xsi': 'hatp://www.w3.org/2001/XMLSchema-instance',
          'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
          'shop': 'freshcotton.com'
        },
        ...obj
      }
    }
  }



app.get('/', async (req, res) => {
    const categories = await getCategories()
    const products = await getProducts()
    const productsWithCategory = getMatch(categories, products)
    const response = {
      statusCode: 200,
      headers: { 'Content-Type': 'application/xml' },
      body:  xml.buildObject(addTweakwiseHeader({ 'categories' : {'category': categories} ,  'items' : {'item' : productsWithCategory } }))
    }
    res.header(response.headers)
    res.send(response.body)
});

app.get('/variants', async (req, res) => {
    const variants = await getVariants()
    const response = {
    statusCode: 200,
    headers: { 'Content-Type': 'application/xml' },
    body:  xml.buildObject(({'items' : { 'item' : variants}}))
  }
    res.header(response.headers)
    res.send(response.body)
});


app.get('/stock', async (req, res) => {
    const stock = await getStock()
    const response = {
    statusCode: 200,
    headers: { 'Content-Type': 'application/xml' },
    body:  xml.buildObject(({'items' : { 'item' : stock}}))
  }
    res.header(response.headers)
    res.send(response.body)
});

app.get('/categories', async (req, res) => {
  const categories = await getCategories()
  const response = {
    statusCode: 200,
    headers: { 'Content-Type': 'application/xml' },
    body:  xml.buildObject(addTweakwiseHeader({ 'categories' : {'category': categories} }))
  }
  res.header(response.headers)
  res.send(response.body)
});

app.get('/products', async (req, res) => {
  const categories = await getCategories()
  const products = await getProducts()
  const productsWithCategory = getMatch(categories, products)
  const response = {
    statusCode: 200,
    headers: { 'Content-Type': 'application/xml' },
    body:  xml.buildObject(addTweakwiseHeader({ 'items' : {'item' : productsWithCategory } }))
  }
  res.header(response.headers)
  res.send(response.body)
});


app.get('/test', async (req, res) => {
  const products = await getProducts()
  const response = {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body:  products
  }
  res.header(response.headers)
  res.send(response.body)
});


app.listen(port);
console.log(`App running on http://localhost:${port}`);
