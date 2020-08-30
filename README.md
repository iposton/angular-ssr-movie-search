# Movie Search (ssr)

### Software used for this application
* Visual Studio Code 1.38.1
* iterm2 3.3.12
* Node.js 14.4.0
* Angular CLI: 10.0.3
* NPM 6.14.8

automatically installed by angular cli
* rxjs                              6.5.5
* typescript                        3.9.7
* webpack                           4.43.0

steps
* install [Angular CLI](https://github.com/angular/angular-cli) version 10.0.3
* create new project with angular cli
* write this command: `ng new movie-search --skip-git`
* it will ask this answer yes then choose SCSS
`Would you like to add Angular routing?` Yes <br>
`Which stylesheet format would you like to use? SCSS`

### make a github repo to track progress
* login / click new repository / Create a new repository
* title "angular-ssr-movie-search"
* desc: server side movie search app with angular, nguniversal and tmdb api
* public 
* click create repository button
* in terminal write these commands to add git to your project <br>
`git init` <br>
`git add -A` <br>
`git commit -m "Initial commit"` <br>
`git branch -M master` <br>
`git remote add origin https://github.com/yourusername/angular-ssr-movie-search.git` <br>
`git push -u origin master`

### make it a Server-side rendering (SSR) with Angular Universal
* [how to make angular app ssr](https://angular.io/guide/universal)
* write this command: `ng add @nguniversal/express-engine`
* setup the server in the root of the app
* in package.json change line twelve to `"serve:ssr": "node dist/server/main.js",`
* then in angular.json change line 20 to `"outputPath": "dist/browser",` and line 129 to `"outputPath": "dist/server",`
* in server.ts change line 14 to `const distFolder = join(process.cwd(), 'dist/browser');`
* run command: `npm run build:ssr`
* after build completes successfully run: `npm run serve:ssr`
* go to http://localhost:4000/ in your browser and you should see the angular home page
* next we will create a home component and a home route
* run angular cli command: `ng g c modules/home --module=app.module.ts`
* this will default to home component on load

```ts

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
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

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabled'
})],
  exports: [RouterModule]
})
export class AppRoutingModule { }

```

* replace `app.component.html` placeholder content with 

```html

//app.component.html

<div class="container">
  <router-outlet></router-outlet>
</div>

```

### Connet to the TMDB api
* lets setup a search input in home.component.html
* visit tmdb create a free account and ask for an api key
* using angular http module make an api call for movies from the server
