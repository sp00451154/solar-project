import { CommonService } from './common.service';
import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { Role } from '../models/role';

@Injectable()
export class AuthService {
  constructor( private commonService: CommonService) { }
  private user: User;
  isAuthorized() {
    return !!this.user;
  }

  hasRole(role: Role) {
    return this.isAuthorized() && this.user.Role === role;
  }

  login(role: Role) {
    this.user = { Role: role };
  }

  logout() {
    this.commonService.logout('logout').subscribe(res => {
      if (res && res.body.status) {
        this.user = null;
      }
      this.user = null;
    });
  }
}
