const axios = require('axios').default;
const getAuth = require("./getAuth");

const getCategoriesBody = {
  "page": 1, 
    "includes": {
      "category": ["id","path", "name", "productAssignmentType", "productStreamId" ]
    },
    "total-count-mode":1
  }



const transformCategories = async (data) =>{
  let transformedCategories = [];
  data.forEach(category => {
    transformedCategories.push({
      "name" : category.translated?.name || category.name,
      "streamId" : category.productStreamId,  
      "categoryid" : '44_' + category.id,
      "parents" : { 'categoryid' :  category.path ? '44_' + category.path.slice(1, -1).split('|').at(-1) : 44},
      "rank" : category.path ? category.path.slice(1, -1).split('|').length : 1,
    })
    transformedCategories.push({
      "name" : category.translated?.name || category.name,
      "streamId" : category.productStreamId,  
      "categoryid" : 'nl-NL_' + category.id,
      "parents" : { 'categoryid' :  category.path ? 'nl-NL_' + category.path.slice(1, -1).split('|').at(-1) : 31},
      "rank" : category.path ? category.path.slice(1, -1).split('|').length : 1,
    })
  })


  transformedCategories.unshift({
    "name" : "Freshcotton",
    "categoryid" : 1,
    "rank": 1
  },{
  "name" : "English",
  "categoryid" : 44,
  "rank": 1,
  "parents" : { 'categoryid' : 1 }
},
{
"name" : "Nederlands",
"categoryid" : 31,
"rank": 2,
"parents" : { 'categoryid' : 1 }
})



 return transformedCategories
}

    async function getCategories(data, token = false) {
      const credentials = token ? token : await getAuth()
      // As this is a recursive function, we need to be able to pass it the prevous data. Here we either used the passed in data, or we create a new objet to hold our data.
      data = [];
      await axios({
        method: "POST", //you can set what request you want to be
        url: "https://www.freshcotton.com/api/search/category",
        data: getCategoriesBody,
        headers: {
          "Authorization": 'Bearer ' + credentials
        },
      }).then(response => {
          // We merge the returned data with the existing data
          data = response.data.data
          getCategoriesBody.page++
          // We check if there is more paginated data to be obtaine

      });

      return transformCategories(data);
    }


module.exports = getCategories;