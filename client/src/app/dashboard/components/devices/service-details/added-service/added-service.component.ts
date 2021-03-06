import { Component, OnInit, Input } from '@angular/core';
import { Service } from '@avs-ecosystem/models/Service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { DashboardDeviceServiceComponent } from '../device-service.component';
import { DeviceServiceType } from '@avs-ecosystem/services/device-service-type.service';
import { AppSettingsService } from '@avs-ecosystem/services/app-settings.service';
import { NotificationService } from '@avs-ecosystem/services/notification-sevice';

@Component({
  selector: 'avs-added-service',
  templateUrl: './added-service.component.html',
  styleUrls: ['./added-service.component.scss']
})
export class DashboardDeviceServiceExtraComponent implements OnInit {

  currentUser: any;

  public serviceForm: FormGroup;
  @Input() service: Service;
  constructor(private deviceServiceType: DeviceServiceType,
    private parent: DashboardDeviceServiceComponent,
    private notificationService: NotificationService,
    private fb: FormBuilder,
    private settingService: AppSettingsService) {

  }

  ngOnInit() {
    this.setServiceForm();
    this.settingService.getCurentUser().subscribe(currentUser => {
      this.currentUser = currentUser;
    });
  }

  setServiceForm() {
    this.serviceForm = this.fb.group({
      serviceName: [this.service.serviceName, [Validators.required]],
      price: [this.service.price, [Validators.required]]
    });
  }

  updateService() {
    if (this.serviceForm.valid && this.service.serviceId) {
      const service = this.serviceForm.value;
      service.serviceId = this.service.serviceId;
      this.deviceServiceType.update(service).subscribe(result => {
        this.parent.getAllServices();
      }, (err) => {
        this.notificationService.error(`${_.get(err, 'statusText', 'Error')}, ${_.get(err, 'error.message', '')}`);
      });
    }
  }

  deleteService() {
    if (this.serviceForm.valid && this.service.serviceId) {
      this.deviceServiceType.delete(this.service.serviceId).subscribe(() => {
        this.parent.getAllServices();
      }, (err) => {
        this.notificationService.error(`${_.get(err, 'statusText', 'Error')}, ${_.get(err, 'error.message', '')}`);
      });
    }
  }

  isAdmin() {
    if (this.currentUser && this.currentUser.role) {
      return this.currentUser.role === 'admin';
    }
    return false;
  }
}
