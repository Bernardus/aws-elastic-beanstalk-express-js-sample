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
        "product": ["ean","children" , "options", "id"],
        "property_group_option" : ["name"]
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
      if(!variant.options?.[0]?.name){
        return
      }
      return variantsArr.push({ value: variant.options?.[0]?.name || 'empty' })
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

const getVariants = async () => {
  let items = [];
  let pages = [];
  await axios({
    method: "POST", //you can set what request you want to be
    url: "https://www.freshcotton.com/store-api/product",
    data: getVariantsBody,
    headers: {
      "sw-access-key": "SWSCVEJAVLRZNXVBNJRDWDU1BA",
      "sw-include-seo-urls": 1,
      "sw-language-id": "2fbb5fe2e29a4d70aa5854ce7ce3e20b"
    },
  }).then((response) => {
    const pagination = response.data.total / 100;
    for (let i = 0; i < pagination; i++) {
      pages.push(
        axios({
          url: "https://www.freshcotton.com/store-api/product",
          data: { ...getVariantsBody,
          page : i + 1
          },
          method : "POST",
          headers: {
            "sw-access-key": "SWSCVEJAVLRZNXVBNJRDWDU1BA",
            "sw-include-seo-urls": 1,
            "sw-language-id": "2fbb5fe2e29a4d70aa5854ce7ce3e20b"
          },
        })
      );
      pages.push(new Promise(function(resolve, reject) {
        setTimeout( resolve({ timeout : true}), 800)
     }));
    }
  }).catch(e => console.error(e))
  const allVariants = await Promise.all(pages)
  allVariants.forEach(response => {
    if(response.timeout){
      return;
    }
    if(items.length === 0){
      items = filterObject(response.data.elements, "apiAlias")
    } else {
      items = [...items , ...filterObject(response.data.elements, "apiAlias")];
    }   })
  
  return transformVariants(items);
};



module.exports = getVariants;