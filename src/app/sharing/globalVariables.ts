import { Injectable } from '@angular/core';

@Injectable()

export class VariablesGlobales {
  welcomePage: boolean = true;
  username: string = "Joueur";
  changeUsername: boolean = false;
  timer: number = 10000;
  pawnsNumber: number = 361;
  doubleThreesRules: boolean = true;
  capturesRules: boolean = true;
  intervalId: any;
}