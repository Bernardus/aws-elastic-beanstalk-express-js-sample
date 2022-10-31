require('dotenv').config()
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

  exports.handler = async (event) => {
    if(event.rawPath == '/'){
    const categories = await getCategories()
    const products = await getProducts()
    const productsWithCategory = getMatch(categories, products)
    const response = {
      statusCode: 200,
      headers: { 'Content-Type': 'application/xml' },
      body:  xml.buildObject(addTweakwiseHeader({ 'categories' : {'category': categories} ,  'items' : {'item' : productsWithCategory } }))
    }
    return response;    
    }
    if(event.rawPath == '/stock/'){
    const stock = await getStock()
    const response = {
    statusCode: 200,
    headers: { 'Content-Type': 'application/xml' },
    body:  xml.buildObject(({'items' : { 'item' : stock}}))
    
  }
  return response;    

    }
    if(event.rawPath == '/variants/'){
    const variants = await getVariants()
    const response = {
    statusCode: 200,
    headers: { 'Content-Type': 'application/xml' },
    body:  xml.buildObject(({'items' : { 'item' : variants }}))
  }
  return response;   
    }
  
    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body:  { 'message' : 'no url '}
    }

};