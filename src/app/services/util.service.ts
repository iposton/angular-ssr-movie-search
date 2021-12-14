import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

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

  public getFlatRate(items) {
    for (let item of items) {
      if (item.provider != null && 
        item.provider != 'unknown' && 
        item.provider['flatrate'] != null) {
        return item;
      }
    }
  }

}
