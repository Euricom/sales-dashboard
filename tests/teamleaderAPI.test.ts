// import { expect, test } from "@playwright/test";
// import type { DealResponse } from "~/server/api/routers/teamleader/types";


// test.describe("Teamleader API test", () => {
//     test("get deals data", async ({ page }) => {
//         const authFile = "playwright/.auth/user.json"; // Replace "/path/to/authFile" with the actual file path
//         const storageState = await page.context().storageState({ path: authFile });
//         console.log(storageState);
//         const access_token_cookie = storageState.cookies.find((cookie) => cookie.name === 'access_token');
//         //console.log(access_token_cookie);

//         const response = await fetch('https://api.focus.teamleader.eu/deals.list', {
//             headers: {
//                 Authorization: `Bearer ${access_token_cookie?.value}`,
//         }});
//         //console.log(response);
//         expect(response.status).toBe(200);
//         const data: DealResponse = await response.json() as DealResponse;
//         expect(data).toHaveProperty('data');
//         expect(data.data).toBeInstanceOf(Array);
//     });
// });

