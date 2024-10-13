export interface LoginUser {
    id: number;
    email: string;
    name: string;
    roles: [Role];
}

export interface Role {
    id: number;
    roleName: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    isLocked: boolean;
    isEmailConfirmed: boolean;
    phone: string;
    type?: string;
    password?: string;
    userType: 'admin' | 'internal-user' | 'customer';
    branches?: number[];
    allBranches: false;
    sendInvoiceByEmail: false;
    invoiceEmail?: string;
    invoiceCustomers?: number[];
}

export interface Branch {
    id: number;
    code: string;
    shortName: string;
    name: string;
    addressOne: string;
    addressTwo: string;
    addressThree: string;
    town: string;
    phone: string;
    county: string;
    country: string;
    postcode: string;
    fax: string;
}

export interface BranchSummary {
    id: number;
    code: string;
}

export interface BranchStatusType {
    id: number;
    name: string;
}

export interface Customer {
    id: number;
    accountCode: string;
    shortName: string;
    name: string;
    addressOne: string;
    addressTwo: string;
    addressThree: string;
    addressFour: string;
    addressFive: string;
    phone: string;
    postcode: string;
    sendInvoiceByEmail: boolean;
    invoiceEmail: string;
    contactName: string;
    contactPhone: string;
}

export interface CustomerSummary {
    id: number;
    name: string;
}
