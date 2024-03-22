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
      Job_x0020_title: string;
      Level: string;
      Status: string;
      Contract_x0020_Substatus: string;
    }
}