import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { OrderService } from '@avs-ecosystem/services/order.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { AppSettingsService } from '@avs-ecosystem/services/app-settings.service';
import { NotificationService } from '@avs-ecosystem/services/notification-sevice';

@Component({
  selector: 'avs-dashboard-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class DashboardOrderDetailsComponent implements OnInit, OnChanges {

  @Input() currentOrderId;
  @Output() emitter: EventEmitter<string> = new EventEmitter<string>();
  public currentOrder: any;
  disableDownloadButton: boolean;
  editorContent: string;
  currentUser: any;
  animationState: string;

  public orderStatus: string;

  statuses: any[] = [
    { name: 'Opened', color: 'opened'},
    { name: 'In progress', color: 'inprogress'},
    { name: 'Ready', color: 'ready'},
    { name: 'Cancelled', color: 'cancelled'},
    { name: 'Closed', color: 'closed'}
  ];
  constructor(
    private settingService:  AppSettingsService,
    private orderService: OrderService,
    private notificationService: NotificationService,
    private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.disableDownloadButton = false;
    this.settingService.getCurentUser().subscribe(currentUser => {
      this.currentUser = currentUser;
    });
  }

  ngOnChanges (changes) {
    this.currentOrder = null;
    if (this.currentOrderId) {
      this.orderService.getById(this.currentOrderId).subscribe(order => {
        this.currentOrder = order;
        this.editorContent = this.currentOrder.description;
      });
    }
  }

  getOrderById (event) {
    this.emitter.emit('update');
  }

  deleteOrder(orderId) {
    this.orderService.deleteOrder(orderId).subscribe(result => {
      this.emitter.emit('update');
      this.notificationService.success('Order has been deleted!');
    }, (err) => {
      this.notificationService.error(`${_.get(err, 'statusText', 'Error')}, ${ _.get(err, 'error.message', '')}`);
    });
  }

  downloadInvoice(orderId) {
    this.disableDownloadButton = true;
    this.orderService.download(orderId).subscribe(response => {
      this.disableDownloadButton = false;
      const blob = new Blob([response], { type: 'application/pdf'});
      const url = window.URL.createObjectURL(blob);
      window.open(url);
      this.notificationService.success('Document is ready!');
    }, (err) => {
      this.notificationService.error(`${_.get(err, 'statusText', 'Error')}, ${ _.get(err, 'error.message', '')}`);
    });
  }

  emailToClient(orderId) {
    this.orderService.mail(orderId).subscribe(response => {
      this.notificationService.success('Email is sent');
    }, (err) => {
      this.notificationService.error(`${_.get(err, 'statusText', 'Error')}, ${ _.get(err, 'error.message', '')}`);
    });
  }

  saveStatus(state) {
    const order = {
      status: state,
      orderId: this.currentOrderId
    };

    this.orderService.saveStatus(order).subscribe(response => {
      this.emitter.emit('update');
      this.notificationService.success('Status has been updated!');
    }, (err) => {
      this.notificationService.error(`${_.get(err, 'statusText', 'Error')}, ${ _.get(err, 'error.message', '')}`);
    });
  }

  addOrderComment(comment) {
    const order = {
      description: comment,
      orderId: this.currentOrderId
    };
    this.orderService.comment(order).subscribe(response => {
      this.notificationService.success('Commend has been added!');
    }, (err) => {
      this.notificationService.error(`${_.get(err, 'statusText', 'Error')}, ${ _.get(err, 'error.message', '')}`);
    });
  }

  isAdmin() {
    if (this.currentUser && this.currentUser.role) {
      return this.currentUser.role === 'admin';
    }
    return false;
  }
}
