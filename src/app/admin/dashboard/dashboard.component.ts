import { Component, Directive, Input, OnInit, ViewChild } from '@angular/core';
import { Role } from 'src/app/models/role';
import { CommonService } from './../../services/common.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { ManipulateComponent } from '../delete-profile/manipulate.component';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  Role = Role;
  @ViewChild('deleteConfirmModal', { static: false }) deleteConfirmModal: any;
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  displayedColumns: string[] = ['USERNAME', 'EMAIL', 'ID', 'PHONE', 'ROLE', 'DOB', 'ACTION'];
  dataSource = [];
  message: any;
  id: any;
  adminId: any;
  // dataSource = ELEMENT_DATA;

  constructor(private commonService: CommonService, public matDialog: MatDialog) { }

  ngOnInit() {
    this.getAllProfile();
  }
  getAllProfile() {
    this.commonService.allProfile('getAllRecord').subscribe(res => {
      if (res) {
        this.dataSource = res.body.successData;
        this.dataSource.forEach(e => {
          e.ACTION = '';
          e.role = e.role === 1 ? 'Admin' : e.role === 2 ? 'Teacher' : e.role === 3 ? 'Student' : '-';
          if (e.isAdmin) {
            this.adminId = e._id;
          }
        });
      } else {
        this.dataSource = null;
      }
    });
  }
  deleteAProfile(id) {
    // this.openEditProfile();
    if (this.adminId === id) {
      this.message = 'You should not delete your own Profile';
      return;
    }
    this.message = '';
    const data = {
      _id: id
    };
    this.commonService.deleteAProfile('deleteARecord', data).subscribe(res => {
      if (res) {
        if (res.body.successData.deletedCount > 0) {
          this.message = res.body.message;
          this.getAllProfile();
        }
      }
    });
  }
  updateAProfile(data) {
    data.role = data.role === 'Admin' ? 1 : data.role === 'Teacher' ? 2 : data.role === 'Student' ? 3 : 0;
    this.commonService.updateAProfile('updateARecord', data).subscribe(res => {
      if (res) {
        this.getAllProfile();
        this.dataSource = res.body.successData;
        // this.dataSource.forEach(e => {
        //   e.ACTION = '';
        // });
      } else {
        this.dataSource = null;
      }
    });
  }
  // openEditProfile() {
  //   this.matDialog.open(ManipulateComponent);
  // }
  openDialog(action, obj, id) {
    obj.action = action;
    this.id = id;
    const dialogRef = this.matDialog.open(ManipulateComponent, {
      width: '250px',
      data: obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.event === 'Add') {
        this.addRowData(result.data);
      } else if (result.event === 'Update') {
        this.updateAProfile(result.data);
      } else if (result.event === 'Delete') {
        this.deleteAProfile(this.id);
        // this.deleteRowData(result.data);
      }
    });
  }
  addRowData(row_obj: any) {
    const d = new Date();
    this.dataSource.push({
      id: d.getTime(),
      name: row_obj.name
    });
    this.table.renderRows();

  }
  updateRowData(row_obj) {
    this.dataSource = this.dataSource.filter((value, key) => {
      if (value.id === row_obj.id) {
        value.name = row_obj.name;
      }
      return true;
    });
  }
  deleteRowData(row_obj) {
    this.dataSource = this.dataSource.filter((value, key) => {
      return value.id !== row_obj.id;
    });
  }
}

