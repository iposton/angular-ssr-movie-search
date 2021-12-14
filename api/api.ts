let request = require('request');
let methods: any = {};
let searchInfo = [
  {
    results: [],
    providers: [],
    credits: []
  }
]
let trailerInfo = []
import { forkJoin } from 'rxjs'

methods.search = async (term: string, apiKey: string) => {
  let type = 'movie'
  let searchQuery = `https://api.themoviedb.org/3/search/${type}?api_key=${apiKey}&language=en-US&page=1&include_adult=false&query=${term}`;
  let searchPromise = new Promise((resolve, reject) => {
    request(searchQuery, {}, function(err, res, body) {
      let mvProviders = []
      let mvCredits = []
      const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
      let data = JSON.parse(body)
      searchInfo[0]['results'] = data['results']

      const providers = async() => {
        forkJoin(
          data['results'].map( m =>
            request(
              `https://api.themoviedb.org/3/${type}/${m.id}/watch/providers?api_key=${apiKey}`,
              {},
              async function(err, res, body) {
                let data = await JSON.parse(body);
                mvProviders.push(data);
                if (mvProviders.length > 1) {
                  return searchInfo[0]['providers'] = mvProviders;
                }
              }
            )
          )
        )  
      }

      const credits = async() => {
        await providers();
        
        forkJoin(
          data['results'].map( m =>
            request(
              `https://api.themoviedb.org/3/${type}/${m.id}/credits?api_key=${apiKey}&language=en-US`,
              {},
              async function(err, res, body) {
                let data = await JSON.parse(body);
                mvCredits.push(data);
                if (mvCredits.length > 1) {
                  searchInfo[0]['credits'] = mvCredits;         
                }
              }
            )
          )
        );
        await sleep(1500);
        resolve('done');
      }
      credits() 
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
      resolve('done');
    });
  });

  let result = await trailerPromise;
  return trailerInfo;
};

export const api = {data: methods};
