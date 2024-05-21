import { getEmployeeById, getEmployeeIdsAndEmails } from "./azureClient";


export const getMissingEmployeeData= async (accessToken: string, employeeEmails: string[]) => {
    if (!accessToken) {
        throw new Error("Access token not found of no ");
    }
    try {
        const employees = await getEmployeeIdsAndEmails(accessToken);
        if (!employees) {
            throw new Error("Failed to get employee data");
        }
        
        const missingEmployees = employees.value.filter((employee) => {
            if (!employee.fields.Euricom_x0020_email) {
                return false;
            }
            return employeeEmails.includes(employee.fields.Euricom_x0020_email);
        }).map((employee) => employee.id);



        console.log("missingEmployees", missingEmployees);
        
        try {
            const missingEmployeeData =  await Promise.all((missingEmployees).map(async (missingEmployee) => {
                const employee = await getEmployeeById(accessToken, missingEmployee);
                if (!employee) {
                    throw new Error("Failed to get employee data");
                }     
                return employee;
            
            }));
            return missingEmployeeData;

        } catch (error) {
            console.error("Error in getMissingEmployeeData:", error);
        }


    } catch (error) {
        console.error("Error in getEmployeeIdsAndEmails:", error);
    }

}