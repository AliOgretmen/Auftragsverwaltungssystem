import {Sequelize} from 'sequelize-typescript';
import {AccessToken} from "./entities/AccessToken";
import {AuthorizationCode} from "./entities/AuthorizationCode";
import {Client} from "./entities/Client";
import {User} from "./entities/User";
import { Order } from './entities/Order';
import { OrderService } from './entities/OrderService';
import { Service } from './entities/Service';
import { Setting } from './entities/Setting';
import { Device } from './entities/Device';
import { DeviceModel } from './entities/DeviceModel';
import { Company } from './entities/Company';
import { Address } from './entities/Address';

export {Sequelize} from 'sequelize-typescript';
export {AccessToken} from "./entities/AccessToken";
export {AuthorizationCode} from "./entities/AuthorizationCode";
export {Client} from "./entities/Client";
export {User} from "./entities/User";

/**
 *  All models must be imported from this file or else they will not be registered with Sequelize
 */

export class Models {

    public sequelize: Sequelize;

    constructor(config: any) {
        this.sequelize = new Sequelize(config);
    }

    public initModels() {
        this.sequelize.addModels(this.getModels());
        return this.sequelize.sync({force: process.env.NODE_ENV === 'test'});
    }

    // TODO Scan models folder to build list
    private getModels() {
        return [
            AccessToken, AuthorizationCode, Client, User, Order, OrderService, Service, Setting, Device, DeviceModel, Company, Address
        ];
    }
}


