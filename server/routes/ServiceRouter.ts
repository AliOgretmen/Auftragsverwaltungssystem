import * as express from "express";
import {Service} from "../models/entities/Service";
import {Auth} from "../auth/auth";
import {ServiceManager} from "../managers/ServiceManager";

export class ServiceRouter {

    public router: express.Router;
    private serviceManager: ServiceManager;


    constructor() {
        this.serviceManager = new ServiceManager();
        this.router = express.Router();
        this.buildRoutes();
    }

    public async get(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            const services = await Service.findAll<Service>();
            res.json(services);
        } catch(error) {
            next(error);
        }
    }

    public async getById(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            const service = await Service.findOne<Service>({ where: {serviceId: req.params.id} });
            res.json(service);
        } catch(error) {
            next(error);
        }
    }

    public async getAllByModelId(req: express.Request, res: express.Response, next: express.NextFunction) {
      try {
        const service = await Service.findAll<Service>({ where: {modelId: req.params.modelId} });
          res.json(service);
      } catch(error) {
          next(error);
      }
  }

    public async post(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            const newService = await this.serviceManager.createService(req.body, req.params.modelId);
            res.json(newService);
        } catch(error) {
            next(error);
        }
    }

    public async put(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            const updatedService = await this.serviceManager.updateService(req.body);
            res.json(updatedService);
        } catch(error) {
            next(error);
        }
    }

    public async delete(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            const service = this.serviceManager.deleteService(req.params.id);
            res.json(service);
        } catch(error) {
            next(error);
        }
    }

    private buildRoutes() {
        this.router.get("/", Auth.getBearerMiddleware(), this.get.bind(this));
        this.router.get("/:id", Auth.getBearerMiddleware(), this.getById.bind(this));
        this.router.get("/getAllByModelId/:modelId", Auth.getBearerMiddleware(), this.getAllByModelId.bind(this));
        this.router.post("/:modelId", Auth.getBearerMiddleware(), this.post.bind(this));
        this.router.put("/:id", Auth.getBearerMiddleware(), this.put.bind(this));
        this.router.delete("/:id", Auth.getBearerMiddleware(), this.delete.bind(this));
    }

}
