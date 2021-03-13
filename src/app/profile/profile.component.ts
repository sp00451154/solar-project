import { Component, OnInit } from '@angular/core';
import { Role } from '../models/role';
import { CommonService } from '../services/common.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent implements OnInit {
  Role = Role;
  displayedColumns: string[] = [ 'userName', 'email', 'id'];
  dataSource = [];
  // dataSource = ELEMENT_DATA;

  constructor(private commonService: CommonService) { }

  ngOnInit() {
    this.getOwnProfile();
  }
  getOwnProfile() {
    this.commonService.ownProfile('ownProfile').subscribe(res => {
      if (res ) {
        this.dataSource = [res.body];
      } else {
        this.dataSource = null;
      }
    });
  }

}
