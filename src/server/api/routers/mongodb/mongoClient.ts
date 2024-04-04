import { env } from "~/env";
import { MongoClient } from "mongodb";
import type { EmployeeFromDB } from "~/lib/types";
import { getAllEmployeeData as getAllEmployeeDataFromSharepoint } from "../sharepoint/azureClient";

export const getEmployeesFromDB = async () => {
  const client = new MongoClient(env.DATABASE_URL);
  const db = client.db();
  try {
    await client.connect();

    const employees = await db
      .collection<EmployeeFromDB>("Employee")
      .find({})
      .toArray();
    return employees;
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
};

export const createEmployee = async (newEmployee: EmployeeFromDB) => {
  const client = new MongoClient(env.DATABASE_URL);
  const db = client.db();
  try {
    await client.connect();
    // console.log(newEmployee);
    const postResult = await db.collection("Employee").insertOne(newEmployee);
    return postResult;
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
};

// Uses getEmployeesFromDB and createEmployee
export const getInitialEmployees = async () => {
  // fetch employees from sharepoint
  const employeesFromSharepoint = await getAllEmployeeDataFromSharepoint();
  if (!employeesFromSharepoint) return "No employees found from SharePoint.";
  // fetch employees from db
  const employeesFromDb = await getEmployeesFromDB();
  if (!employeesFromDb) return "No employees found in the database.";
  // find all missing employees in the db
  const missingEmployees = employeesFromSharepoint.filter(
    (sharepointEmployee) => {
      // if db is empty, all employees are missing, so fill the db with all employees from sharepoint
      if (employeesFromDb.length === 0) return true;
      // if db is not empty, check if sharepoint employee is in db, if not, add to missing employees (should work but not tested yet)
      employeesFromDb.some((dbEmployee) => {
        dbEmployee.employeeId === sharepointEmployee.id;
      });
    },
  );

  // if there are missing employees, create missing employees in the db
  if (missingEmployees.length) {
    for (const employeeFromSharepoint of missingEmployees) {
      await createEmployee({
        employeeId: employeeFromSharepoint.id,
        rows: ["0"],
      });
    }
  }

  // return db employees with fields from sharepoint
  return employeesFromDb.map((employeeDb) => {
    const employeeFromSharepoint = employeesFromSharepoint.find(
      (e) => e.id === employeeDb.employeeId,
    );
    return {
      employeeId: employeeDb?.employeeId,
      rows: employeeDb.rows, // Assuming default row is ["0"]
      fields: employeeFromSharepoint?.fields,
    };
  });
};

export const updateEmployee = async (employee: EmployeeFromDB) => {
  const client = new MongoClient(env.DATABASE_URL);
  const db = client.db();
  try {
    await client.connect();
    await db
      .collection("Employee")
      .updateOne(
        { employeeId: employee.employeeId },
        { $set: { rows: employee.rows } },
      );
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
};
