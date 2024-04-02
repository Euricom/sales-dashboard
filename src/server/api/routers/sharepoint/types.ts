export interface User {
  email: string;
  id: string;
  displayName: string;
}

export interface CreatedBy {
  user: User;
}

export interface SharePointContact {
  "@odata.etag": string;
  createdDateTime: string;
  eTag: string;
  id: string;
  lastModifiedDateTime: string;
  webUrl: string;
  createdBy: CreatedBy;
  value : SharePointEmployee[];
}

export interface SharePointEmployee {
    id: string;
    fields: {
      Title: string;
      City: string;
      Euricom_x0020_email: string;
      Job_x0020_title: string;
      Level: string;
      Status: string;
      Contract_x0020_Substatus: string;
    }
}

export interface SharePointEmployeeWithAvatar {
  id: string;
    fields: {
      Title: string;
      City: string;
      Euricom_x0020_email: string;
      Job_x0020_title: string;
      Level: string;
      Status: string;
      Contract_x0020_Substatus: string;
      avatar: string | null;
    }  
}

export interface batchResponse {
  id: string;
  status: number;
  headers: {
    "Cache-Control": string;
    "Content-Type": string;
    ETag: string;
  };
  body: string;
}

export interface batchRequestResponse {
  responses: batchResponse[];
}
