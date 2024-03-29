# Angular 12 Movie Search (ssr ngUniversal), TMDB API - <a href="https://angular10-movie-search.herokuapp.com/" target="_blank">Demo</a>

### Description
This [application](https://nhl-starting-goalies-angular.herokuapp.com/) is made with Angular (version 12.2.8). This is a server-side rendering app that uses `node.js` and `express` and it searches for movie titles. This single page app is hosted for free on Heroku (cloud application platform). You will need create a free account with [themoviedb.org](https://www.themoviedb.org/documentation/api?language=en-US) to participate with this tutorial. The instructions of how to procure a TMDB api key are below.

### Software used in the creation of this app
* Visual Studio Code 1.59.1
* iterm2 3.4.10
* Node.js 14.17.5
* Angular CLI: 12.2.8
* NPM 7.21.1
* Git 2.30.1

<i>Automatically installed locally by Angular cli</i>
* rxjs                              6.5.5
* typescript                        4.3.5
* webpack                           4.43.0

### Initialize a new angular project
* Install [Angular CLI](https://github.com/angular/angular-cli) version 12.2.8
* Create a new project with Angular Cli `ng new movie-search --skip-git`
* Angular CLI will ask:
`Would you like to add Angular routing? Yes` <br>
`Which stylesheet format would you like to use? SCSS`

### Make a github repo to track progress
* Login / click new repository / Create a new repository
* title: angular-ssr-movie-search
* description: server side movie search app with angular, nguniversal and tmdb api.
* Make the repo public. 
* Click the create repository button.
* Follow the instructions from github to commit and push the app.

### Make it a Server-side rendering (SSR) with Angular Universal
The advantage of making this app server-side rendered is that the application can appear on the screen (ui) quicker than a regular app. This gives users a chance to view the application layout before it becomes fully interactive. It can also help with SEO as well.

* [How to make angular app ssr](https://angular.io/guide/universal)
* In the terminal write this command: `ng add @nguniversal/express-engine`
* This will create a `server.ts` file to serve and handle the data for this app.
* In `package.json` change `line 12` to `"serve:ssr": "node dist/server/main.js",`
* Then in `angular.json` change `line 20` to `"outputPath": "dist/browser",` and `line 129` to `"outputPath": "dist/server",`
* In `server.ts` change `line 14` to `const distFolder = join(process.cwd(), 'dist/browser');`

### Build a prod version of the ssr app and serve the app
* Run command: `npm run build:ssr`
* After the build completes successfully run: `npm run serve:ssr`
* Go to http://localhost:4000/ in your browser and you should see the default angular home page.


### Create a Home Component and a home route
* Run angular CLI command: `ng g c modules/home --module=app.module.ts`
* Create a route that will point to the `homeComponent` by default.

```ts

//app-routing.module.ts

import { HomeComponent } from './modules/home/home.component';

const routes: Routes = [
    { 
      path: '', 
      component: HomeComponent 
    },
    {
      path: '**', 
      component: HomeComponent
    }  
   ];


```

* Replace `app.component.html` placeholder html content with this below. 

```html
<!-- app.component.html -->

<div class="container">
  <router-outlet></router-outlet>
</div>

```

### Send Request to Server with Angular HttpClient Module
For this app we will need to add the `HttpClinetModule`, `ReactiveFormsModule` and `FormsModule` to the `app.module.ts` file and add it to `imports`. This will make this modules available through out the entire app. The http module will allow us to make calls to the server. The `ReactiveFormsModule` will help us use `FormControl` on the html input and when the value changes (text in the search input) an api request will be sent to the server.

```ts
//app.module.ts

import { HttpClientModule } from "@angular/common/http";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";

```


* Create a search input with `FormControl` in `home.component.html`.
* Set up an `async Observable` and a `function` to fire onInit.

```html
<!-- home.component.html -->

<div class="row">
  <input type="search" class="form-control" placeholder="search" [formControl]="searchField">
  <span class="search-title">{{ (results | async)?.length ? 'Results' : 'Search' }}</span>
</div>

```

```ts
//home.component.ts

import { Component, OnInit } from '@angular/core';
import { FormControl } from "@angular/forms";
import { Observable } from 'rxjs';
import { 
  debounceTime, 
  distinctUntilChanged, 
  tap, 
  switchMap 
} from 'rxjs/operators';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public loading: boolean = false;
  public results: Observable<any>;
  public searchField: FormControl;

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.searchField = new FormControl();
    this.results = this.searchField.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      tap(_ => { 
        this.loading = true; 
      }),
      switchMap(term => this.dataService.search(term)),
      tap(_ => (this.loading = false))
    );
  }

}

```

* Create a data service file to handle each search api request. Write this `Angular cli` command in the terminal: `ng g s services/data`
* In this service use Angular's http module to send the search term to `server.ts`.

```ts
//data.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
const headers = new HttpHeaders().set('Content-Type', 'application/X-www-form-urlencoded');

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public result: any;

  constructor(private http: HttpClient) { }

  search(item: string): Observable<any> {
    let searchterm = `query=${item}`;
    try {
      this.result = this.http.post('/search', searchterm, {headers});
      return this.result;
    } catch (e) {
      console.log(e, 'error')
    }
  }
}

```

In `server.ts` create a function to handle the request from the client. Then send the request to the tmdb endpoint. `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&page=1&include_adult=false&query=${term}`

```ts

//server.ts line 35-40

  server.post('/search', async (req, res) => {
    let searchquery = req.body.query;
    let encsearchquery = encodeURIComponent(searchquery);
    const data =  await api.data.search(encsearchquery, apiKey);
    res.status(200).json(data);
  })

```

* In the root of this app make an `api` folder and `api.ts` file.
* In the terminal type: `mkdir api` then `cd api` then `touch api.ts` to set up an api directory.
* Import the `api` file into the `server.ts` file. `import { api } from './api/api'`.

In the future if you would want to add different requests to the `TMDB api` you can add them to `api.ts` to keep the `server.ts` file less cluttered.

```ts
//api.ts
let request = require('request');
let methods: any = {};
let searchInfo = [];

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

export const api = {data: methods};

```

I am using the `request` library to handle the api request and parse the response. In TypeScript I can use Promises to wait for the response to be ready to avoid throwing an error.

### Connet to the TMDB api
* Visit [The Movie DB](https://www.themoviedb.org/) create a free account and ask for an api key.
* Click on the profile icon top right and click on `settings`.
* Find the `API` link and submit your app details to receive an api key.
* Enter App Details. <br>
`Application Name: Movie Search` <br>
`Application URL: localhost:4000` <br>
`Application Summary: an app that will search for movies that are related to the search term entered into the app input and display them in the ui.`
* Add the api key to the `server.ts` file in your app. <br> `WARNING: Do not commit your api key to github. If you do it could be found and used by another party.`

```ts
//server.ts
import 'zone.js/dist/zone-node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { join } from 'path';
import { enableProdMode } from '@angular/core';
import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';
import { api } from './api/api';
const bodyParser = require('body-parser');

enableProdMode();

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';
  const apiKey = 'TMDB api key';
  server.use(bodyParser.urlencoded({extended: true}));

  ...
```

### Display data in the UI
When we get the data response back from the TMDB endpoint it's sent back to the client (front-end). The `home.component.html` needs to be set up to display an `async Observable`.

```html
<!-- home.component.html -->

<div class="center-header">
    <h1>Movie Search</h1>
    <i>* This product uses the TMDb API but is not endorsed or certified by TMDb.</i>
</div>

<div class="row">
  <input type="search" class="form-control" placeholder="search" [formControl]="searchField">
  <span class="search-title">{{ (results | async)?.length ? 'Results' : 'Search' }}</span>
</div>
<div class="row wrapper">
  <div class="no-res" *ngIf="(results | async)?.length === 0">Nothing matches this search.</div>
  <div [ngClass]="{'dn': item?.poster_path == null}" class="col" *ngFor="let item of results | async">
      <span class="item">
          <span class="bg" [ngStyle]="{'background': 'linear-gradient(-225deg, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.5) 80%), url(https://image.tmdb.org/t/p/w440_and_h660_face'+ item?.poster_path +')' }">
          </span>
      </span>
  </div>
</div> 

```

There is a few things to unpack in this ui. I am using a ternary condtion inside an Angular interpolation bracket to display the text "Search" or "Results" depeding on if there is data to show. <br>
`{{ (results | async)?.length ? 'Results' : 'Search' }}` <br> <br>
I am using the `[ngClass]` directive which is apart of the Angular framework. I am adding the class `dn` if the data `poster_path` is `null` and then in `styles.scss` add `.dn {display: none;}` to avoid blank movie items. I am also using the `[ngStyle]` directive to add the background image of each movie item's poster image dynamically.

### Add CSS styles
I've added some basic css styles to show movie results in a flex row column layout. This will handle smaller mobile screens as well. With a `scss` file you can write nested css like shown below. [Full SCSS file for this Movie Search App](https://github.com/iposton/angular-ssr-movie-search/blob/master/src/styles.scss)

```scss
//styles.scss
html, 
body { 
  height: 100%;
  font-family: Arial, sans-serif; 
  margin: 0;
  background-color: #303030;
}

.container {
  color: #fff;
  min-height: 100%;
  margin-bottom: -50px;
  margin: 0 auto; 
  max-width: 1380px;

  .row {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
    justify-content: center;

    .col {
      display: flex;
      flex-direction: column;
      flex: 0 0 13%;
      width: 100%;
      color: #fff;
      margin-bottom: 5px;
      position: relative;

      .item {
        .bg {
          background-size: cover!important;
          background-repeat: no-repeat !important;
          background-position: center !important;
          position: relative;
          height: 250px;
          display: block;
        }
      }
    }
  
    .col.dn {
      display: none;
    }

  }

  .row.wrapper {
    max-width: 1200px;
    margin: 0 auto
  }

}

@media (max-width: 900px) { 
  .container .row .col {
    flex: 0 0 20%;
  }
}

@media (max-width: 500px) { 
  .container .row .col {
    flex: 0 0 33%;
  }
}

```

### Deploy app live to heroku
If you would like to host this app for free, visit it anytime that you want to and share it with others then follow the steps below.

* Sign up for a free heroku account.
* Install the [heroku cli](https://devcenter.heroku.com/articles/heroku-cli).
* Add build commands to `package.json` for heroku <br>
On `line 6` add `"start:heroku": "node dist/server/main.js",` <br>
On `line 7` add `"heroku-postbuild": "npm run build:ssr"` <br>
* Add a `Procfile` to the root of this app. <br>
Write command: `touch Procfile` add this line `web: npm run start:heroku` to the file.
* Replace the api token with `process.env.TOKEN` to `server.ts` before pushing to github and heroku. <br>
On `line 20` add `const apiKey = process.env.TOKEN;`
* Commit and then push to github. <br>
`git commit -am "make a commit."` then `git push`
* With `Heroku CLI` login to heroku from terminal run: `heroku login`.
* Create a heroku app write this command: <br> 
`heroku create angular-movie-search` and `git push heroku master`.
* Store the TMDB api key to the heroku app setting's config vars. <br>
The `key: TOKEN` and `value: TMDB api key`.

If the heroku app name that you created is taken make up a unique name that is available. I will add a part 2 for this tutrial so we can show some more movie data and make the page interactive by loading movie trailers. Thank you for reading. [Full source code](https://github.com/iposton/angular-ssr-movie-search)

# Part 2

### Display Movie Details 
* Show movie rating on hover.
* Create a trailer link to open a dialog window preview.
* Genrerate a dialog (modal) component with `angular cli`.

Let's show some info about the movie when we hover over the movie image. The search payload provides a movie rating score 0 - 10. The rating (vote_average) can be converted to an array to show the rating as star icons equal to the length of the array.

The `payload` is the data sent back after you make a search request to the `api`. You will get a max of 20 results per response. The smaller the payload the quicker the data is rendered in the ui. This is an example of the first object of an oserverable sent back by the api.

```json

{
  "popularity":24.087,
  "id":670466,
  "video":false,
  "vote_count":29,
  "vote_average":6.8,
  "title":"My Valentine",
  "release_date":"2020-02-07",
  "original_language":"en",
  "original_title":"My Valentine",
  "genre_ids":[53,27],
  "backdrop_path":"/jNN5s79gjy4D3sJNxjQvymXPs9d.jpg",
  "adult":false,
  "overview":"A pop singer's artistic identity is stolen by her ex-boyfriend/manager and shamelessly pasted onto his new girlfriend/protégé. Locked together late one night in a concert venue, the three reconcile emotional abuses of the past . . . until things turn violent.","poster_path":"/mkRShxUNjeC8wzhUEJoFUUZ6gS8.jpg"
}

```

In the first part of this tutorial I used the `poster_path` to display the movie image and now I can use the `vote_average` to show the rating of the movie. I created a function inside the component's controller to convert the rating to an array that can then represent the value of the `vote_average` rounded to a whole number and use gold stars to represent the rating when I hover over the movie image.

```html

<span class="star-rating" *ngFor="let star of rating(item)"> 
  <span>☆</span> 
</span>

```

```ts
//home.component.ts line 53

public rating(movie) {
  let rating = Array(Math.round(movie.vote_average)).fill(0);
  movie.rating = rating;
  return rating;
}

```

Then Style the content for the returned value of the rating so that we only see the stars on hover. [Full SCSS file for the Dialog Component](https://github.com/iposton/angular-ssr-movie-search/blob/master/src/app/components/dialog/dialog.component.scss)

```scss
//components/dialog/dialog.component.scss

.item .bg .info {
  background-color: rgba(0, 0, 0, 0.0);
  position: absolute;
  bottom: 0;
  color: #fff;
  font-size: 9px;
  text-transform: uppercase;
  width: 100%;
  transition: linear .3s;

  p {
    opacity: 0;
    transition: linear .3s;
  }

  .star-rating {
    color: transparent;
    span:before {
      content: "\2605";
      position: absolute;
      color: gold;
    }
  }
}

.item .bg .item:hover {
  .info {
    background-color: rgba(0, 0, 0, 0.5);
    p {
      color: #fff;
      opacity: 1;
      font-size: 14px;
    }
  }
}

```

Next I am going to add a link that will send another api request for a movie trailer (preview) and then open a dialog (pop-up window) to display the trailer with the overview (description) of the movie. 

### Create a dialog component

When I fetch the movie trialer info from the api I want to embed the media link inside an html `<iframe>`. I want to add a "Trailer" link that will pop open a window to show the trailer when clicked. Using `angular cli` I will generate a new dialog component. In the terminal type `ng g c components/dialog --module=app.module.ts`. This command will add the component to `app.module.ts` automatically. 

To create a pop-up window from scratch I need to use a little css and some angular tricks to help me add a special `class` when the "Trailer" link is clicked. The `dialog component` uses a `boolean` to add an `active` class to a `div` to show a dark overlay background with a pop-up window positioned in the center of the overlay. Using an angular directive `[ngClass]` if `isOpen` `boolean` is `true` add `active` class to the overlay `id`. `<div id="overlay" [ngClass]="{'active': isOpen}">` This allows me to hide the overlay `div` until it's `active`, when I click the trailer link and make `isOpen` equal true. All I need to do is add some `Inputs` to the `app-dialog` component.

```html
<!-- home.component.html line 1 -->

<app-dialog
  [isOpen]="isOpen"
  [selectedMovie]="selectedMovie"
  [trailerUrl]="trailerUrl"
  (close)="isOpen = false"></app-dialog>

```

```ts
//dialog.component.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})

export class DialogComponent {
  @Input('selectedMovie')
  public selectedMovie      :any;
  @Input('trailerUrl')
  public trailerUrl         :any;
  @Input('isOpen')
  public isOpen             :boolean;
  @Output() close = new EventEmitter();

  constructor() { }

  public closeModal() {
    this.isOpen = false;
    this.selectedMovie = null; 
    this.trailerUrl = null;
    this.close.emit(); 
  }

}

```

I am using `Input` to inject data from the `home.component` on click by calling a `function` and I am using `Output` to `emit` a `function` when the dialog is closed. The dialog can be closed by clicking on the X in the top right or by clicking on the overlay. The `closeModal()` function will remove the `active` class, reset all the values and emit a function to reset `isOpen` in the `home.component`.

```html
<!-- dialog.component.html -->

<div id="overlay" [ngClass]="{'active': isOpen}" (click)="closeModal()">
  <div class="modal" (click)="$event.stopPropagation()">
    <div class="modal-header">
      <span class="header-title" *ngIf="selectedMovie != null">
        {{selectedMovie?.title ? selectedMovie?.title : selectedMovie?.name}} 
        ({{selectedMovie?.release_date ? (selectedMovie?.release_date | date: 'y') : selectedMovie?.first_air_date | date: 'y'}})
      </span>
      <span class="right" (click)="closeModal()">X</span>
    </div>
    <div class="content"> 
      <div id="top" class="row">
        <div *ngIf="trailerUrl != null" class="col-trailer">
          <iframe [src]="trailerUrl" width="560" height="315" frameborder="0" allowfullscreen></iframe>  
        </div>
        <div class="col-overview">
          <span class="star-rating" *ngFor="let star of selectedMovie?.rating"> 
            <span>☆</span> 
          </span> 
          <span> 
            {{selectedMovie?.rating?.length}}/10 
          </span> 
          <br>
          <hr>
          <span>{{selectedMovie?.overview}} </span> <br>  
        </div>
      </div>     
    </div>  
  </div>
</div>

```

### Request Trailer from the API
* Add a new endpoint to request movie trailers by id.
* Create a youtube `trailerUrl` and display in a `<iframe>`.

The `selectedMovie` is passed from the `home.component` when the movie link is clicked but before the dialog is opened I need to fetch the movie trailer from the api. I added a new api call to the `api.ts` file. 

```ts
//home.component.ts 

//line 17 
 public isOpen: boolean = false;
 public selectedMovie: any;
 public trailerUrl: any;

//line 37
 public openTrailer(movie) {
    this.selectedMovie = movie;

    this.dataService.trailer(movie.id).subscribe(res => {

      if (res[0] != null) {
        if (res[0].site === 'YouTube') {
          this.trailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            `https://www.youtube.com/embed/${res[0].key}`
          );
          this.isOpen = true;
        } 
      }
    })
  }

```

From here the `data.service` will work as a middle manager to talk with the `server / api` and send the response back to the client (front-end). The first index in the response with usally be a link to youtube where just about all movie trailers reside so I am using a condition to specifically only use youtube trailers and if not don't open the trailer. For fun you can add to this condition if you would like to let the trailer open from another video source.

```ts
//data.service.ts line 24

trailer(item) {
  let searchterm = `query=${item}`;
  try {
    this.result = this.http.post('/trailer', searchterm, {headers});
    return this.result;
  } catch (e) {
    console.log(e, 'error')
  }
}

```

I am using `try catch` to handle an error but there are many ways to handle an error in `angular`. This was just for simplicity on my end.

```ts
//server.ts line 42

server.post('/trailer', async (req, res) => {
    let searchquery = req.body.query;
    let encsearchquery = encodeURIComponent(searchquery);
    const data =  await api.data.trailer(encsearchquery, apiKey);
    res.status(200).json(data);
})

```

I am using a typescript `async function` that will `await` for the api to give us the payload (response) before completeing the `post` to avoid a server error.

```ts
//api/api.ts 

//line 4
let trailerInfo = [];

//line 19
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

```

I am using this TMDb endpoint `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}&language=en-US` to get the movie trailer by movie `id`. The `id` and `apikey` are passed into the endpoint using typescript brackets and backticks which is a new way to add dynamic values with js and it looks much nicer then using a `+` to concatenate values. 

If the data meets the youtube condition the diaglog pop-up is opened and the data will show inside the html and the `angular` interpolated strings `{{selectedMovie.title}}`, the double brackets processes the data in the html dynamically.

Something that is not always talked about with projects like this one is that it wouldn't take much time to convert this into a completely different project. You could easily change the endpoints in the `api.ts` file to communicate with a different api and get different data to show in the ui. Of course you would need to change some of the variables naming conventions so that the code makes sense but this project can be recycled with something else that you might be more interested in. See it as a template already set up with a simple backend server and api file to handle any data that you would like to fetch and send back to the front-end for display. Change the header title in `home.html` to something like `Job Search` and connect to a job listing api that can fetch jobs by keywords for example. Once you get started anything is possible. Thank you for coding with me. Good luck. [Full source code](https://github.com/iposton/angular-ssr-movie-search)

<i>Side note:</i> I just found out right this minute there is a `html5` dialog `tag` `<dialog open>This is an open dialog window</dialog>` but it didn't work for me in chrome. It might be a little too new and lacking browser support but perhaps you creative devs out there can find a way to use that instead of my "do it from scratch" approach.

# Part 3

### Update to Fetch Movie Providers and Credits 
The TMDB api recently added a new end point to their api that will tell you where a movie is streaming by using a movie's id. I also added another endpoint to fetch the cast of the movies in the search payload. I updated the `api.ts` file to handle these new requests.

After getting the search results I use the rxjs `forkJoin` method and `map` to make multiple requests for `providers` for each movie by `id`. The provider data is `pushed` to the `mvProvider` array and then that is added to the `searchInfo` object which is then sent back to the client with movie results array, providers array and credits array.

Depending on the amount of search results a single search request could generate up to 30 api requests before the data is resolved and sent to the client. I created a `sleep` function to `await` all the requests to finish before a `resolve` sends imcomplete data back to the front-end. It's not the best way to handle this but it works. Using `async` and `await` is important to make sure all the data being fetched completes before the `promise` is `resolved`.

```ts
//api.ts
let request = require('request')
let methods: any = {}
let searchInfo = [
  {
    results: [],
    providers: [],
    credits: []
  }
]
import { forkJoin } from 'rxjs'

