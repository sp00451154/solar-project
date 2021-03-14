import { Component, Directive, Input, OnInit, ViewChild, Inject, Optional } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface UsersData {
  userName: string;
  email: string;
  id: string;
}

@Component({
  selector: 'app-manipulate',
  templateUrl: './manipulate.component.html',
  styleUrls: ['./manipulate.component.css']
})

export class ManipulateComponent implements OnInit {
  action: string;
  local_data: any;
  constructor(
    public dialogRef: MatDialogRef<ManipulateComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: UsersData) {
    console.log(data);
    this.local_data = { ...data };
    this.action = this.local_data.action;
  }

  ngOnInit() {
  }
  doAction() {
    this.dialogRef.close({ event: this.action, data: this.local_data });
  }

  closeDialog() {
    this.dialogRef.close({ event: 'Cancel' });
  }
}
