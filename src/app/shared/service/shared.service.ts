import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { BranchSummary } from '../types/shared.types';
import { CustomerSummary } from './../types/shared.types';

@Injectable({ providedIn: 'root' })
export class SharedService {
    baseUrl: string = 'http://invoiceportal.nybble.co.uk:9500/api/';
    headers: any = {
        'Content-Type': 'application/json',
    };

    private branchSummary: BehaviorSubject<BranchSummary[] | []> =
        new BehaviorSubject([]);

    private customerSummary: BehaviorSubject<CustomerSummary[] | null> =
        new BehaviorSubject([]);

    private _httpClient = inject(HttpClient);

    listFiltered(
        module: string,
        pageNumber: number,
        pageSize: number,
        data
    ): Observable<any> {
        return this._httpClient.post(
            `${this.baseUrl}${module}/list/filtered/${pageNumber}/${pageSize}`,
            data,
            { headers: this.headers }
        );
    }

    post(module: string, path: string, data): Observable<any> {
        return this._httpClient.post(`${this.baseUrl}${module}/${path}`, data, {
            headers: this.headers,
        });
    }

    put(module: string, path: string, data): Observable<any> {
        return this._httpClient.put(`${this.baseUrl}${module}/${path}`, data, {
            headers: this.headers,
        });
    }

    patch(module: string, path: string): Observable<any> {
        return this._httpClient.patch(`${this.baseUrl}${module}/${path}`, {
            headers: this.headers,
        });
    }

    get(module: string, path: string): Observable<any> {
        return this._httpClient.get(`${this.baseUrl}${module}/${path}`, {
            headers: this.headers,
        });
    }

    nameSummary(module: string): Observable<any> {
        return this._httpClient
            .get(`${this.baseUrl}${module}/name-summary`, {
                headers: this.headers,
            })
            .pipe(
                tap((res: any[]) => {
                    if (module === 'branch') {
                        this.branchNameSummary = res;
                    } else if (module === 'invoice/customer') {
                        this.customerNameSummary = res;
                    }
                }),
                catchError(() => {
                    return of([]);
                })
            );
    }

    set branchNameSummary(res: BranchSummary[]) {
        this.branchSummary.next(res);
    }

    set customerNameSummary(res: CustomerSummary[]) {
        this.customerSummary.next(res);
    }

    get branchNameSummary(): Observable<BranchSummary[]> {
        return this.branchSummary.asObservable();
    }

    get customerNameSummary(): Observable<CustomerSummary[]> {
        return this.customerSummary.asObservable();
    }
}
