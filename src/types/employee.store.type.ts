export interface IEmployee {
  id: string;
  name: string;
  phone: string;
  password?: string;
  createdAt: string;
}

export interface IEmployeeStore {
  employees: IEmployee[];
  addEmployee: (employee: IEmployee) => void;
  removeEmployee: (id: string) => void;
  updateEmployee: (id: string, employee: Partial<IEmployee>) => void;
}
