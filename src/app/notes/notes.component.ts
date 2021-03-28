import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { CommonService } from '../services/common.service';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import * as moment from 'moment-timezone';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';


@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit {
  private destroy$: Subject<void> = new Subject();

  formGroup: FormGroup;
  titleAlert: string = 'This field is required';
  post: any = '';
  message: any = '';
  response: boolean;
  roles = [
    {value: 'JAVASCRIPT', viewValue: 'JAVASCRIPT'},
    {value: 'HTML5', viewValue: 'HTML5'},
    {value: 'CSS3', viewValue: 'CSS3'}
  ];
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  links: any = [
    {name: 'www.google.com'},
  ];
  topics: any = [
    {name: 'JAVASCRIPT'},
    {name: 'HTML5'},
    {name: 'CSS3'},
  ];

  constructor(private formBuilder: FormBuilder, private commonService: CommonService, private router: Router,) { }

  ngOnInit() {
    this.createForm();
    this.setChangeValidate();
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      'topics': [null, Validators.required],
      'topic': [null, Validators.required],
      'question': [null, [Validators.required]],
      'answer': [null, [Validators.required]],
      'links': [null, [Validators.required]],
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


  // getErrorConfirmPassword() {
  //   return this.formGroup.get('confirmPassword').hasError('required') ? 'Field is required (at least eight characters, one uppercase letter and one number)' :
  //     this.formGroup.get('confirmPassword').hasError('requirements') ? 'Password needs to be at least eight characters, one uppercase letter and one number' : '';
  // }
  get isFormInfoValid() {
    return (
      this.formGroup.controls.topic.valid &&
      this.formGroup.controls.question.valid &&
      this.formGroup.controls.answer.valid
    );
  }
 
  onSubmit(note) {
    const payLoad = note;
    delete payLoad.validate;
    this.commonService.createANote(`uploadNote`, payLoad).subscribe(res => {
      if (res.body.successID) {
        this.message = `Notes added successfully for ${this.formGroup.value['question'] }.`;
        this.formGroup.controls.question.reset('');
        this.formGroup.controls.answer.reset('');
        this.formGroup.controls.links.reset('');
      }
    }, (err) => {
      if (err) {
        console.log(err);
        this.message = err.error.message;
      }
    });
  }
  addTopic() {
    const payLoad = {
      'topics' : this.topics
    };
    this.commonService.uploadTopics(`uploadTopics`, payLoad).subscribe(res => {
      if (res.body.successID) {
        this.message = `${this.topics[this.topics.length - 1 ].name.toUpperCase()} has been added to the list.`;
      }
    }, (err) => {
      if (err) {
        console.log(err);
        this.message = err.error.message;
      }
    });
  }
  convertDate(d, type) {
    d = new Date(Date.parse(d));
    const currentTime = new Date(d);
    d = moment(currentTime).tz('MST7MDT').format("YYYY-MM-DD HH:mm:ss");
    if (!d) {
      return;
    }
    const format = 'YYYY-MM-DD';
    d = d.split('-');
    const date = `${d[0]}-${d[1]}-${d[2].substring(0, 2)}`;
    let formattedDate = '';
    if (type === 'ToDate') {
      formattedDate = moment(date).add(0, 'day').endOf('day').format(format).toString();
    } else if (type === 'FromDate') {
      formattedDate = moment(date).startOf('day').format(format).toString();
    }
    // console.log('formattedDate++++', formattedDate);
    return formattedDate;
  }
  addTopics(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our topics
    if ((value || '').trim()) {
      this.topics.push({name: value.trim()});
      if (this.topics && this.topics.length) {
        this.addTopic();
      }
    }
    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  removeTopics(fruit: any): void {
    const index = this.topics.indexOf(fruit);

    if (index >= 0) {
      this.topics.splice(index, 1);
    }
  }
  addLinks(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      this.links.push({name: value.trim()});
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  removeLinks(fruit: any): void {
    const index = this.links.indexOf(fruit);

    if (index >= 0) {
      this.links.splice(index, 1);
    }
  }
  navigateToPath() {
    this.router.navigate(['/login']);
  }

}
