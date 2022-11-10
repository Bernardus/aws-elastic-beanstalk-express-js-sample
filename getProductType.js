const axios = require("axios").default;

let getOptionsBody = {
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
    "properties":{
      "associations":{
        "group":{}
      }
    }
  },
  "includes": {
      "product": ["children" , "id", "properties", "translated"],
      "property_group_option" : ["name", "translated", "group"],
      "property_group":["name"]
    },
  "total-count-mode":1
} ;


  const transformOptions = (data) => {
    let stockArr = [];
  
   for (const product of data) {
    stockArr.push({
        "id" : product.id,
        "values" : {'value' : mutateOptions(product)},
});
   }
   return stockArr

};

const mutateOptions = (product) => {
  let optionsArr = [];
  product.properties.forEach(
    (property) => {
      console.log(property.group)

      if(property.stock === 0){
        return
      }
      if(property.group.name !== "Categorie"){
        return
      }
      if(property.name === null){
        return
      }
      return optionsArr.push({ value: property.translated.name})
    }
  );
  return optionsArr;
};


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

const getProductType = async () => {
  let items = [];
  let pages = [];
  await axios({
    method: "POST", //you can set what request you want to be
    url: "https://www.freshcotton.com/store-api/product",
    data: getOptionsBody,
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
          data: { ...getOptionsBody,
          page : i + 1
          },
          method : "POST",
          headers: {
            "sw-access-key": "SWSCVEJAVLRZNXVBNJRDWDU1BA",
            "sw-include-seo-urls": 1,
          },
        })
      );
      pages.push(new Promise(function(resolve, reject) {
        setTimeout( resolve({ timeout : true}), 800)
     }));
    }
  }).catch(e => console.error(e))
  const allStock = await Promise.all(pages)
  allStock.forEach(response => {
    if(response.timeout){
      return;
    }
    if(items.length === 0){
      items = filterObject(response.data.elements, "apiAlias")
    } else {
      items = [...items , ...filterObject(response.data.elements, "apiAlias")];
    }   })
  return transformOptions(items);
};



module.exports = getProductType;
