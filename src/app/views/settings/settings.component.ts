import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { VariablesGlobales } from 'src/app/sharing/globalVariables';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  constructor(public global: VariablesGlobales, private router: Router ) {}

  ngOnInit(): void {
    if (this.global.welcomePage) {
      this.router.navigate(['/']);
    }
  }

  public changeTimer(newTimer: number) {
    this.global.timer = newTimer;
  }

  public changePawns(newPawnsNumber: number) {
    this.global.pawnsNumber = newPawnsNumber;
  }

  public changeDoubleThreesRules() {
    this.global.doubleThreesRules = !this.global.doubleThreesRules;
  }

  public changeCaptureRules() {
    this.global.capturesRules = !this.global.capturesRules;
  }

  public changeTimerRules() {
    this.global.timerRules = !this.global.timerRules;
  }
}
