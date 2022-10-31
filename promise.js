const axios = require("axios").default;

const getVariants = async () => {
    let pages = [];

      for (let i = 0; i < 10; i++) {
    
        pages.push(
            axios("http://worldtimeapi.org/api/timezone/Europe/Amsterdam")
        )

        pages.push(new Promise(resolve => {
            setTimeout(() => {
                resolve({'data': true});
            }, 1000*(i+1))
        }))
    
}

    
    const allVariants = await Promise.all(pages)
    allVariants.forEach(response => {
     console.log(response.data)
  });
}

  getVariants()


