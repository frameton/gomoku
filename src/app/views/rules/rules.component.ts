import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { VariablesGlobales } from 'src/app/sharing/globalVariables';

import { invoke } from '@tauri-apps/api'

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss']
})
export class RulesComponent {
  constructor(public global: VariablesGlobales, private router: Router ) {}

  ngOnInit(): void {
    if (this.global.welcomePage) {
      this.router.navigate(['/']);
    }
  }

}
