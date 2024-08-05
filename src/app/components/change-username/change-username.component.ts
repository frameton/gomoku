import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsernameRegex } from 'src/app/regex/usernameRegex';
import { VariablesGlobales } from 'src/app/sharing/globalVariables';

@Component({
  selector: 'app-change-username',
  templateUrl: './change-username.component.html',
  styleUrls: ['./change-username.component.scss']
})
export class ChangeUsernameComponent {
  @ViewChild("changeUsernameDiv") changeUsernameDiv!: ElementRef;
  newUsernameForm!: FormGroup;

  constructor(public global: VariablesGlobales, private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.newUsernameForm = this.formBuilder.group({
      username: [null, [Validators.required, Validators.pattern(UsernameRegex)]],
    });
    this.newUsernameForm.controls['username'].setValue(this.global.username);
  }

  onSubmitForm() {
    if (this.newUsernameForm.valid) {
      this.changeUsernameDiv.nativeElement.classList.add("fastFadeout");

      setTimeout(() =>  this.global.username = this.newUsernameForm.controls['username'].value, 300);
      setTimeout(() =>  this.global.changeUsername = false, 300);
    }
  }

}
