import { Component } from '@angular/core';
import { VariablesGlobales } from './sharing/globalVariables';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public validWidth: boolean = true;
  public validHeight: boolean = true;

  constructor(public global: VariablesGlobales) {}

  title = 'gomoku';

  ngOnInit(): void {
    if (window.innerWidth < 1100) {
      this.validWidth = false;
    }
    else {
      this.validWidth = true;
    }

    if (window.innerHeight < 700) {
      this.validHeight = false;
    }
    else {
      this.validHeight = true;
    }
  }

  public onResize(event: any) {
    console.log(window.innerWidth, window.innerHeight);
    
    if (window.innerWidth < 1100) {
      this.validWidth = false;
    }
    else {
      this.validWidth = true;
    }

    if (window.innerHeight < 700) {
      this.validHeight = false;
    }
    else {
      this.validHeight = true;
    }
  }
}
