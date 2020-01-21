import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GKDComponent } from './gkd.component';
import { SharedModule } from '../shared/shared.module';
import { GkdRendererModule } from './gkd-renderer/gkd-renderer.module';
import { GkdTickerRendererModule } from './gkd-ticker-renderer/gkd-ticker-renderer.module';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: GKDComponent
  }
];

@NgModule({
  declarations: [
    GKDComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    GkdRendererModule,
    GkdTickerRendererModule
  ]
})
export class GkdModule { }
