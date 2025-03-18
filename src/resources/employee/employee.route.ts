import { AppRoute } from "../../core/shared/route.route";
import { employeeController } from "./employee.controller";
import { EmployeeModel } from "./employee.model";

export class EmployeeRoute extends AppRoute<EmployeeModel> {
  constructor() {
    super(employeeController);
  }
}

export const employeeRouter = new EmployeeRoute().router;
