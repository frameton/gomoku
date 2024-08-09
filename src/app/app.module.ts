import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WelcomeComponent } from './views/welcome/welcome.component';
import { FooterComponent } from './components/footer/footer.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { MatIconModule } from '@angular/material/icon';
import { VariablesGlobales } from './sharing/globalVariables';
import { ChangeUsernameComponent } from './components/change-username/change-username.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RulesComponent } from './views/rules/rules.component';
import { GameComponent } from './views/game/game.component';
import { SettingsComponent } from './views/settings/settings.component';
import { DevgameComponent } from './views/devgame/devgame.component';

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    FooterComponent,
    NavBarComponent,
    ChangeUsernameComponent,
    RulesComponent,
    GameComponent,
    SettingsComponent,
    DevgameComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [VariablesGlobales],
  bootstrap: [AppComponent]
})
export class AppModule { }
