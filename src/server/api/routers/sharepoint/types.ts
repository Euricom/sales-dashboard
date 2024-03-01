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
}
