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

  trailer(item) {
    let searchterm = `query=${item}`;
    try {
      this.result = this.http.post('/trailer', searchterm, {headers});
      return this.result;
    } catch (e) {
      console.log(e, 'error')
    }
  }
}
