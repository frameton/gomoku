import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { VariablesGlobales } from 'src/app/sharing/globalVariables';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent {
  @ViewChild("titleAndPlayBtnDiv") titleAndPlayBtnDiv!: ElementRef;
  @ViewChild("title") title!: ElementRef;
  @ViewChild("playBtnContainer") playBtnContainer!: ElementRef;

  constructor(public global: VariablesGlobales, private router: Router ) {}

  ngOnInit(): void {
    this.global.welcomePage = true;
  }

  public enterGame() {
    this.playBtnContainer.nativeElement.classList.add("fastFadeout");
    this.title.nativeElement.classList.add("fastFadeout");

    setTimeout(() =>  this.titleAndPlayBtnDiv.nativeElement.style.backgroundColor = "black", 600);
    setTimeout(() =>  this.titleAndPlayBtnDiv.nativeElement.style.height = "6vh", 900);
    setTimeout(() =>  this.titleAndPlayBtnDiv.nativeElement.style.marginTop = "1vh", 1300);
    setTimeout(() =>  this.titleAndPlayBtnDiv.nativeElement.style.display = "fixed", 1300);
    setTimeout(() =>  this.titleAndPlayBtnDiv.nativeElement.style.width = "90vw", 1600);
    setTimeout(() =>  this.global.welcomePage = false, 2300);
    setTimeout(() =>  this.router.navigate(['/game']), 2900);
  }
}
