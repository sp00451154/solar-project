import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { CommonService } from '../services/common.service';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  private destroy$: Subject<void> = new Subject();

  formGroup: FormGroup;
  titleAlert: string = 'This field is required';
  post: any = '';
  message: any = '';

  constructor(private formBuilder: FormBuilder, private commonService: CommonService, private router: Router,) { }

  ngOnInit() {
    this.createForm();
    this.setChangeValidate();
  }

  createForm() {
    let emailregex: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    this.formGroup = this.formBuilder.group({
      'email': [null, [Validators.required, Validators.pattern(emailregex)], this.checkInUseEmail],
      'userName': [null, Validators.required],
      'password': [null, [Validators.required, this.checkPassword]],
      'confirmPassword': [null, [Validators.required, this.checkPassword]],
      'phone': [null, [Validators.required, Validators.min(1000000000), Validators.maxLength(9999999999)]],
      'validate': ''
    });
  }

  setChangeValidate() {
    this.formGroup.get('validate').valueChanges.subscribe(
      (validate) => {
        if (validate == '1') {
          this.formGroup.get('userName').setValidators([Validators.required, Validators.minLength(3)]);
          this.titleAlert = "You need to specify at least 3 characters";
        } else {
          this.formGroup.get('userName').setValidators(Validators.required);
        }
        this.formGroup.get('userName').updateValueAndValidity();
      }
    )
  }

  get userName() {
    return this.formGroup.get('userName') as FormControl
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
  getErrorConfirmPassword() {
    return this.formGroup.get('confirmPassword').hasError('required') ? 'Field is required (at least eight characters, one uppercase letter and one number)' :
      this.formGroup.get('confirmPassword').hasError('requirements') ? 'Password needs to be at least eight characters, one uppercase letter and one number' : '';
  }
  get isFormInfoValid() {
    return (
      this.formGroup.controls.email.valid &&
      this.formGroup.controls.userName.valid &&
      this.formGroup.controls.password.valid &&
      this.formGroup.controls.confirmPassword.valid &&
      this.formGroup.controls.password.value === this.formGroup.controls.confirmPassword.value
    );
  }
  // onSubmit(post) {
  //   this.post = post;
  // }
  onSubmit(post) {
    const payLoad = post;
    delete payLoad.validate;
    this.commonService.register(`register`, payLoad).subscribe(res => {
      if (res.success) {
        this.formGroup.reset();
        this.message = 'Profile created successfully!';
      }
    }, (err) => {
      if (err) {
        console.log(err);
        this.message = err.error.message;
      }
    });
  }
  navigateToPath() {
    this.router.navigate(['/login']);
  }

}
