import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { CommonService } from '../services/common.service';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/role';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  Role = Role;
  showForm: boolean;
  formGroup: FormGroup;
  titleAlert: string = 'This field is required';
  post: any = '';
  message: any = '';
  role: Role;
  logoutNeeded: boolean;
  isAuth: any;

  constructor(private router: Router, private authService: AuthService,
    private formBuilder: FormBuilder, private commonService: CommonService) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    let emailregex: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    this.formGroup = this.formBuilder.group({
      'email': [null, [Validators.required, Validators.pattern(emailregex)], this.checkInUseEmail],
      'password': [null, [Validators.required, this.checkPassword]],
    });
  }


  checkPassword(control) {
    let enteredPassword = control.value
    let passwordCheck = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
    return (!passwordCheck.test(enteredPassword) && enteredPassword) ? { 'requirements': true } : null;
  }

  checkInUseEmail(control) {
    // mimic http database access
    let db = ['tony@gmail.com'];
    return new Observable(observer => {
      setTimeout(() => {
        let result = (db.indexOf(control.value) !== -1) ? { 'alreadyInUse': true } : null;
        observer.next(result);
        observer.complete();
      }, 4000);
    });
  }

  getErrorEmail() {
    return this.formGroup.get('email').hasError('required') ? 'Field is required' :
      this.formGroup.get('email').hasError('pattern') ? 'Not a valid emailaddress' :
        this.formGroup.get('email').hasError('alreadyInUse') ? 'This emailaddress is already in use' : '';
  }

  getErrorPassword() {
    return this.formGroup.get('password').hasError('required') ? 'Field is required (at least eight characters, one uppercase letter and one number)' :
      this.formGroup.get('password').hasError('requirements') ? 'Password needs to be at least eight characters, one uppercase letter and one number' : '';
  }
  get isFormInfoValid() {
    return (
      this.formGroup.controls.email.valid &&
      this.formGroup.controls.password.valid
    );
  }
  login() {
    this.showForm = true;
   
  }

  logout() {
    this.authService.logout();
  }
  onSubmit(post) {
    const payLoad = post;
    this.commonService.login(`login`, payLoad).subscribe(res => {
      this.logoutNeeded = false;
      if (res.body.isAuth) {
        this.formGroup.reset();
        this.message = 'Logged in successfully!';
        if (!res.body.isAdmin) {
            this.role = Role.User;
        } else {
          this.role = Role.Admin;
        }
        if (this.role) {
          this.authService.login(this.role);
          this.router.navigate(['/']);
        }
      } else {
        this.message = res.body.message;
        this.isAuth = res.body.isAuth;
      }
    }, (err) => {
      if (err) {
        console.log(err);
        if (err.error.logoutNeeded) {
          this.logoutNeeded = true;
        }
        this.message = err.error.message;
      }
    });
  }
  navigateToPath() {
    this.authService.logout();
  }

}
