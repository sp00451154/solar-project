import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { CommonService } from '../services/common.service';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import * as moment from 'moment-timezone';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import {MatSnackBar} from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ManipulateComponent } from './../admin/delete-profile/manipulate.component';




@Component({
  selector: 'app-expanses',
  templateUrl: './expanses.component.html',
  styleUrls: ['./expanses.component.css']
})
export class ExpansesComponent implements OnInit {
  private destroy$: Subject<void> = new Subject();

  formGroup: FormGroup;
  titleAlert = 'This field is required';
  post: any = '';
  message: any = '';
  response: boolean;
  nameChips = [
    { value: 'SIBA', viewValue: 'SIBA' },
    { value: 'BISWA', viewValue: 'BISWA' },
    { value: 'MANTU', viewValue: 'MANTU' }
  ];
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  commonExpanses: any = [
    { name: 'Rent', amount: 0 },
    { name: 'Cook', amount: 0 },
    { name: 'Mausi', amount: 0 },
  ];
  names: any = [
    { name: 'SIBA' },
    { name: 'BISWA' },
    { name: 'MANTU' },
  ];
  spendObject = [];
  isLinear = false;
  expanseNameFormGroup: FormGroup;
  expanseAmountFormGroup: FormGroup;
  individualAmountSpent = [];
  individualExpanseSpent: any;
  totalAmountSpent: any;
  perHeadAmountSpent: number;
  constructor(private formBuilder: FormBuilder, private commonService: CommonService,
              private router: Router, private snackBar: MatSnackBar,
              public matDialog: MatDialog) { }

  ngOnInit() {
    this.createForm();
    this.setChangeValidate();
    this.expanseNameFormGroup = this.formBuilder.group({
      expanseName: ['', Validators.required]
    });
    this.expanseAmountFormGroup = this.formBuilder.group({
      expanseAmount: ['', Validators.required]
    });

  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      names: [null, Validators.required],
      expanseSpentBy: [null, Validators.required],
      commonExpanses: [null, [Validators.required]],
      validate: ''
    });
  }

  setChangeValidate() {
    this.formGroup.get('validate').valueChanges.subscribe(
      (validate) => {
        if (validate === '1') {
          this.formGroup.get('userName').setValidators([Validators.required, Validators.minLength(3)]);
          this.titleAlert = 'You need to specify at least 3 characters';
        } else {
          this.formGroup.get('userName').setValidators(Validators.required);
        }
        this.formGroup.get('userName').updateValueAndValidity();
      }
    );
  }

  get userName() {
    return this.formGroup.get('userName') as FormControl;
  }


  checkInUseEmail(control) {
    // mimic http database access
    const db = ['tony@gmail.com'];
    return new Observable(observer => {
      setTimeout(() => {
        const result = (db.indexOf(control.value) !== -1) ? { alreadyInUse: true } : null;
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

  get isFormInfoValid() {
    return (
      this.formGroup.controls.expanseSpentBy.valid
    );
  }

  onSubmit(note) {
    const payLoad = note;
    delete payLoad.validate;
    this.commonService.createANote(`uploadNote`, payLoad).subscribe(res => {
      if (res.body.successID) {
        // this.message = `Notes added successfully for ${this.formGroup.value['question'] }.`;
        this.formGroup.controls.commonExpanses.reset('');
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
      names: this.names
    };
    this.commonService.uploadTopics(`uploadTopics`, payLoad).subscribe(res => {
      if (res.body.successID) {
        this.nameChips = this.names.map(e => ({ value: e.name.toUpperCase(), viewValue: e.name.toUpperCase() }));
        this.message = `${this.names[this.names.length - 1].name.toUpperCase()} has been added as your roommate.`;
      }
    }, (err) => {
      if (err) {
        console.log(err);
        this.message = err.error.message;
      }
    });
  }
  addExpanse() {
    const spentBy = (this.formGroup.get('expanseSpentBy').value);
    const spentOn = (this.expanseNameFormGroup.get('expanseName').value);
    const spentAmount = Number(this.expanseAmountFormGroup.get('expanseAmount').value);
    this.nameChips.forEach(element => {
      if (element.value.toLowerCase() === spentBy.toLowerCase()) {
        this.commonService.addExpanseDetails(`expanseUpload`, { name: element.value, spentAmount, spentOn }).subscribe(res => {
          if (res.body.successID) {
            // this.message = `${this.names[this.names.length - 1].name.toUpperCase()} has been added as your roommate.`;
          }
        }, (err) => {
          if (err) {
            console.log(err);
            this.message = err.error.message;
          }
        });
        const payLoad = {
          names : this.nameChips.map(e => e.value)
        };
        this.commonService.getExpanses(`getExpanses`, payLoad).subscribe(res => {
          if (res.body.data && res.body.data.length > 0) {
            this.calculateExpanse(res.body.data);
          }
        }, (err) => {
          if (err) {
            console.log(err);
            this.message = err.error.message;
          }
        });
      }
    });
    console.log(this.individualAmountSpent);
  }
  calculateExpanse(d) {
    this.individualExpanseSpent = d;
    const amountList = d.map(e => e.total);
    const sum = amountList.reduce( (a, b) => {
      return a + b;
  }, 0);
    this.totalAmountSpent = sum;
    this.perHeadAmountSpent = sum / this.nameChips.length;
    console.log('individualExpanseSpent', this.individualExpanseSpent);
    console.log('totalAmountSpent', this.totalAmountSpent);
    console.log('perHeadAmountSpent', this.perHeadAmountSpent);
  }
  convertDate(d, type) {
    d = new Date(Date.parse(d));
    const currentTime = new Date(d);
    d = moment(currentTime).tz('MST7MDT').format('YYYY-MM-DD HH:mm:ss');
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

    // Add our names
    if ((value || '').trim()) {
      this.names.push({ name: value.trim() });
      if (this.names && this.names.length) {
        this.addTopic();
      }
    }
    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  removeTopics(fruit: any): void {
    const index = this.names.indexOf(fruit);

    if (index >= 0) {
      this.names.splice(index, 1);
      this.nameChips = this.names.map(e => ({ value: e.name.toUpperCase(), viewValue: e.name.toUpperCase() }));
    }
  }
  addLinks(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      this.commonExpanses.push({ name: value.trim() });
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  removeLinks(fruit: any): void {
    const index = this.commonExpanses.indexOf(fruit);

    if (index >= 0) {
      this.commonExpanses.splice(index, 1);
    }
  }
  navigateToPath() {
    this.router.navigate(['/login']);
  }
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
  openDialog(action, obj) {
    obj.action = action;
    const dialogRef = this.matDialog.open(ManipulateComponent, {
      width: '250px',
      data: obj
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.event === 'Add') {
        // commonExpanses
        console.log('>>>>>>>result', result);
        this.commonExpanses = this.commonExpanses.map(e => {
          if (e.name === result.data.name) {
            e.amount = result.data.amount;
          }
          return e;
        });
      }
    });
  }

}
