import { AppService } from "../../core/shared/service.service";
import { EmployeeModel } from "./employee.model";

export class EmployeeService extends AppService<EmployeeModel> {
  constructor() {
    super("employees");
  }
}

export const employeeService = new EmployeeService();
