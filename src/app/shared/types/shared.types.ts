export interface LoginUser {
    id: number;
    email: string;
    name: string;
    userType: number;
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

export interface UserListContent {
    content: UserList[];
    totalElements: number;
    totalPages: number;
}

export interface BranchListContent {
    content: BranchList[];
    totalElements: number;
    totalPages: number;
}

export interface CustomerListContent {
    content: CustomerList[];
    totalElements: number;
    totalPages: number;
}

export interface UserList {
    userId: number;
    fullName: string;
    email: string;
    isLocked: boolean;
    phone: string;
    password: string;
    confirmPassword: string;
    userType: string;
    userTypeOrdinal: number;
    branchIds: [];
    invoiceCustomerIds: [];
    sendInvoiceByEmail: boolean;
    invoiceEmail: string;
}

export interface BranchList {
    branchId: number;
    code: string;
    shortName: string;
    name: string;
    address1: string;
    address2: string;
    address3: string;
    town: string;
    phone: string;
    county: string;
    country: string;
    postCode: string;
    fax: string;
    email: string;
    status: string;
    emailBody: string;
}

export interface BranchSummary {
    branchId: number;
    name: string;
}

export interface BranchStatusType {
    id: number;
    name: string;
}

export interface CustomerList {
    invoiceCustomerId: number;
    accountCode: string;
    shortName: string;
    name: string;
    address1: string;
    address2: string;
    address3: string;
    address4: string;
    address5: string;
    phone: string;
    postCode: string;
    sendInvoiceByEmail: boolean;
    invoiceEmail: string;
    contactName: string;
    contactPhone: string;
}

export interface CustomerSummary {
    id: number;
    name: string;
}

export interface DashboardResponse {
    totalBranches?: number;
    totalInvoiceCustomers?: number;
    totalUsers?: number;
    allInvoices?: number;
    outstandingInvoices?: number;
    queriedInvoices?: number;
    paidInvoices?: number;
    messageSent?: number;
    messageReceived?: number;
    totalCustomers?: number;
}
