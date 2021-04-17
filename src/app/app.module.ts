import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MaterialModule } from './material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app/app.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { NotFoundComponent } from './error/not-found/not-found.component';
import { LoginComponent } from './login/login.component';
import { UserRoleDirective } from './directives/user-role.directive';
import { UserDirective } from './directives/user.directive';
import { AuthService } from './services/auth.service';
import { SignupComponent } from './signup/signup.component';
import { NotesComponent } from './notes/notes.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonService } from './services/common.service';
import { ManipulateComponent } from './admin/delete-profile/manipulate.component';
import {HttpClientModule, HTTP_INTERCEPTORS, HttpClientXsrfModule} from "@angular/common/http";
import { FormsModule } from '@angular/forms';
import { ExpansesComponent } from './expanses/expanses.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProfileComponent,
    NotFoundComponent,
    LoginComponent,
    UserDirective,
    UserRoleDirective,
    SignupComponent,
    NotesComponent,
    ExpansesComponent,
    ManipulateComponent,
  ],
  entryComponents: [ManipulateComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    ReactiveFormsModule,
    HttpClientModule,
    HttpClientXsrfModule,
    FormsModule
  ],
  exports: [
    UserDirective,
    UserRoleDirective,
    ManipulateComponent,
  ],
  providers: [AuthService, CommonService],
  bootstrap: [AppComponent]
})
export class AppModule { }
