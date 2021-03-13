import { NgModule } from '@angular/core';

import { DashboardComponent } from './dashboard/dashboard.component';
import { RouterModule } from '@angular/router';
import { routes } from './admin-routing.module';
import { MaterialModule } from './../material.module';
import { CommonModule } from '@angular/common'; 


@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    MaterialModule,
    CommonModule
  ],
  providers: []
})
export class AdminModule { }
