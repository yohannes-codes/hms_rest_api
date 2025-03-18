import { AppController } from "../../core/shared/controller.controller";
import { EmployeeModel } from "./employee.model";
import { employeeService } from "./employee.service";

export class EmployeeController extends AppController<EmployeeModel> {
  constructor() {
    super("employees", employeeService, EmployeeModel.fromUserRequestFn);
  }
}

export const employeeController = new EmployeeController();
