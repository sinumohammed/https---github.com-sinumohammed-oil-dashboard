import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { OilFieldDashboardComponent } from './dashboard/oil-field-dashboard.component';
import { DashboardBuilderComponent } from './dashboard/dashboard-builder.component';

const routes: Routes = [
  { path: '', redirectTo: '/production-dashboard', pathMatch: 'full' },
  { path: 'production-dashboard', component: OilFieldDashboardComponent },
  { path: 'dashboard-builder', component: DashboardBuilderComponent }
];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    DashboardModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
