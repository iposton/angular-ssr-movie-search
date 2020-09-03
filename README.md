# Angular 10 Movie Search (ssr ngUniversal), TMDB API - <a href="https://angular10-movie-search.herokuapp.com/" target="_blank">Demo</a>

### Description
This [application](https://nhl-starting-goalies-angular.herokuapp.com/) is made with Angular (version 10.0.4). This is a server-side rendering app that uses `node.js` and `express` and it searches for movie titles. This single page app is hosted for free on Heroku (cloud application platform). The data is sourced through the [The Movie Db API](https://www.themoviedb.org/documentation/api?language=en-US).

### Software used in the creation of this app
* Visual Studio Code 1.38.1
* iterm2 3.3.12
* Node.js 14.4.0
* Angular CLI: 10.0.3
* NPM 6.14.8
* Git 2.15.2

<i>Automatically installed locally by Angular cli</i>
* rxjs                              6.5.5
* typescript                        3.9.7
* webpack                           4.43.0

### Initialize a new angular project
* Install [Angular CLI](https://github.com/angular/angular-cli) version 10.0.3
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


* Create a search input with `FormControl in `home.component.html`.
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
On `line 6` add `"start:heroku": "node dist/server/main.js", <br>
On `line 7` add `"heroku-postbuild": "npm run build:ssr"` <br>
* Add a `Procfile` to the root of this app. <br>
Write command: `touch Procfile` add this line `web: npm run start:heroku` to the file.
* Replace the api token with `process.env.TOKEN` to `server.ts` before pushing to github and heroku. <br>
On `line 20` add `const apiKey = process.env.TOKEN;`
* Commit and then push to github. <br>
`git commit -am "make a commit."` then `git push`
* With `Heroku CLI` login to heroku from terminal run: `heroku login`.
* Create a heroku app write this command: `heroku create angular-movie-search` and `git push heroku master`.
* Store the TMDB api key to the heroku app setting's config vars. The `key: TOKEN` and `value: TMDB api key`.

If the heroku app name that you created is taken make up a unique name that is available. I will add a part 2 for this tutrial so we can show some more movie data and make the page interactive by loading movie trailers. Thank you for reading.
