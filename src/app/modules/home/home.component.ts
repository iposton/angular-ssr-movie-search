import { Component, OnInit } from '@angular/core';
import { FormControl } from "@angular/forms";
import { debounceTime } from 'rxjs/operators';
import { DataService } from '../../services/data.service';
import { UtilService } from '../../services/util.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public loading: boolean = false;
  //public results: Observable<any>;
  public searchField: FormControl;
  public isOpen: boolean = false;
  public selectedMovie: any;
  public trailerUrl: any;
  public results: Array<any> = []

  constructor(private dataService: DataService, 
    private util: UtilService,
    private sanitizer: DomSanitizer) { }

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

  public rating(movie) {
    let rating = Array(Math.round(movie.vote_average)).fill(0);
    movie.rating = rating;
    return rating;
  }

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

}
