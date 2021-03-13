import { Component,Directive,Input, OnInit, ViewChild } from '@angular/core';
import { Role } from 'src/app/models/role';
import { CommonService } from './../../services/common.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  Role = Role;
  @ViewChild('deleteConfirmModal', {static: false}) deleteConfirmModal: any;
  displayedColumns: string[] = [ 'USERNAME', 'EMAIL', 'ID', 'ACTION'];
  dataSource = [];
  message: any;
  // dataSource = ELEMENT_DATA;

  constructor(private commonService: CommonService) { }

  ngOnInit() {
    this.getAllProfile();
  }
  getAllProfile() {
    this.commonService.allProfile('getAllRecord').subscribe(res => {
      if (res ) {
        this.dataSource = res.body.successData;
        this.dataSource.forEach(e => {
          e.ACTION = '';
        });
      } else {
        this.dataSource = null;
      }
    });
  }
  deleteAProfile(id) {
    this.openProxyErrorMsgModel();
    this.message = '';
    const data = {
      _id : id
    };
    this.commonService.deleteAProfile('deleteARecord', data).subscribe(res => {
      if (res ) {
        if(res.body.successData.deletedCount > 0) {
          this.message = res.body.message;
        }
      }
    });
  }
  updateAProfile() {
    this.commonService.updateAProfile('updateARecord').subscribe(res => {
      if (res ) {
        this.dataSource = res.body.successData;
        this.dataSource.forEach(e => {
          e.ACTION = '';
        });
      } else {
        this.dataSource = null;
      }
    });
  }
  openProxyErrorMsgModel() {
    this.deleteConfirmModal.show();
  }

}
