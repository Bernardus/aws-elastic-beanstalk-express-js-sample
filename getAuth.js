const axios = require('axios').default;

const getAuthBody = {
    "grant_type": "client_credentials",
    "client_id": "SWIABXBQNTY5EGXLBTFWQ3VIYG",
    "client_secret": "WUpEYVRybzIyWDRoY1BkQU5yYktPcG43N2RRaVdvQ1hWT1JqSDE"
}


const getAuth = async () => {
    const fetch = await axios({
        method: 'POST', //you can set what request you want to be
        url: `https://www.freshcotton.com/api/oauth/token`,
        data: getAuthBody
      })  
    return fetch.data.access_token;
}

module.exports = getAuth;