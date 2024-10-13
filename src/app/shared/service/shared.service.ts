import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BranchSummary } from '../types/shared.types';
import { CustomerSummary } from './../types/shared.types';

@Injectable({ providedIn: 'root' })
export class SharedService {
    private branchSummary: BehaviorSubject<BranchSummary[] | null> =
        new BehaviorSubject([]);

    private customerSummary: BehaviorSubject<CustomerSummary[] | null> =
        new BehaviorSubject([]);

    private defaultBranches: BranchSummary[] = [
        {
            id: 1,
            code: 'ABC-123',
        },
        {
            id: 2,
            code: 'ABC-124',
        },
        {
            id: 3,
            code: 'DEF-456',
        },
    ];

    private defaultCustomers: CustomerSummary[] = [
        {
            id: 1,
            name: 'Customer 1',
        },
        {
            id: 2,
            name: 'Customer 2',
        },
        {
            id: 3,
            name: 'Customer 3',
        },
    ];

    get branchSummary$(): Observable<BranchSummary[]> {
        if (this.branchSummary.value.length == 0) {
            this.branchSummary.next(this.defaultBranches);
        }
        return this.branchSummary.asObservable();
    }

    get customerSummary$(): Observable<CustomerSummary[]> {
        if (this.customerSummary.value.length == 0) {
            this.customerSummary.next(this.defaultCustomers);
        }
        return this.customerSummary.asObservable();
    }
}
