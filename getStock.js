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

const getStock = async () => {
  let items = [];
  let pages = [];
  await axios({
    method: "POST", //you can set what request you want to be
    url: "https://www.freshcotton.com/store-api/product",
    data: getStockBody,
    headers: {
      "sw-access-key": "SWSCVEJAVLRZNXVBNJRDWDU1BA",
      "sw-include-seo-urls": 1,
    },
  }).then((response) => {
    const pagination = response.data.total / 100;
    for (let i = 0; i < pagination; i++) {
      pages.push(
        axios({
          url: "https://www.freshcotton.com/store-api/product",
          data: { ...getStockBody,
          page : i + 1
          },
          method : "POST",
          headers: {
            "sw-access-key": "SWSCVEJAVLRZNXVBNJRDWDU1BA",
            "sw-include-seo-urls": 1,
          },
        })
      );
    }
  }).catch(e => console.error(e))
  const allStock = await Promise.all(pages)
  allStock.forEach(response => {
    if(items.length === 0){
      items = filterObject(response.data.elements, "apiAlias")
    } else {
      items = [...items , ...filterObject(response.data.elements, "apiAlias")];
    }   })
  
  return transformStock(items);
};



module.exports = getStock;
