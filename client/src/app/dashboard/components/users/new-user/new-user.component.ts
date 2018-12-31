import {Component, OnInit, OnChanges, Input, EventEmitter, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import * as _ from 'lodash';
import { UserService } from '@avs-ecosystem/services/user.service';
import { AddressService } from '@avs-ecosystem/services/address.service';
import { Router } from '@angular/router';


@Component({
  selector: 'avs-dashboard-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.scss']
})
export class DashboardNewUserComponent implements OnInit {
  public userForm: FormGroup;
  user: any;
  isUserSubmitted: boolean;

  constructor(private fb: FormBuilder,
    private router: Router,
    private addressService: AddressService,
    private userService: UserService) {
  }

  ngOnInit() {
    this.isUserSubmitted = false;
    this.setUserForm();
  }

  setUserForm() {
    this.userForm = this.fb.group({
      isActive: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      password: ['', [Validators.required]],
      repassword: ['', [Validators.required]],
      role: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  public submitUserForm() {
      this.createUser();
  }

  get isActive() {
    return this.userForm.get('isActive');
  }

  private createUser() {
    this.isUserSubmitted = false;
    if (this.userForm.valid) {
      this.userService.createUser(this.userForm.value)
        .subscribe(result => {
          this.isUserSubmitted = true;
          this.user = result;
          // this.router.navigate(['/', 'dashboard', 'users', 'list']);
        }, err => console.log('Err from user submit', err));
    }
  }
}
