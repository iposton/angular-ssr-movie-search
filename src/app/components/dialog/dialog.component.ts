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
