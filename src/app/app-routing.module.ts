import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomeComponent } from './views/welcome/welcome.component';
import { RulesComponent } from './views/rules/rules.component';
import { GameComponent } from './views/game/game.component';
import { SettingsComponent } from './views/settings/settings.component';
import { DevgameComponent } from './views/devgame/devgame.component';

const routes: Routes = [
  {
    path: "welcome",
    component: WelcomeComponent,
  },
  {
    path: "rules",
    component: RulesComponent,
  },
  {
    path: "game",
    component: GameComponent,
  },
  {
    path: "devgame",
    component: DevgameComponent,
  },
  {
    path: "settings",
    component: SettingsComponent,
  },
  {
    path: "",
    redirectTo: 'devgame',
    pathMatch: 'full'
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