methods.search = async (term: string, apiKey: string) => {
  let type = 'movie'
  let searchQuery = `https://api.themoviedb.org/3/search/${type}?api_key=${apiKey}&language=en-US&page=1&include_adult=false&query=${term}`

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
        await providers()
        
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

export const api = {data: methods};

```

### Refactor Search Using Angular event binding
I had to refactor the search method from the pevious tutorials because it was blocking me from adding more related movie data to the array before presenting it in the `home.component.html` file.

In the `html` file I can use `Angular` event binding `(input)` to listen for an event change and call a function passing in the event which contains the search text.

I can pass the search text to the `api.ts` file append it to the `api endpoint` and `request` the data.

If the `req` (request) is successful the payload res (response) is sent back to the client (front-end) and I can format the data with logic inside the `home.component.ts` (controller). I created an `array` called `results` to define the formatted data to so that the actors and streaming service will show in the ui.

```html
<!-- home.component.html -->

<div class="row">
  <input (input)="doSearch($event)" type="search" class="form-control" placeholder="search">
  <span class="search-title">{{ results?.length ? 'Results' : 'Search' }}</span>
</div>

```

```ts
// home.component.ts
...

ngOnInit(): void {
  }

  public doSearch(e) {

    if (e.target.value.length > 2) {
      this.dataService.search(e.target.value).pipe(
        debounceTime(400)).subscribe(res => {
          this.format(res)
      })
    }

    if (e.target.value.length == 0) {
      this.results = []
      this.selectedMovie = null 
    }

  }

  public format(data) {
    this.util.relatedInfo(data[0].results, data[0].providers, 'providers', 'movies')
    this.util.relatedInfo(data[0].results, data[0].credits, 'credits', 'movies')
    this.loading = false
    this.results = data[0].results
    console.log(this.results, 'res')
  }

  ...
```

[Go to full `home.component.ts` file.](https://github.com/iposton/angular-ssr-movie-search/blob/master/src/app/modules/home/home.component.ts)

### Format Data 
I need to format the data to match `providers` and `credits` with movies they belong to by id. I created a utility `service` to handle the formatting. By using the command `ng g s services/util` I can generate a service file with `Angular cli`. The functions in a `service` can be used by all `components` of an angular app by importing the `service` into the `component` controller. Now I can call the `relatedInfo` function in `home.component.ts`.

```ts
//util.service.ts
public relatedInfo(items, extras, type: string, itemType: string) {
    for (let item of items) {
      for (let e of extras) {
       
        if (item.id === e.id) {     
          
          if (type === 'credits') {

            item.credits = e;
            item.type = itemType;
            if (e.cast[0] != null) {
              item.credit1 = e.cast[0]['name'];
              item.credit1Pic = e.cast[0]['profile_path'];
              item.credit1Char = e.cast[0]['character'];
            }

            if (e.cast[1] != null) {
              item.credit2 = e.cast[1]['name'];
              item.credit2Pic = e.cast[1]['profile_path'];
              item.credit2Char = e.cast[1]['character'];
            }
          }

          if (type === 'providers') {
            item.provider = e['results'].US != null ? e['results'].US : 'unknown';
          }   
    
        }
      }
    }
    return items;
}
```


### Style Credits of The Movies
I need to show the credits in the search view and the trailer view. Since the html is already set up for the `results` array there are a few adjustments I need to make in `home.component.html` and `dialog.component.html` to show the movie's acting credits.

```html
<!-- home.component.html line 21 -->
...

 <span class="info">
  <p>
    <span *ngIf="item?.credit1">Cast: {{item?.credit1}}, {{item?.credit2}} <br></span>
    <span class="star-rating" *ngFor="let star of rating(item)"> <span>☆</span> </span><br>
    <span class="trailer-link" (click)="openTrailer(item)">Trailer</span>
  </p> 
 </span>

...
```

```html
<!-- dialog.component.html line 24 -->
...

 <span>{{selectedMovie?.overview}} </span> <br>  
 <span class="row cast" *ngIf="selectedMovie?.credits">
  <span class="col-cast" *ngFor="let actor of selectedMovie?.credits?.cast; let i = index"> 
    <span [ngClass]="{'dn': i > 3 || actor?.profile_path == null, 'cast-item':  i &lt;= 3 && actor?.profile_path != null}">
        <img src="https://image.tmdb.org/t/p/w276_and_h350_face{{actor?.profile_path}}" alt="image of {{actor?.name}}"> <br>
        {{actor?.name}} <br> ({{actor?.character}})
    </span>
  </span>
 </span>

...
```

I added some new css styles to handle this new data.

```scss
/* dialog.component.scss line 111 */
...

.row.cast {
  margin-top: 20px;
  .col-cast {
    flex: 0 0 50%;
    text-align: left;
    font-size: 10px;
    
    img {
      width: 30%;
      border: 1px solid #fff;
      border-radius: 8px;
    }
    .cast-item {
      padding-bottom: 5px;
      display: block;
    }
    .dn {
      display: none;
    }
  }
}

...
```

[Full `dialog.component.scss` here.](https://github.com/iposton/angular-ssr-movie-search/blob/master/src/app/components/dialog/dialog.component.scss)


### Display Streaming Provider
To display the streaming service of each movie in the returned array of movies I use a `function` called `getProvider`. This function will take one argument and for each loop through the provider data and define a short `string` to fit in the display. Some provider titles are too large for the ui and need to be changed using `if / else` conditonals.

```html
<!-- home.component.html line 28 -->

<span *ngIf="item?.provider != null" class="{{getProvider(item?.provider)}} probar">
  {{getProvider(item?.provider)}}
</span>

```

```ts
// home.component.ts line 75
...

public getProvider(pro) {
  try {
    if (pro === 'unknown') {
      return ''
    } else if (pro['flatrate'] != null) {
      if (pro.flatrate[0].provider_name === 'Amazon Prime Video') {
        return 'prime'
      } else if (pro.flatrate[0].provider_name.toUpperCase() === 'IMDB TV AMAZON CHANNEL') {
        return 'imdb tv'
      } else if (pro.flatrate[0].provider_name.toUpperCase() === 'APPLE TV PLUS') {
        return 'apple tv'
      } else {
        return pro.flatrate[0].provider_name.toLowerCase()
      } 
    } else if (pro['buy'] != null) {
      return ''
    } else if (pro['rent'] != null) {
      return ''
    } else {
      return ''
    }
  } catch(e) {
    console.log(e, 'error')
  }
}

...
```

Now using the probar `class` I can style the streaming service provider. I can also use the provider name in the html class by using angular interpolation curly brackets to add a dynamic background color to the probar style.

```scss
/* styles.scss line 58 */
...

.probar {
  position: absolute;
  bottom: 0;
  width: 100%;
  text-align: center;
  font-size: 14px;
  font-weight: 300;
  letter-spacing: 2px;
  opacity: 0.8;
  color: #fff;
  text-transform: uppercase;
  background: #555;
}

.netflix {
  background: #e00713;  
}

.hbo {
  background: #8440C1;
}

.prime {
  background: #00A3DB;
}

.hulu {
  background:  #1DE883;
}

.disney {
  background:  #111D4E;
}

.apple {
  background:  #000;
}

...
```

### Full Screen Trailer Modal
I decide to make the trailer modal the full width of the screen and add a background image of the selected movie. I updated `dialog.component.html` by using the Angular `[ngStyle]` directive to handle the movie background image. I added a class named `full` to the `modal` class then I added new styles to the active `modal.full` class.

```html
<!-- dialog.component.html line 11 -->
...

<div id="top" class="row" *ngIf="isOpen" [ngStyle]="{'background': 'linear-gradient(-225deg, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.6) 80%), url(https://image.tmdb.org/t/p/w533_and_h300_bestv2/'+ selectedMovie?.backdrop_path +')' }">

...
```

```scss
/* dialog.component.scss line 133 */
...

 .modal.full{
    height: 100%;
    min-width: 100%;
    #top {
      height: 500px;
      background-size: cover!important;
      background-repeat: no-repeat!important;
    }
    
    .row .col {
      flex: 0 0 11%;
    }

    .content {  
      .col-trailer {
        align-self: center;
        text-align: center;
      }
      .col-overview {
        align-self: center;
      }
    }
  }

  ...
```

This is a cool feature that I use often to find where a movie is streaming and the search responds quickly, faster than a google search I think.

A fun challenge for advanced developers out there reading this would be if you could refactor the `api.ts` code. I am using nested `Promises` to wait for a `resolve` before sending the movie data back to the client. However I don't like the way I had to use a `sleep` `await`  timer function so that the data would wait for the `credit` and `provider` data to reslolve before the movie data got sent back to the `client`. I shouldn't have to use the `sleep` `function` that was just a patch to help me out. The problem was I created too many scopes and the resolves were not working the way that I wanted them to. If someone can get the resolves to work without using the `sleep` timer `function` I would be very impressed. Thank you for reading!

