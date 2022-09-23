const axios = require("axios").default;

let getStockBody = {
    "page":1,
    "limit" : 100,
    "filter":[
      {
        "type":"equals",
        "field":"product.parentId",
        "value":null
      },
      {
        "type":"equals",
        "field":"product.active",
        "value":true
      },
    
           { 
              "type": "multi",   
              "operator": "or",
              "queries": [
                  {
                      "type": "range",
                      "field": "stock",
                      "parameters": {
                      "gte": 1      
              }
                  },
                  {
                      "type": "range",
                      "field": "children.stock",
                      "parameters": {
                      "gte": 1      
              }
                  } 
              ]
          }
    ],
    "associations":{
      "children":{
        "associations":{
          "options":{}
        }
      }
    },
    "includes": {
        "product": ["ean","children" , "options", "id", "stock"],
        "property_group_option" : ["name"]
      },
    "total-count-mode":1
  } ;

  const transformStock = (data) => {
    let stockArr = [];
  
   for (const product of data) {
    stockArr.push({
        "id" : product.id,
        "values" : {'value' : mututeStock(product)},
});
   }
   return stockArr

};

function mututeStock(product){
  return product.children.reduce(
    (acc, child ) => {
     return acc + child.stock;
    }, product.stock
)
}


function filterObject(obj, key) {
  for (var i in obj) {
      if (!obj.hasOwnProperty(i)) continue;
      if (typeof obj[i] == 'object') {
          filterObject(obj[i], key);
      } else if (i == key) {
          delete obj[key];
      }
  }
  return obj;
}

let items = [];
async function getStock(data) {
  // As this is a recursive function, we need to be able to pass it the prevous data. Here we either used the passed in data, or we create a new objet to hold our data.
  await axios({
    method: "POST", //you can set what request you want to be
    url: "https://www.freshcotton.com/store-api/product",
    data: getStockBody,
    headers: {
      "sw-access-key": "SWSCVEJAVLRZNXVBNJRDWDU1BA",
      "sw-include-seo-urls": 1,
    },
  }).then(response => {
      // We merge the returned data with the existing data
      if(items.length === 0){
        items = filterObject(response.data.elements, "apiAlias")
      } else {
        items = [...items , ...filterObject(response.data.elements, "apiAlias")];
      }
      getStockBody.page++
      // We check if there is more paginated data to be obtained
      if (items.length < response.data.total) {
          // If nextPageUrl is not null, we have more data to grab
          return getStock();
      }
  }).catch(function (error) {
    console.log(error);
  });
  return transformStock(items);

}



module.exports = getStock;
