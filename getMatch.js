
const getMatch = (categories, products, variants) => {
  products.forEach((product) => {
    if (!product.categories) {
      product.categories = [];
    }
    if (!product.streamIds) {
      return;
    }
    let ids = [];
    product.streamIds.forEach((stream) => {
      categories.forEach((category) => {
        if (stream === category.streamId) {
            ids.push(category.categoryid);
        }
      })
      product.categories = { 'categoryid' : ids };
      delete product.streamIds;
  });
 });

  // for (const product of products) {
  //     if(!product.categoryIds){
  //     product.categoryIds = []
  //     }
  //     if(!product.streamIds){
  //         return;
  //     }
  //     for(const stream of product.streamIds){
  //         for(category in categories ){
  //             if(category.streamId == stream){
  //                 console.log({ 'c' : category.streamId , 'p' : stream})
  //                 product.categoryIds.push(category.id)
  //             }
  //         delete category.streamId;
  //         }
  //     }
  // }

  return products;
};

module.exports = getMatch;
