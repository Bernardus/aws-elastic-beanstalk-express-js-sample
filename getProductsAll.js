const axios = require("axios").default;
let getProductBody = {
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
      },
      "properties":{
        "associations":{
          "group":{}
        }
      },
      "media":{
        "sort":[
          {
            "field":"position",
            "order":"ASC",
            "naturalSorting":false
          }
        ],
        "total-count-mode":1
      },
      "manufacturer":{
        "sort":[
          {
            "field":"position",
            "order":"ASC",
            "naturalSorting":false
          }
        ],
        "total-count-mode":1
      },
      "options":{
        "sort":[
          {
            "field":"groupId",
            "order":"ASC",
            "naturalSorting":false
          },
          {
            "field":"id",
            "order":"ASC",
            "naturalSorting":false
          }
        ],
        "total-count-mode":1
      }
    },
    "includes": {
        "product": ["ean","id","manufacturer", "children", "options", "name", "sortedProperties", "property_group", "seoUrls", "translated.name", "streamIds", "calculatedPrice", "stock", "cover", "releaseDate","media"],
        "calculated_price": ["unitPrice", "listPrice"],
        "cart_list_price": ["price"],
        "product_media" : ["media"],
        "media": ["url", "thumbnails"],
        "media_thumbnail": ["width", "height", "url"],
        "seo_url": ["seoPathInfo"],
        "property_group": ["property_group_option", "name", "options.name"],
        "product_manufacturer": ["name"],
        "property_group_option": ["name"]
      },
    "total-count-mode":1
  } ;

const getProducts = async () => { 
    let pages = [];
    let items = [];
    await axios({
        method: "POST", //you can set what request you want to be
        url: "https://www.freshcotton.com/store-api/product",
        data: getProductBody,
        headers: {
        "sw-access-key": "SWSCVEJAVLRZNXVBNJRDWDU1BA",
        "sw-include-seo-urls": 1,
        },
    }).then(response => {
      console.log(response.data.total)
        const pagination = response.data.total / 100;
        for (let i = 0; i < pagination; i++){
         pages.push(fetch('https://www.freshcotton.com/store-api/product', { getProductBody , ...getProductBody.page = i ,  headers: {
          "sw-access-key": "SWSCVEJAVLRZNXVBNJRDWDU1BA",
          "sw-include-seo-urls": 1,
          } }))
        }
    })
    Promise.all(pages)
    .then(responses =>
      Promise.all(responses.map(res => res.json()))
      .then(data => {
        data.map(page => {
          if(items.length === 0){
            items = filterObject(response.data.elements, "apiAlias")
          } else {
            items = [...items , ...filterObject(response.data.elements, "apiAlias")];
          } 
        
        })
      })
  )
  return items
}


