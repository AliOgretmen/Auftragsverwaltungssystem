import * as express from "express";
import * as nodemailer from "nodemailer";
import { Order } from "../models/entities/Order";
import { Auth } from "../auth/auth";
import { OrderManager } from "../managers/OrderManager";
import * as _ from 'lodash';
import {Roles} from "../auth/roles";
import { Client } from "../models/entities/Client";
import * as pdf from 'html-pdf';
import * as moment from 'moment';
import { Address } from "models/entities/Address";

export class OrderRouter {

  public router: express.Router;
  private orderManager: OrderManager;


  constructor() {
    this.orderManager = new OrderManager();
    this.router = express.Router();
    this.buildRoutes();
  }

  public async get(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      const orders = await Order.findAll<Order>(
        {
          include: [Client],
          order: [
            ['creationDate', 'DESC']
          ]
        }
      );
      const filteredOrders = orders.filter((order) => {
        return _.get(order, 'client.dataValues.isActive', false) === true;
      });

      res.json(filteredOrders);
    } catch (error) {
      next(error);
    }
  }

  public async getById(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      const order = await this.orderManager.findById(req.params.id);
      res.json(order);
    } catch (error) {
      next(error);
    }
  }

  public async post(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      const newOrder = await this.orderManager.createOrder(req);
      res.json(newOrder);
    } catch (error) {
      next(error);
    }
  }

  public async setStatus(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      const order = await Order.findOne<Order>({ where: { orderId: req.body.orderId }});
      if(order) {
        order.status = req.body.status;
        res.json(await order.save());
      }
    } catch (error) {
      next(error);
    }
  }

  public async changeContactaddress(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      const order = await Order.findOne<Order>({ where: { orderId: req.body.orderId }});
      if(order) {
        order.billingAddressId = req.body.billingAddressId || order.billingAddressId;
        order.deliveryAddressId = req.body.deliveryAddressId || order.deliveryAddressId;
        res.json(await order.save());
      }
    } catch (error) {
      next(error);
    }
  }

  public async updateDeliveryDate(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      const order = await Order.findOne<Order>({ where: { orderId: req.body.orderId }});
      if(order) {
        order.deliveryDate = req.body.date;
        res.json(await order.save());
      }
    } catch (error) {
      next(error);
    }
  }

  public async comment(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      const order = await Order.findOne<Order>({ where: { orderId: req.body.orderId }});
      if(order) {
        order.description = req.body.description;
        res.json(await order.save());
      }
    } catch (error) {
      next(error);
    }
  }

  public async put(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      const updatedOrder = await this.orderManager.updateOrder(
        req.params.id, req.body);
      res.json(updatedOrder);
    } catch (error) {
      next(error);
    }
  }

  public async delete(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      const order = await this.orderManager.deleteOrder(req.params.id);
      res.json(order);
    } catch (error) {
      next(error);
    }
  }

  public async mail(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      let order = await this.orderManager.findById(req.params.id);
      order = _.set(order, 'deliveryDate', moment(new Date(order.deliveryDate)).format('YYYY-MM-DD'));
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'auftragpro@gmail.com',
          pass: 'auftrag123pro'
        }
      });

      res.render('pdfs/order', { order: order }, function (err, html) {
        const mailOptions = {
          from: 'auftragpro@gmail.com',
          to: _.get(order, 'client.email'),
          subject: `AVS - Your order status: ${order.status}`,
          html: html,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            throw new Error(`Could not send Email ${error}`);
          } else {
            res.status(200).send(`Email is sent successfully, ${info}`);
          }
        });
      });
      res.status(200).json({message: 'Email successfully sent!'});
    } catch (error) {
      next(error);
    }
  }

  public async download(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      let order = await this.orderManager.findById(req.params.id);
      order = _.set(order, 'deliveryDate', moment(new Date(order.deliveryDate)).format('YYYY-MM-DD'));
      res.render('pdfs/order', { order: order }, function (err, html) {
        if (err) {
          throw new Error(`could not render pdf file, err: ${err}`);
        }
        pdf.create(html, { format: 'Letter' }).toStream(function (err, stream) {
          res.setHeader('Content-type', 'application/pdf');
          stream.pipe(res);
        });
      });
    } catch (error) {
      next(error);
    }
  }

  public async search(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      const serachResults = await this.orderManager.searchByText(req, res, next);
      res.status(200).send(serachResults);
    } catch (error) {
      next(error);
    }
  }

  private buildRoutes() {
    this.router.get("/", Auth.getBearerMiddleware(), Roles.connectRoles.can('everyone'), this.get.bind(this));
    this.router.get("/:id", Auth.getBearerMiddleware(), Roles.connectRoles.can('everyone'), this.getById.bind(this));
    this.router.post("/", Auth.getBearerMiddleware(), Roles.connectRoles.can('everyone'), this.post.bind(this));
    this.router.post("/status", Auth.getBearerMiddleware(), Roles.connectRoles.can('everyone'), this.setStatus.bind(this));
    this.router.post("/changeContactaddress", Auth.getBearerMiddleware(), Roles.connectRoles.can('everyone'), this.changeContactaddress.bind(this));
    this.router.post("/updateDeliveryDate", Auth.getBearerMiddleware(), Roles.connectRoles.can('everyone'), this.updateDeliveryDate.bind(this));
    this.router.post("/comment", Auth.getBearerMiddleware(), Roles.connectRoles.can('everyone'), this.comment.bind(this));
    this.router.put("/:id", Auth.getBearerMiddleware(), Roles.connectRoles.can('everyone'), this.put.bind(this));
    this.router.delete("/:id", Auth.getBearerMiddleware(), Roles.connectRoles.can('admin'), this.delete.bind(this));
    this.router.get("/download/:id", Auth.getBearerMiddleware(), Roles.connectRoles.can('everyone'), this.download.bind(this));
    this.router.get("/search/:text", Auth.getBearerMiddleware(), Roles.connectRoles.can('everyone'), this.search.bind(this));
    this.router.post("/mail/:id", Auth.getBearerMiddleware(), Roles.connectRoles.can('everyone'), this.mail.bind(this));
  }

}
