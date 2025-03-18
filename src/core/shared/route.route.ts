import { Router } from "express";
import { BaseModel } from "./model.model";
import { AppController } from "./controller.controller";

export class AppRoute<Model extends BaseModel> {
  public router: Router;

  constructor(
    controller: AppController<Model>,
    additionalRoutes?: (additionalRouters: Router) => void
  ) {
    this.router = Router();
    this.initializeRoutes(controller);

    /* istanbul ignore next */
    if (additionalRoutes) {
      additionalRoutes(this.router);
    }
  }

  private initializeRoutes(controller: AppController<Model>) {
    // post

    this.router.post("/", controller.create);
    this.router.post("/bulk", controller.notImplementedYet);

    // get

    this.router.get("/", controller.read);
    this.router.get("/ids", controller.readByIds);
    this.router.post("/ids", controller.readByIds);
    this.router.get("/filter", controller.notImplementedYet);
    this.router.post("/filter", controller.notImplementedYet);
    this.router.get("/search", controller.notImplementedYet);
    this.router.post("/search", controller.notImplementedYet);

    // patch

    this.router.patch("/", controller.update);
    this.router.patch("/returning", controller.updateAndReturn);
    this.router.patch("/return", controller.updateAndReturn);
    this.router.patch("/update_and_find", controller.updateAndReturn);
    this.router.patch("/ids", controller.updateByIds);
    this.router.patch("/filter", controller.notImplementedYet);

    // delete

    this.router.delete("/", controller.delete);
    this.router.delete("/ids", controller.deleteByIds);
    this.router.delete("/permanently", controller.deletePermanently);
  }
}
