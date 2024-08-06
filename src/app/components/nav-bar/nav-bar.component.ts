import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { VariablesGlobales } from 'src/app/sharing/globalVariables';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {
  showUsername: boolean = true;
  reduceMode: boolean = false;
  changeUsername: boolean = true;
  @ViewChild("navBar") navBar!: ElementRef;


  constructor(public global: VariablesGlobales, private router: Router) {}


  ngOnInit(): void {
    if (window.innerWidth < 800) {
      this.showUsername = false;
      this.reduceMode = true;
    }
    else {
      this.showUsername = true;
      this.reduceMode = false;
    }
  }

  public onResize(event: any) {
    let element = document.querySelector(".logoWithVersion") as HTMLElement;
    console.log(event.target.innerWidth);
    
    if (event.target.innerWidth < 800) {
      this.showUsername = false;
      this.reduceMode = true;
    }
    else {
      this.showUsername = true;
      this.reduceMode = false;
    }
  }

  public redirect(path: string) {
    this.stopInterval();
    this.router.navigate([path])
  }

  public onClickLogout() {
    this.stopInterval();
    this.global.welcomePage = true;
    this.router.navigate(['/welcome']);
  }

  public stopInterval() {
    clearInterval(this.global.intervalId);
    this.global.intervalId = null;
  }

  public setNewUsername() {
    this.global.changeUsername = true;
  }

}