import { Component, OnInit } from '@angular/core';
import { FormControl } from "@angular/forms";
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { DataService } from '../../services/data.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public loading: boolean = false;
  public results: Observable<any>;
  public searchField: FormControl;
  public isOpen: boolean = false;
  public selectedMovie: any;
  public trailerUrl: any;

  constructor(private dataService: DataService,
    private sanitizer: DomSanitizer) { }

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

}
