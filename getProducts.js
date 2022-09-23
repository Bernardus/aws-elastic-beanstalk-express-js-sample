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



const transformProducts = (data) => {
  let productArr = [];

 for (const product of data) {
    productArr.push({
      name: product.translated.name,
      id: product.id,
      groupcode: product.id,
      brand: product.manufacturer.name,
      streamIds: product.streamIds,
      categories: getCategories(product.categoryIds),
      price: product.calculatedPrice?.unitPrice || 0 ,
      old_price: product.calculatedPrice.listPrice?.price,
      url: product.seoUrls?.[0].seoPathInfo,
      image: product.media[0].media?.thumbnails?.[1]?.url,
      stock : 0,
      attributes: {
        attribute: [
          ...getProperties(product.sortedProperties),
          ...getCustomFields(product.customFields),
          getSecondImage(product.media[1]),
          getReleaseDate(product.releaseDate), 
        ],
      },
    });
  }
  return productArr;
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


const getThumbnails = (thumbnails) => {
  return thumbnails.map((thumbnail) => ({
    name: `thumb-${thumbnail.width}x${thumbnail.height}`,
    value: thumbnail.url,
  }));
};

const getSecondImage = (secondImage) => {
  return ({
    name: 'second_image',
    value: secondImage?.media?.thumbnails?.[0]?.url
  })
};


const getProperties = (properties) => {
  let propertiesArr = [];
  properties.forEach((property) => {
    if( property.name !== 'Kleur' && property.name !== 'Categorie'){
      return
    }
   
    propertiesArr.push({
    name: property.name,
    value: property.options[0].name,
  })});
  return propertiesArr;
};

const getReleaseDate = (releaseDate) => {
  return ({
    name: 'releaseDate',
    value: releaseDate
  })
};

const getCustomFields = (custom_fields) => {
  if(!custom_fields){
    return [];
  }
  let customFieldsArr = [];
  Object.keys(custom_fields).forEach((key) => {
    if(!key){
      return;
    }
   customFieldsArr.push({ name: key, value: custom_fields[key] })
  }
  );
  return customFieldsArr;
};

const getVariants = (variants) => {
  let variantsArr = [];
  variants.forEach(
    (variant) => {
      return  variantsArr.push({ name: `Size`, value: variant.options?.[0].name })
    }
  );
  return variantsArr;
};

const getCategories = (categories) => {
  if (!categories) {
    return;
  }
  return categories.map((category) => ({ "categoryid" :'31_' + category },{ "categoryid" : '44_' +  category }));
};


let items = [];
async function getProducts() {
  // As this is a recursive function, we need to be able to pass it the prevous data. Here we either used the passed in data, or we create a new objet to hold our data.
  await axios({
    method: "POST", //you can set what request you want to be
    url: "https://www.freshcotton.com/store-api/product",
    data: getProductBody,
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
      getProductBody.page++
      console.log(getProductBody.page)
      // We check if there is more paginated data to be obtained
      if (items.length < response.data.total) {
          // If nextPageUrl is not null, we have more data to grab
          return getProducts();
      }
  }).catch(function (error) {
    console.log(error);
  });
  return transformProducts(items);

}



module.exports = getProducts;
