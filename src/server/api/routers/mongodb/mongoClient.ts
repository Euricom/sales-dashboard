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

// export default async function handler(req, res) {
//   const client = new MongoClient(env.DATABASE_URL);

//   await client.connect();
//   const db = client.db();

//   switch (req.method) {
//     case 'GET':
//         const employees = await db.collection('Employee').find({}).toArray();
//         res.status(200).json(employees);
//         break;
//     case 'POST':
//         const newEmployee = req.body;
//         const postResult = await db.collection('Employee').insertOne(newEmployee);
//         res.status(201).json(postResult);
//         break;
//     case 'PUT':
//         const {id, ...employee} = req.body;
//         const putResult = await db.collection('Employee').updateOne({id}, {$set: employee});
//         res.status(200).json(putResult);
//         break;
//     case 'DELETE':
//         const deleteResult = await db.collection('Employee').deleteOne({id: req.body.id});
//         res.status(200).json(deleteResult);
//         break;
//     default:
//         res.status(405).json({ error: 'Unsupported HTTP method' });
//   }

//     await client.close();
// }
