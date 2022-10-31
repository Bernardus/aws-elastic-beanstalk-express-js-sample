const axios = require("axios").default;

let getVariantsBody = {
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
        "property_group_option" : ["name", "translated"]
      },
    "total-count-mode":1
  } ;

  const transformVariants = (data) => {
    let variantsArr = [];
  
   for (const product of data) {
    
    variantsArr.push({
        "id" : product.id,
        "values": [mutateVariants(product)],
});
   }
   return variantsArr

};

const mutateVariants = (product) => {
  let variantsArr = [];
  product.children.forEach(
    (variant) => {
      if(variant.stock === 0){
        return
      }
      if(variant.options?.[0].translated.name === null){
        return
      }
      return variantsArr.push({ value: variant.options?.[0].translated.name })
    }
  );
  return unique(variantsArr);
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

let uniqueIds = [];
const unique = (arr) => {
  uniqueIds = []
 return arr.filter(element => {
  const isDuplicate = uniqueIds.includes(element.value);

  if (!isDuplicate) {
    uniqueIds.push(element.value);
    return true;
  }
  return false;
});
}

let items = [];
async function getVariants(data) {
  // As this is a recursive function, we need to be able to pass it the prevous data. Here we either used the passed in data, or we create a new objet to hold our data.
  await axios({
    method: "POST", //you can set what request you want to be
    url: "https://www.freshcotton.com/store-api/product",
    data: getVariantsBody,
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
      getVariantsBody.page++
      // We check if there is more paginated data to be obtained
      if (items.length < response.data.total) {
          // If nextPageUrl is not null, we have more data to grab
          return getVariants();
      }
  }).catch(function (error) {
    console.log(error);
  });
  return transformVariants(items);

}



module.exports = getVariants;