# Movie Search (ssr)

### Software used for this application
* Visual Studio Code 1.38.1
* iterm2 3.3.12
* Node.js 14.4.0
* Angular CLI: 10.0.3

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