import { Component, OnInit } from '@angular/core';
import { FormControl } from "@angular/forms";
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
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

  public rating(movie) {
    return Array(Math.round(movie.vote_average)).fill(0);
  }

}
