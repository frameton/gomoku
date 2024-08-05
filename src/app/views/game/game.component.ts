import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { VariablesGlobales } from 'src/app/sharing/globalVariables';
import { invoke } from '@tauri-apps/api'

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent {
  @ViewChild("player2Div") player2Div!: ElementRef;
  @ViewChild("startGameDiv") startGameDiv!: ElementRef;
  @ViewChild("endGameDiv") endGameDiv!: ElementRef;


  public line: Array<number> = [];
  public case: Array<number> = [];
  public gameStarted: boolean = false;
  public pawnsPlayed: number = 0;
  public player1Turn: boolean = false;
  public player1Pawns!: number;
  public player1Capture: number = 0;
  public player2Turn: boolean = false;
  public player2Pawns!: number;
  public player2Capture: number = 0;
  public iaTurn: boolean = false;
  public iaPawns!: number;
  public iaCapture: number = 0;
  public twoPlayersMode: boolean = false;
  public player1Begin: boolean | null = null;
  public firstTurn: boolean = true;
  public tableau: Array<number>[] = [];
  public tmpWinnerTab: any = [];
  public winner: string = "";
  public winType: string = "";
  public tmpWinner: boolean = false;
  public limitTimerPlayer1: number | undefined = undefined;
  public limitTimerPlayer2: number | undefined = undefined;
  public limitTimerIa: number | undefined = undefined;
  public timerPlayer1: number | undefined = undefined;
  public timerPlayer2: number | undefined = undefined;
  public timerIa: number | undefined = undefined;
  public timeForPlayIa: number = 10000
  public diagonale1: any;
  public diagonale2: any;
  private isPlaying: boolean = false;
  private iaMove: any = null;

  constructor(public global: VariablesGlobales, private router: Router ) {
   this.player1Pawns = this.global.pawnsNumber;
   this.player2Pawns = this.global.pawnsNumber;
   this.iaPawns = this.global.pawnsNumber;
  }

  ngOnInit(): void {
    let count = 0;
    
    while (count < 19) {
      this.tableau.push(Array(19).fill(0));
      count += 1;
    }

    this.createDiagonalArray();

    this.line = [...Array(19).keys()];
    this.case = [...Array(19).keys()];
    if (this.global.welcomePage) {
      this.router.navigate(['/']);
    }

    setInterval(() => {
      this.loopTimer(); 
    }, 10);
  }

  public createDiagonalArray() {
    let lineIndex = 0;
    let caseIndex = 1;
    this.diagonale1 = [];
    this.diagonale2 = [];

    while (lineIndex < 19) {
      let diag = [];
      let tmpLineIndex = lineIndex;
      let caseIndex2 = 0;

      while (tmpLineIndex >= 0) {
        // diag.push(this.tableau[tmpLineIndex][caseIndex2]);
        let array = [];

        array.push(tmpLineIndex);
        array.push(caseIndex2)
        diag.push(array);
        caseIndex2++;
        tmpLineIndex--;
      }
      lineIndex++;
      this.diagonale1.push(diag);
    }

    lineIndex = 0;
    while (lineIndex < 19) {
      let diag = [];
      let tmpLineIndex = lineIndex;
      let caseIndex2 = 18;

      while (tmpLineIndex >= 0) {
        // diag.push(this.tableau[tmpLineIndex][caseIndex2]);
        let array = [];

        array.push(tmpLineIndex);
        array.push(caseIndex2)
        diag.push(array);
        caseIndex2--;
        tmpLineIndex--;
      }
      lineIndex++;
      this.diagonale2.push(diag);
    }




    while (caseIndex < 19) {
      let diag = [];
      let tmpCaseIndex = caseIndex;
      let lineIndex2 = 18;

      while (tmpCaseIndex < 19) {
        // diag.push(this.tableau[lineIndex2][tmpCaseIndex]);
        let array = [];

        array.push(lineIndex2);
        array.push(tmpCaseIndex)
        diag.push(array);
        lineIndex2--;
        tmpCaseIndex++;
      }
      caseIndex++;
      this.diagonale1.push(diag);
    }
    caseIndex = 17;
    while (caseIndex >= 0) {
      let diag = [];
      let tmpCaseIndex = caseIndex;
      let lineIndex2 = 18;

      while (tmpCaseIndex >= 0) {
        // diag.push(this.tableau[lineIndex2][tmpCaseIndex]);
        let array = [];

        array.push(lineIndex2);
        array.push(tmpCaseIndex)
        diag.push(array);
        lineIndex2--;
        tmpCaseIndex--;
      }
      caseIndex--;
      this.diagonale2.push(diag);
    }    
  }

  public randomPlayerBegin(index: number) {
    let randomBegin = Math.floor(Math.random() * 2);
    if (randomBegin == 0) {
      this.player1Begin = true;
      this.player1Turn = true;
    }
    else {
      this.player1Begin = false;
      if (index == 1) {
        this.iaTurn = true;
        this.callRustAi(-1, -1, this.player1Capture, this.iaCapture, this.player1Pawns, this.iaPawns, this.player1Begin, this.firstTurn);
      }
      else {
        this.player2Turn = true;
      }
    }
  }

  public loopTimer() {
    
    if (this.limitTimerPlayer1 || this.limitTimerPlayer2 || this.limitTimerIa) {
      if (this.player1Turn) {
        this.timerPlayer1 = this.limitTimerPlayer1! - Date.now();
        this.timerPlayer2 = 0;
        // this.timerIa = 0;
        if (!this.isPlaying && Date.now() >= this.limitTimerPlayer1!) {
          this.player1Turn = false;
          if (this.twoPlayersMode) {
            this.player2Turn = true;
            this.limitTimerPlayer2 = Date.now() + this.global.timer;
          }
          else {
            this.iaTurn = true;
            this.limitTimerIa = Date.now() + this.timeForPlayIa;
            this.callRustAi(-1, -1, this.player1Capture, this.iaCapture, this.player1Pawns, this.iaPawns, this.player1Begin!, this.firstTurn);
          }
        }
      }
      else if (this.player2Turn) {
        this.timerPlayer2 = this.limitTimerPlayer2! - Date.now();
        this.timerPlayer1 = 0;
        if (!this.isPlaying && Date.now() >= this.limitTimerPlayer2!) {
          this.player2Turn = false;
          this.player1Turn = true;
          this.limitTimerPlayer1 = Date.now() + this.global.timer;
        }
      }
      else if (this.iaTurn) {
        // this.timerIa = this.limitTimerIa! - Date.now();
        this.timerIa = (Date.now() + this.timeForPlayIa) - this.limitTimerIa!;
        this.timerPlayer1 = 0;
        if (!this.isPlaying && Date.now() >= this.limitTimerIa!) {
          this.iaTurn = false;
          this.player1Turn = true;
          this.limitTimerPlayer1 = Date.now() + this.global.timer;
        }

        if (this.iaMove) {
          console.log(this.iaMove);
          
          this.iaTurn = false;
          this.player1Turn = true;
          this.limitTimerPlayer1 = Date.now() + this.global.timer;
          this.iaMove = null;
        }
      }
    }
  }

  public startGame(index: number) {
    if (index == 1) {
      this.startGameDiv.nativeElement.classList.add("fastFadeout");
      this.player2Div.nativeElement.classList.add("fastFadeout");
      setTimeout(() => this.gameStarted = true, 1000);
      setTimeout(() => this.randomPlayerBegin(1), 2000);
    }
    if (index == 2) {
      this.twoPlayersMode = true;
      this.startGameDiv.nativeElement.classList.add("fastFadeout");
      setTimeout(() => this.randomPlayerBegin(2), 1000);
      setTimeout(() => this.gameStarted = true, 1500);
    }
  }

  public setAllTurnFalse() {
    this.player2Turn = false;
    this.player1Turn = false;
    this.iaTurn = false;
  }

  public endGame(index: number) {
    this.setAllTurnFalse();
    this.isPlaying = false;
    this.endGameDiv.nativeElement.classList.remove("fastFadeout");
    this.endGameDiv.nativeElement.classList.add("fastFadein");
    if (index == 0) {
      this.winner = "tie";
    }
  }

  public leaveGame() {
    this.endGameDiv.nativeElement.classList.remove("fastFadein");
    this.endGameDiv.nativeElement.classList.add("fastFadeout");
    setTimeout(() => this.startGameDiv.nativeElement.classList.remove("fastFadeout"), 200);
    setTimeout(() => this.gameStarted = false, 300);
    setTimeout(() => this.resetGame(), 300);
    setTimeout(() => this.player2Div.nativeElement.classList.remove("fastFadeout"), 500);
    setTimeout(() => this.player2Div.nativeElement.classList.add("fastFadein"), 500);
  }

  public resetGame() {
    let count = 0;
    this.tableau = [];
    
    while (count < 19) {
      this.tableau.push(Array(19).fill(0));
      count += 1;
    }
    this.gameStarted = false;
    this.player1Turn = false;
    this.player1Pawns = this.global.pawnsNumber;;
    this.player1Capture = 0;
    this.player2Turn = false;
    this.player2Pawns = this.global.pawnsNumber;;
    this.player2Capture = 0;
    this.iaTurn = false;
    this.iaPawns = this.global.pawnsNumber;;
    this.iaCapture = 0;
    this.twoPlayersMode = false;
    this.player1Begin = null;
    this.winner = "";
    this.winType = "";
    this.firstTurn = true;
    this.limitTimerPlayer1 = undefined;
    this.limitTimerPlayer2 = undefined;
    this.limitTimerIa = undefined;
    this.timerPlayer1 = undefined;
    this.timerPlayer2 = undefined;
    this.timerIa = undefined;
    this.tmpWinner = false;
  }

  public checkDiagonalWinner1(lineIndex: number, caseIndex: number) {
    let elt = 0;
    let count = 0;
    let lineDiag = this.diagonale1[lineIndex + caseIndex];


    for (let index in lineDiag) {
      let lineIndex = lineDiag[index][0];
      let caseIndex = lineDiag[index][1];
      let value = this.getValueForDiagonal(lineIndex, caseIndex);
      if (value > 0 && elt == value) {
        count += 1;
      }
      else {
        elt = value;
        count = 1;
      }
      if (count == 5) {
        this.winType = "align";
        let index2 = Number(index);
        let arr = [];
        while (count > 0) {
          let arr2 = [];
          if (value == 1) {
            this.tableau[lineDiag[index2][0]][lineDiag[index2][1]] = 3;
          }
          if (value == 2) {
            this.tableau[lineDiag[index2][0]][lineDiag[index2][1]] = 4;
          }
          arr2.push(lineDiag[index2][0]);
          arr2.push(lineDiag[index2][1]);
          arr.push(arr2);
          index2 -= 1;
          count -= 1;
        }
        if (this.global.capturesRules) {
          this.tmpWinnerTab.push(arr);
          this.tmpWinner = true;
          break;
        }
        else {
          return true;
        }
      }
    }

    return this.checkDiagonalWinner2(lineIndex, caseIndex);
  }

  public checkDiagonalWinner2(lineIndex: number, caseIndex: number) {
    let elt = 0;
    let count = 0;
    let lineDiag = this.diagonale2[lineIndex + (18 - caseIndex)];

    for (let index in lineDiag) {
      let lineIndex = lineDiag[index][0];
      let caseIndex = lineDiag[index][1];
      let value = this.getValueForDiagonal(lineIndex, caseIndex);
      if (value > 0 && elt == value) {
        count += 1;
      }
      else {
        elt = value;
        count = 1;
      }
      if (count == 5) {
        this.winType = "align";
        let index2 = Number(index);
        let arr = [];
        while (count > 0) {
          let arr2 = [];
          if (value == 1) {
            this.tableau[lineDiag[index2][0]][lineDiag[index2][1]] = 3;
          }
          if (value == 2) {
            this.tableau[lineDiag[index2][0]][lineDiag[index2][1]] = 4;
          }
          arr2.push(lineDiag[index2][0]);
          arr2.push(lineDiag[index2][1]);
          arr.push(arr2);
          index2 -= 1;
          count -= 1;
        }
        if (this.global.capturesRules) {
          this.tmpWinnerTab.push(arr);
          this.tmpWinner = true;
          break;
        }
        else {
          return true;
        }
      }
    }

    return false;
  }

  public getValueForDiagonal(lineIndex: number, caseIndex: number) {
    return this.tableau[lineIndex][caseIndex];
  }

  public checkWinner(lineIndex: number, caseIndex: number) {
    //return false;
    let elt = 0;
    let count = 0;
    let index = 0;

    if (this.global.capturesRules && this.tmpWinner) {
      for (let elt of this.tmpWinnerTab) {
        let winBreak = 0;
        for (let elt2 of elt) {
          if (this.tableau[elt2[0]][elt2[1]] < 3) {
            winBreak++;
          }
        }
        if (winBreak > 0) {
          for (let elt2 of elt) {
            if (this.tableau[elt2[0]][elt2[1]] > 2) {
              this.tableau[elt2[0]][elt2[1]] -= 2;
            }
          }
          
          if (this.player1Turn) {
            if (this.player1Capture >= 5) {
              this.winType = "breakWinCapture";
              this.setAllTurnFalse();
              this.winner = "player1";
              setTimeout(() => this.endGame(1), 1500);
              return false;
            }
          }
          if (this.player2Turn) {
            if (this.player2Capture >= 5) {
              this.winType = "breakWinCapture";
              this.setAllTurnFalse();
              this.winner = "player2";
              setTimeout(() => this.endGame(1), 1500);
              return false;
            }
          }
          if (this.iaTurn) {
            if (this.iaCapture >= 5) {
              this.winType = "breakWinCapture";
              this.setAllTurnFalse();
              this.winner = "ia";
              setTimeout(() => this.endGame(1), 1500);
              return false;
            }
          }

        }
        else {
          for (let elt2 of elt) {
            this.tableau[elt2[0]][elt2[1]] += 2;
          }
          return true;
        }
      }

      this.tmpWinner = false;
      this.tmpWinnerTab = [];
    }

    while (index < 19) {
      if (this.tableau[lineIndex][index] > 0 && elt == this.tableau[lineIndex][index]) {
        count += 1;
      }
      else {
        elt = this.tableau[lineIndex][index];
        count = 1;
      }
      if (count == 5) {
        this.winType = "align";
        let arr = [];
        while (count > 0) {
          let arr2 = [];
          if (this.tableau[lineIndex][index] == 1) {
            this.tableau[lineIndex][index] = 3;
          }
          if (this.tableau[lineIndex][index] == 2) {
            this.tableau[lineIndex][index] = 4;
          }
          arr2.push(lineIndex);
          arr2.push(index);
          arr.push(arr2);
          index -= 1;
          count -= 1;
        }
        if (this.global.capturesRules) {
          this.tmpWinnerTab.push(arr);
          this.tmpWinner = true;
          break;
        }
        else {
          return true;
        }
      }
      index += 1;
    }

    elt = 0;
    count = 0;
    index = 0;

    while (index < 19) {
      if (this.tableau[index][caseIndex] > 0 && elt == this.tableau[index][caseIndex]) {
        count += 1;
      }
      else {
        elt = this.tableau[index][caseIndex];
        count = 1;
      }
      if (count == 5) {
        this.winType = "align";
        let arr = [];
        while (count > 0) {
          let arr2 = [];
          if (this.tableau[index][caseIndex] == 1) {
            this.tableau[index][caseIndex] = 3;
          }
          if (this.tableau[index][caseIndex] == 2) {
            this.tableau[index][caseIndex] = 4;
          }
          arr2.push(index);
          arr2.push(caseIndex);
          arr.push(arr2);
          index -= 1;
          count -= 1;
        }
        if (this.global.capturesRules) {
          this.tmpWinnerTab.push(arr);
          this.tmpWinner = true;
          break;
        }
        else {
          return true;
        }
      }
      index += 1;
    }

    return this.checkDiagonalWinner1(lineIndex, caseIndex);
  }

  public checkCapture(lineIndex: number, caseIndex: number) {
    let currentOpponent = 0;
    let currentPlayer = 0;
    let caseElt = 0;
    let lineElt = 0;
    let diag1elt = 0;
    let diag2elt = 0;
    let lineDiag1 = this.diagonale1[lineIndex + caseIndex];
    let lineDiag2 = this.diagonale2[lineIndex + (18 - caseIndex)];
    let winner = false;

    if ((this.player1Turn && this.player1Begin) || (!this.player1Turn && !this.player1Begin)) {
      currentPlayer = 1;
      currentOpponent = 2;
    }
    if ((this.player1Turn && !this.player1Begin) || (!this.player1Turn && this.player1Begin)) {
      currentPlayer = 2;
      currentOpponent = 1;
    }

    while (caseElt < 16) {
      if ((this.tableau[lineIndex][caseElt] == currentPlayer || this.tableau[lineIndex][caseElt] == (currentPlayer + 2)) &&
        (this.tableau[lineIndex][caseElt + 1] == currentOpponent || this.tableau[lineIndex][caseElt + 1] == (currentOpponent + 2)) &&
        (this.tableau[lineIndex][caseElt + 2] == currentOpponent || this.tableau[lineIndex][caseElt + 2] == (currentOpponent + 2)) &&
        (this.tableau[lineIndex][caseElt + 3] == currentPlayer || this.tableau[lineIndex][caseElt + 3] == (currentPlayer + 2)) &&
        (caseElt == caseIndex || (caseElt + 3) == caseIndex)) {

          winner = this.incrementeCapture();
          if (this.tableau[lineIndex][caseElt + 1] == 1 || this.tableau[lineIndex][caseElt + 1] == 3) {
            this.tableau[lineIndex][caseElt + 1] = -1;
          }
          else if (this.tableau[lineIndex][caseElt + 1] == 2 || this.tableau[lineIndex][caseElt + 1] == 4) {
            this.tableau[lineIndex][caseElt + 1] = -2;
          }
          if (this.tableau[lineIndex][caseElt + 2] == 1 || this.tableau[lineIndex][caseElt + 2] == 3) {
            this.tableau[lineIndex][caseElt + 2] = -1;
          }
          else if (this.tableau[lineIndex][caseElt + 2] == 2 || this.tableau[lineIndex][caseElt + 2] == 4) {
            this.tableau[lineIndex][caseElt + 2] = -2;
          }
      }
      caseElt++;
    }

    while (lineElt < 16) {
      if ((this.tableau[lineElt][caseIndex] == currentPlayer || this.tableau[lineElt][caseIndex] == (currentPlayer + 2)) &&
        (this.tableau[lineElt + 1][caseIndex] == currentOpponent || this.tableau[lineElt + 1][caseIndex] == (currentOpponent + 2)) &&
        (this.tableau[lineElt + 2][caseIndex] == currentOpponent || this.tableau[lineElt + 2][caseIndex] == (currentOpponent + 2)) &&
        (this.tableau[lineElt + 3][caseIndex] == currentPlayer || this.tableau[lineElt + 3][caseIndex] == (currentPlayer + 2)) &&
        (lineElt == lineIndex || (lineElt + 3) == lineIndex)) {

          winner = this.incrementeCapture();
          if (this.tableau[lineElt + 1][caseIndex] == 1 || this.tableau[lineElt + 1][caseIndex] == 3) {
            this.tableau[lineElt + 1][caseIndex] = -1;
          }
          else if (this.tableau[lineElt + 1][caseIndex] == 2 || this.tableau[lineElt + 1][caseIndex] == 4) {
            this.tableau[lineElt + 1][caseIndex] = -2;
          }
          if (this.tableau[lineElt + 2][caseIndex] == 1 || this.tableau[lineElt + 2][caseIndex] == 3) {
            this.tableau[lineElt + 2][caseIndex] = -1;
          }
          else if (this.tableau[lineElt + 2][caseIndex] == 2 || this.tableau[lineElt + 2][caseIndex] == 4) {
            this.tableau[lineElt + 2][caseIndex] = -2;
          }
      }
      lineElt++;
    }

    while (diag1elt < (lineDiag1.length - 3)) {
      if ((this.tableau[lineDiag1[diag1elt][0]][lineDiag1[diag1elt][1]] == currentPlayer || this.tableau[lineDiag1[diag1elt][0]][lineDiag1[diag1elt][1]] == (currentPlayer + 2)) &&
        (this.tableau[lineDiag1[diag1elt + 1][0]][lineDiag1[diag1elt + 1][1]] == currentOpponent || this.tableau[lineDiag1[diag1elt + 1][0]][lineDiag1[diag1elt + 1][1]] == (currentOpponent + 2)) &&
        (this.tableau[lineDiag1[diag1elt + 2][0]][lineDiag1[diag1elt + 2][1]] == currentOpponent || this.tableau[lineDiag1[diag1elt + 2][0]][lineDiag1[diag1elt + 2][1]] == (currentOpponent + 2)) &&
        (this.tableau[lineDiag1[diag1elt + 3][0]][lineDiag1[diag1elt + 3][1]] == currentPlayer || this.tableau[lineDiag1[diag1elt + 3][0]][lineDiag1[diag1elt + 3][1]] == (currentPlayer + 2)) &&
        ((lineDiag1[diag1elt][0] == lineIndex && lineDiag1[diag1elt][1] == caseIndex) || (lineDiag1[diag1elt + 3][0] == lineIndex && lineDiag1[diag1elt + 3][1] == caseIndex))) {

          winner = this.incrementeCapture();
          if (this.tableau[lineDiag1[diag1elt + 1][0]][lineDiag1[diag1elt + 1][1]] == 1 || this.tableau[lineDiag1[diag1elt + 1][0]][lineDiag1[diag1elt + 1][1]] == 3) {
            this.tableau[lineDiag1[diag1elt + 1][0]][lineDiag1[diag1elt + 1][1]] = -1;
          }
          else if (this.tableau[lineDiag1[diag1elt + 1][0]][lineDiag1[diag1elt + 1][1]] == 2 || this.tableau[lineDiag1[diag1elt + 1][0]][lineDiag1[diag1elt + 1][1]] == 4) {
            this.tableau[lineDiag1[diag1elt + 1][0]][lineDiag1[diag1elt + 1][1]] = -2;
          }
          if (this.tableau[lineDiag1[diag1elt + 2][0]][lineDiag1[diag1elt + 2][1]] == 1 || this.tableau[lineDiag1[diag1elt + 2][0]][lineDiag1[diag1elt + 2][1]] == 3) {
            this.tableau[lineDiag1[diag1elt + 2][0]][lineDiag1[diag1elt + 2][1]] = -1;
          }
          else if (this.tableau[lineDiag1[diag1elt + 2][0]][lineDiag1[diag1elt + 2][1]] == 2 || this.tableau[lineDiag1[diag1elt + 2][0]][lineDiag1[diag1elt + 2][1]] == 4) {
            this.tableau[lineDiag1[diag1elt + 2][0]][lineDiag1[diag1elt + 2][1]] = -2;
          }
      }
      diag1elt++;
    }

    while (diag2elt < (lineDiag2.length - 3)) {
      if ((this.tableau[lineDiag2[diag2elt][0]][lineDiag2[diag2elt][1]] == currentPlayer || this.tableau[lineDiag2[diag2elt][0]][lineDiag2[diag2elt][1]] == (currentPlayer + 2)) &&
        (this.tableau[lineDiag2[diag2elt + 1][0]][lineDiag2[diag2elt + 1][1]] == currentOpponent || this.tableau[lineDiag2[diag2elt + 1][0]][lineDiag2[diag2elt + 1][1]] == (currentOpponent + 2)) &&
        (this.tableau[lineDiag2[diag2elt + 2][0]][lineDiag2[diag2elt + 2][1]] == currentOpponent || this.tableau[lineDiag2[diag2elt + 2][0]][lineDiag2[diag2elt + 2][1]] == (currentOpponent + 2)) &&
        (this.tableau[lineDiag2[diag2elt + 3][0]][lineDiag2[diag2elt + 3][1]] == currentPlayer || this.tableau[lineDiag2[diag2elt + 3][0]][lineDiag2[diag2elt + 3][1]] == (currentPlayer + 2)) &&
        ((lineDiag2[diag2elt][0] == lineIndex && lineDiag2[diag2elt][1] == caseIndex) || (lineDiag2[diag2elt + 3][0] == lineIndex && lineDiag2[diag2elt + 3][1] == caseIndex))) {

          winner = this.incrementeCapture();
          if (this.tableau[lineDiag2[diag2elt + 1][0]][lineDiag2[diag2elt + 1][1]] == 1 || this.tableau[lineDiag2[diag2elt + 1][0]][lineDiag2[diag2elt + 1][1]] == 3) {
            this.tableau[lineDiag2[diag2elt + 1][0]][lineDiag2[diag2elt + 1][1]] = -1;
          }
          else if (this.tableau[lineDiag2[diag2elt + 1][0]][lineDiag2[diag2elt + 1][1]] == 2 || this.tableau[lineDiag2[diag2elt + 1][0]][lineDiag2[diag2elt + 1][1]] == 4) {
            this.tableau[lineDiag2[diag2elt + 1][0]][lineDiag2[diag2elt + 1][1]] = -2;
          }
          if (this.tableau[lineDiag2[diag2elt + 2][0]][lineDiag2[diag2elt + 2][1]] == 1 || this.tableau[lineDiag2[diag2elt + 2][0]][lineDiag2[diag2elt + 2][1]] == 3) {
            this.tableau[lineDiag2[diag2elt + 2][0]][lineDiag2[diag2elt + 2][1]] = -1;
          }
          else if (this.tableau[lineDiag2[diag2elt + 2][0]][lineDiag2[diag2elt + 2][1]] == 2 || this.tableau[lineDiag2[diag2elt + 2][0]][lineDiag2[diag2elt + 2][1]] == 4) {
            this.tableau[lineDiag2[diag2elt + 2][0]][lineDiag2[diag2elt + 2][1]] = -2;
          }
      }
      diag2elt++;
    }

    return winner;
  }

  public incrementeCapture() {
    if (this.player1Turn) {
      this.player1Capture++;
      if (this.player1Capture == 5) {
        this.winType = "capture";
        this.setAllTurnFalse();
        this.winner = "player1";
        setTimeout(() => this.endGame(1), 1500);
        return true;
      }
    }
    if (this.player2Turn) {
      this.player2Capture++;
      if (this.player2Capture == 5) {
        this.winType = "capture";
        this.setAllTurnFalse();
        this.winner = "player2";
        setTimeout(() => this.endGame(1), 1500);
        return true;
      }
    }
    if (this.iaTurn) {
      this.iaCapture++;
      if (this.iaCapture == 5) {
        this.winType = "capture";
        this.setAllTurnFalse();
        this.winner = "ia";
        setTimeout(() => this.endGame(1), 1500);
        return true;
      }
    }
    return false;
  }

  public checkNeighborsCases(line: Array<number>, caseIndex: number, caseTypeSearch: number) {
    if (line[caseIndex] > 0) {
      return true;
    }
    if (caseIndex > 0 && line[caseIndex - 1] > 0) {
      return true;
    }
    if (caseIndex < 18 && line[caseIndex + 1] > 0) {
      return true;
    }
    return false;
  }

  public checkDoubleThrees(lineIndex: number, caseIndex: number) {
    let threes = 0;
    let tmpCaseIndex = 0;
    let tmpLineIndex = 0;
    let currentOpponent = 0;
    let currentPlayer = 0;
    let diag1elt = 0;
    let diag2elt = 0;
    let lineDiag1 = this.diagonale1[lineIndex + caseIndex];
    let lineDiag2 = this.diagonale2[lineIndex + (18 - caseIndex)];

    if ((this.player1Turn && this.player1Begin) || (!this.player1Turn && !this.player1Begin)) {
      currentPlayer = 1;
      currentOpponent = 2;
    }
    if ((this.player1Turn && !this.player1Begin) || (!this.player1Turn && this.player1Begin)) {
      currentPlayer = 2;
      currentOpponent = 1;
    }

    
    while (tmpCaseIndex < 19) {
      if (tmpCaseIndex < 18 && this.tableau[lineIndex][tmpCaseIndex] == 0 && tmpCaseIndex != caseIndex &&
        (this.tableau[lineIndex][tmpCaseIndex + 1] != 0 || (this.tableau[lineIndex][tmpCaseIndex + 1] == 0 && (tmpCaseIndex + 1) == caseIndex))) {
        let count = 0;
        let voidCase = 1;
        let find = 0;
        let save = tmpCaseIndex;

        tmpCaseIndex++;
        while (tmpCaseIndex < 19) {  
          if (this.tableau[lineIndex][tmpCaseIndex] == currentPlayer || this.tableau[lineIndex][tmpCaseIndex] == (currentPlayer + 2)) {
            count++;
          }
          else if (this.tableau[lineIndex][tmpCaseIndex] == 0 && tmpCaseIndex == caseIndex) {
            find = 1
            count++;
          }
          else if (this.tableau[lineIndex][tmpCaseIndex] == 0 && voidCase == 1 && count < 3 && tmpCaseIndex != caseIndex) {
            voidCase = 0
          }
          else {
            break;
          }
          tmpCaseIndex++;
        }
        if (tmpCaseIndex < 19 && count == 3 && find == 1 && this.tableau[lineIndex][tmpCaseIndex] == 0 && tmpCaseIndex != caseIndex){
          threes++;
          // console.log("horizontale three");
          
        }
        else {
          tmpCaseIndex = save;
        }
      }
      tmpCaseIndex++;
    }

    while (tmpLineIndex < 19) {
      if (tmpLineIndex < 18 && this.tableau[tmpLineIndex][caseIndex] == 0 && tmpLineIndex != lineIndex &&
        (this.tableau[tmpLineIndex + 1][caseIndex] != 0 || (this.tableau[tmpLineIndex + 1][caseIndex] == 0 && (tmpLineIndex + 1) == lineIndex))) {
        let count = 0;
        let voidCase = 1;
        let find = 0;
        let save = tmpLineIndex;

        tmpLineIndex++;
        while (tmpLineIndex < 19) {  
          if (this.tableau[tmpLineIndex][caseIndex] == currentPlayer || this.tableau[tmpLineIndex][caseIndex] == (currentPlayer + 2)) {
            count++;
          }
          else if (this.tableau[tmpLineIndex][caseIndex] == 0 && tmpLineIndex == lineIndex) {
            find = 1
            count++;
          }
          else if (this.tableau[tmpLineIndex][caseIndex] == 0 && voidCase == 1 && count < 3 && tmpLineIndex != lineIndex) {
            voidCase = 0
          }
          else {
            break;
          }
          tmpLineIndex++;
        }
        if (tmpLineIndex < 19 && count == 3 && find == 1 && this.tableau[tmpLineIndex][caseIndex] == 0 && tmpLineIndex != lineIndex){
          threes++;
          // console.log("verticale three");
        }
        else {
          tmpLineIndex = save;
        }
      }
      tmpLineIndex++;
    }


    while (diag1elt < lineDiag1.length) {
      if (diag1elt < (lineDiag1.length - 1) && this.tableau[lineDiag1[diag1elt][0]][lineDiag1[diag1elt][1]] == 0 && lineDiag1[diag1elt][0] != lineIndex &&
        (this.tableau[lineDiag1[diag1elt + 1][0]][lineDiag1[diag1elt + 1][1]] != 0 || (this.tableau[lineDiag1[diag1elt + 1][0]][lineDiag1[diag1elt + 1][1]] == 0 && (lineDiag1[diag1elt + 1][0] == lineIndex && lineDiag1[diag1elt + 1][1] == caseIndex)))) {
        let count = 0;
        let voidCase = 1;
        let find = 0;
        let save = diag1elt;

        diag1elt++;
        while (diag1elt < lineDiag1.length) {  
          if (this.tableau[lineDiag1[diag1elt][0]][lineDiag1[diag1elt][1]] == currentPlayer || this.tableau[lineDiag1[diag1elt][0]][lineDiag1[diag1elt][1]] == (currentPlayer + 2)) {
            count++;
          }
          else if (this.tableau[lineDiag1[diag1elt][0]][lineDiag1[diag1elt][1]] == 0 && (lineDiag1[diag1elt][0] == lineIndex && lineDiag1[diag1elt][1] == caseIndex)) {
            find = 1
            count++;
          }
          else if (this.tableau[lineDiag1[diag1elt][0]][lineDiag1[diag1elt][1]] == 0 && voidCase == 1 && count < 3 && lineDiag1[diag1elt][0] != lineIndex) {
            voidCase = 0
          }
          else {
            break;
          }
          diag1elt++;
        }
        if (diag1elt < lineDiag1.length && count == 3 && find == 1 && this.tableau[lineDiag1[diag1elt][0]][lineDiag1[diag1elt][1]] == 0 && lineDiag1[diag1elt][0] != lineIndex){
          threes++;
          //  console.log("diag1 three");
        }
        else {
          diag1elt = save;
        }
      }
      diag1elt++;
    }

    while (diag2elt < lineDiag2.length) {
      if (diag2elt < (lineDiag2.length - 1) && this.tableau[lineDiag2[diag2elt][0]][lineDiag2[diag2elt][1]] == 0 && lineDiag2[diag2elt][0] != lineIndex &&
        (this.tableau[lineDiag2[diag2elt + 1][0]][lineDiag2[diag2elt + 1][1]] != 0 || (this.tableau[lineDiag2[diag2elt + 1][0]][lineDiag2[diag2elt + 1][1]] == 0 && (lineDiag2[diag2elt + 1][0] == lineIndex && lineDiag2[diag2elt + 1][1] == caseIndex)))) {
        let count = 0;
        let voidCase = 1;
        let find = 0;
        let save = diag2elt;

        diag2elt++;
        while (diag2elt < lineDiag2.length) {  
          if (this.tableau[lineDiag2[diag2elt][0]][lineDiag2[diag2elt][1]] == currentPlayer || this.tableau[lineDiag2[diag2elt][0]][lineDiag2[diag2elt][1]] == (currentPlayer + 2)) {
            count++;
          }
          else if (this.tableau[lineDiag2[diag2elt][0]][lineDiag2[diag2elt][1]] == 0 && (lineDiag2[diag2elt][0] == lineIndex && lineDiag2[diag2elt][1] == caseIndex)) {
            find = 1
            count++;
          }
          else if (this.tableau[lineDiag2[diag2elt][0]][lineDiag2[diag2elt][1]] == 0 && voidCase == 1 && count < 3 && lineDiag2[diag2elt][0] != lineIndex) {
            voidCase = 0
          }
          else {
            break;
          }
          diag2elt++;
        }
        if (diag2elt < lineDiag2.length && count == 3 && find == 1 && this.tableau[lineDiag2[diag2elt][0]][lineDiag2[diag2elt][1]] == 0 && lineDiag2[diag2elt][0] != lineIndex){
          threes++;
          //  console.log("diag2 three");
        }
        else {
          diag2elt = save;
        }
      }
      diag2elt++;
    }


    if (threes > 1){
      return true
    }
    return false
  }

  public checkValidPush(lineIndex: number, caseIndex: number, caseTypeSearch: number) {

    let lines = [];

    lines.push(this.tableau[lineIndex]);

    if (this.global.doubleThreesRules && this.checkDoubleThrees(lineIndex, caseIndex)) {
      let tmp = this.tableau[lineIndex][caseIndex];
      this.tableau[lineIndex][caseIndex] = -3;
      setTimeout(() => this.tableau[lineIndex][caseIndex] = tmp, 150);
      return false;
    }
    if (this.firstTurn) {
      if (caseIndex == 9 && lineIndex == 9) {
        this.firstTurn = false;
        return true;
      }
      let tmp = this.tableau[lineIndex][caseIndex];
      this.tableau[lineIndex][caseIndex] = -3;
      setTimeout(() => this.tableau[lineIndex][caseIndex] = tmp, 150);
      return false;
    }

    if (lineIndex > 0) {
      lines.push(this.tableau[lineIndex - 1]);
    }
    if (lineIndex < 18) {
      lines.push(this.tableau[lineIndex + 1]);
    }
    for (let line of lines) {
      if (this.checkNeighborsCases(line, caseIndex, caseTypeSearch)) {
        return true;
      }
    }
    let tmp = this.tableau[lineIndex][caseIndex];
    this.tableau[lineIndex][caseIndex] = -3;
    setTimeout(() => this.tableau[lineIndex][caseIndex] = tmp, 150);
    return false;
  }

  public pushCase(lineIndex: number, caseIndex: number) {
    this.isPlaying = true;
    if (this.tableau[lineIndex][caseIndex] > -3 && this.tableau[lineIndex][caseIndex] < 1) {
      if (this.player1Turn && this.player1Begin && this.checkValidPush(lineIndex, caseIndex, 2)) {
        if (this.player1Pawns == 0) {
          this.endGame(0)
          return;
        }
        this.tableau[lineIndex][caseIndex] = 1;
        if (this.global.capturesRules && this.checkCapture(lineIndex, caseIndex)) {
          // this.setAllTurnFalse();
          // this.winner = "player1";
          // setTimeout(() => this.endGame(1), 1500);
          return;
        }
        if (this.checkWinner(lineIndex, caseIndex)) {
          this.setAllTurnFalse();
          this.winner = "player1";
          setTimeout(() => this.endGame(1), 1500);
          return;
        }
        this.player1Pawns -= 1;
        this.pawnsPlayed += 1;
        if (this.twoPlayersMode) {
          this.player1Turn = false;
          this.player2Turn = true;
          this.limitTimerPlayer2 = Date.now() + this.global.timer;
        }
        else {
          this.player1Turn = false;
          this.iaTurn = true;
          this.limitTimerIa = Date.now() + this.timeForPlayIa;
          this.callRustAi(lineIndex, caseIndex, this.player1Capture, this.iaCapture, this.player1Pawns, this.iaPawns, this.player1Begin, this.firstTurn);
        }
      }
      else if (this.player1Turn && !this.player1Begin && this.checkValidPush(lineIndex, caseIndex, 1)) {
        if (this.player1Pawns == 0) {
          this.endGame(0)
          return;
        }
        this.tableau[lineIndex][caseIndex] = 2;
        if (this.global.capturesRules && this.checkCapture(lineIndex, caseIndex)) {
          // this.setAllTurnFalse();
          // this.winner = "player1";
          // setTimeout(() => this.endGame(1), 1500);
          return;
        }
        if (this.checkWinner(lineIndex, caseIndex)) {
          this.setAllTurnFalse();
          this.winner = "player1";
          setTimeout(() => this.endGame(1), 1500);
          return;
        }
        this.player1Pawns -= 1;
        this.pawnsPlayed += 1;
        if (this.twoPlayersMode) {
          this.player1Turn = false;
          this.player2Turn = true;
          this.limitTimerPlayer2 = Date.now() + this.global.timer;
        }
        else {
          this.player1Turn = false;
          this.iaTurn = true;
          this.limitTimerIa = Date.now() + this.timeForPlayIa;
          this.callRustAi(lineIndex, caseIndex, this.player1Capture, this.iaCapture, this.player1Pawns, this.iaPawns, this.player1Begin!, this.firstTurn);
        }
      }
      else if (this.iaTurn && this.player1Begin && this.checkValidPush(lineIndex, caseIndex, 1)) {
        if (this.iaPawns == 0) {
          this.endGame(0)
          return;
        }
        this.tableau[lineIndex][caseIndex] = 2;
        if (this.global.capturesRules && this.checkCapture(lineIndex, caseIndex)) {
          // this.setAllTurnFalse();
          // this.winner = "ia";
          // setTimeout(() => this.endGame(1), 1500);
          return;
        }
        if (this.checkWinner(lineIndex, caseIndex)) {
          this.setAllTurnFalse();
          this.winner = "ia";
          setTimeout(() => this.endGame(2), 1500);
          return;
        }
        this.iaPawns -= 1;
        this.pawnsPlayed += 1;
        this.iaTurn = false;
        this.player1Turn = true;
        this.limitTimerPlayer1 = Date.now() + this.global.timer;
      }
      else if (this.iaTurn && !this.player1Begin && this.checkValidPush(lineIndex, caseIndex, 2)) {
        if (this.iaPawns == 0) {
          this.endGame(0)
          return;
        }
        this.tableau[lineIndex][caseIndex] = 1;
        if (this.global.capturesRules && this.checkCapture(lineIndex, caseIndex)) {
          // this.setAllTurnFalse();
          // this.winner = "ia";
          // setTimeout(() => this.endGame(1), 1500);
          return;
        }
        if (this.checkWinner(lineIndex, caseIndex)) {
          this.setAllTurnFalse();
          this.winner = "ia";
          setTimeout(() => this.endGame(2), 1500);
          return;
        }
        this.iaPawns -= 1;
        this.pawnsPlayed += 1;
        this.iaTurn = false;
        this.player1Turn = true;
        this.limitTimerPlayer1 = Date.now() + this.global.timer;
      }
      else if (this.player2Turn && this.player1Begin && this.checkValidPush(lineIndex, caseIndex, 1)) {
        if (this.player2Pawns == 0) {
          this.endGame(0)
          return;
        }
        this.tableau[lineIndex][caseIndex] = 2;
        if (this.global.capturesRules && this.checkCapture(lineIndex, caseIndex)) {
          // this.setAllTurnFalse();
          // this.winner = "player2";
          // setTimeout(() => this.endGame(1), 1500);
          return;
        }
        if (this.checkWinner(lineIndex, caseIndex)) {
          this.setAllTurnFalse();
          this.winner = "player2";
          setTimeout(() => this.endGame(2), 1500);
          return;
        }
        this.player2Pawns -= 1;
        this.pawnsPlayed += 1;
        this.player2Turn = false;
        this.player1Turn = true;
        this.limitTimerPlayer1 = Date.now() + this.global.timer;
      }
      else if (this.player2Turn && !this.player1Begin && this.checkValidPush(lineIndex, caseIndex, 2)) {
        if (this.player2Pawns == 0) {
          this.endGame(0)
          return;
        }
        this.tableau[lineIndex][caseIndex] = 1;
        if (this.global.capturesRules && this.checkCapture(lineIndex, caseIndex)) {
          // this.setAllTurnFalse();
          // this.winner = "player2";
          // setTimeout(() => this.endGame(1), 1500);
          return;
        }
        if (this.checkWinner(lineIndex, caseIndex)) {
          this.setAllTurnFalse();
          this.winner = "player2";
          setTimeout(() => this.endGame(2), 1500);
          return;
        }
        this.player2Pawns -= 1;
        this.pawnsPlayed += 1;
        this.player2Turn = false;
        this.player1Turn = true;
        this.limitTimerPlayer1 = Date.now() + this.global.timer;
      }
      if (this.pawnsPlayed == 361 || (this.player1Pawns == 0 && ((this.twoPlayersMode && this.player2Pawns == 0) || (!this.twoPlayersMode && this.player2Pawns == 0)))) {
        this.endGame(0)
        return;
      }
    }
    this.isPlaying = false;
    // console.log(this.tableau);
    // console.log(this.diagonale1);
    // console.log(this.diagonale2);
  }


  public callRustAi(lineIndex: number, caseIndex: number, player1Capture: number, aiCapture: number, player1Stones: number, aiStones: number, player1Begin: boolean, firstTurn: boolean) {

    // let result = await invoke('greet', { name: 'World' });
    invoke('ai_move', { lineIndex: lineIndex, caseIndex: caseIndex, player1Capture: player1Capture, aiCapture: aiCapture, player1Stones: player1Stones, aiStones: aiStones, player1Begin: player1Begin, firstTurn: firstTurn})
    .then((response) => this.iaMove = response)
    

    // this.iaTurn = false;
    // this.player1Turn = true;
    // this.limitTimerPlayer1 = Date.now() + this.global.timer;
  }

}
