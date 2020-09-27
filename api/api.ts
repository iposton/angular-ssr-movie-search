let request = require('request');
let methods: any = {};
let searchInfo = [];
let trailerInfo = [];

methods.search = async (term: string, apiKey: string) => {
  let searchQuery = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&page=1&include_adult=false&query=${term}`;
  let searchPromise = new Promise((resolve, reject) => {
    request(searchQuery, {}, function(err, res, body) {
      let data = JSON.parse(body);
      searchInfo = data['results'];
      resolve();
    });
  });
  let result = await searchPromise;
  return searchInfo;
}

methods.trailer = async (id: string, apiKey: string) => {
  let apiUrl = `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}&language=en-US`;
  let trailerPromise = new Promise((resolve, reject) => {
    request(apiUrl, {}, function(err, res, body) {
      let data = JSON.parse(body);
      trailerInfo = data['results'];
      resolve();
    });
  });

  let result = await trailerPromise;
  return trailerInfo;
};

export const api = {data: methods};
