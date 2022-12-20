const axios = require("axios").default;
const getAuth = require("./getAuth");

let getProductBody = {
  "page":1,
  "limit":100,
  "filter":[
    {
      "type":"equals",
      "field":"product.parentId",
      "value": null
    },
    {
      "type":"equals",
      "field":"product.active",
      "value":true
    },
    {
      "type":"multi",
      "operator":"or",
      "queries":[
        {
          "type":"range",
          "field":"stock",
          "parameters":{
            "gte":1
          }
        },
        {
          "type":"range",
          "field":"children.stock",
          "parameters":{
            "gte":1
          }
        }
      ]
    },
    {
  "type": "not",
  "queries": [
    {
      "type": "equals",
      "field": "product.coverId",
      "value": null
    }
  ]
}

  ],
  "associations":{
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
  "includes":{
    "product":[
      "ean",
      "id",
      "manufacturer",
      "options",
      "name",
      "sortedProperties",
      "property_group",
      "seoUrls",
      "translated.name",
      "streamIds",
      "calculatedPrice",
      "releaseDate",
      "media",
      "customFields",
      "cover",
      "coverId"
    ],
    "calculated_price":[
      "unitPrice",
      "listPrice"
    ],
    "cart_list_price":[
      "price"
    ],
    "product_media":[
      "media"
    ],
    "media":[
      "url",
      "thumbnails"
    ],
    "media_thumbnail":[
      "width",
      "height",
      "url"
    ],
    "seo_url":[
      "seoPathInfo"
    ],
    "property_group":[
      "property_group_option",
      "name",
      "options.name"
    ],
    "product_manufacturer":[
      "name"
    ],
    "property_group_option":[
      "name"
    ]
  },
  "total-count-mode":1
};

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
      price: product.calculatedPrice?.unitPrice || 0,
      url: product.seoUrls?.[0].seoPathInfo,
      image: getImage(product.media[0]),
      stock: 0,
      attributes: {
        attribute: [
          ...getProperties(product.sortedProperties),
          ...getCustomFields(product.customFields),
          getSecondImage(product.media[1]),
          getOldPrice(product.calculatedPrice?.listPrice?.price || null),
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
    if (typeof obj[i] == "object") {
      filterObject(obj[i], key);
    } else if (i == key) {
      delete obj[key];
    }
  }
  return obj;
}

const getSecondImage = (secondImage) => {
  return {
    name: "second_image",
    value:
      secondImage?.media?.thumbnails?.find((thumbnail) => thumbnail.width == "650")?.url || null,
  };
};

const getImage = (image) => {
  return image?.media?.thumbnails?.find((thumbnail) => thumbnail.width == "650")?.url || null;
};

const getProperties = (properties) => {
  let propertiesArr = [];
  properties.forEach((property) => {
    if (property.name !== "Kleur" && property.name !== "Categorie" && property.name !== "Seizoen") {
      return;
    }

    propertiesArr.push({
      name: property.name,
      value: property.options[0].name,
    });
  });
  return propertiesArr;
};

  const getReleaseDate = (releaseDate) => {
  return {
    name: "releaseDate",
    value: releaseDate,
  };
};

const getOldPrice = (oldPrice) => {
  if (!oldPrice) {
    return {};
  }
  return {
    name: "old_price",
    value: oldPrice,
  };
};

const getCustomFields = (custom_fields) => {
  if (!custom_fields) {
    return [];
  }
  let customFieldsArr = [];
  Object.keys(custom_fields).forEach((key) => {
    if (!key) {
      return;
    }
    if(key !== 'custom_pdp_releasetimer'){
      return;
    }
    customFieldsArr.push({ name: key, value: custom_fields[key] });
  });
  return customFieldsArr;
};

const getVariants = (variants) => {
  let variantsArr = [];
  variants.forEach((variant) => {
    return variantsArr.push({ name: `Size`, value: variant.options?.[0].name });
  });
  return variantsArr;
};

const getCategories = (categories) => {
  if (!categories) {
    return;
  }
  return categories.map(
    (category) => ({ categoryid: "31_" + category }, { categoryid: "44_" + category })
  );
};
let items = [];


const getProducts = async (token = false) => {
  const credentials = token ? token : await getAuth()

  let items = [];
  let pages = [];
  await axios({
    method: "POST", //you can set what request you want to be
    url: "https://www.freshcotton.com/store-api/product",
    data: getProductBody,
    headers: {
      "sw-access-key": "SWSCVWPZYKFLAG40DKNCCVHKCQ",
      "sw-include-seo-urls": 1,
    },
  }).then((response) => {
    const pagination = response.data.total / 100;
    for (let i = 0; i < pagination; i++) {
      pages.push(
        axios({
          url: "https://www.freshcotton.com/store-api/product",
          data: { ...getProductBody,
          page : i + 1
          },
          method : "POST",
          headers: {
            "sw-access-key": "SWSCVWPZYKFLAG40DKNCCVHKCQ",
            "sw-include-seo-urls": 1,
          }
        })
      );
      pages.push(new Promise(function(resolve, reject) {
        setTimeout( resolve({ timeout : true}), 800)
     }));
    }
  });
  const allProducts = await Promise.all(pages).catch(e => console.log(e));

  allProducts.forEach(response => {
    if(!response.data){
      return;
    }
    if(response.timeout){
      return;
    }
    if(items.length === 0){
      items = filterObject(response.data.elements, "apiAlias")
    } else {
      items = [...items , ...filterObject(response.data.elements, "apiAlias")];
    }   
  })
  
  return transformProducts(items);
};


module.exports = getProducts;