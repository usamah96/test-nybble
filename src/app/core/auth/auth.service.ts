import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { catchError, Observable, of, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _authenticated: boolean = false;
    private baseUrl: string = 'http://invoiceportal.nybble.co.uk:9500';

    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);

    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    forgotPassword(data: { username: string }): Observable<any> {
        return this._httpClient.post(
            `${this.baseUrl}/public/auth/request-new-password`,
            data
        );
    }

    resetPassword(data: { password: string; code: string }): Observable<any> {
        return this._httpClient.patch(
            `${this.baseUrl}/public/auth/reset-password`,
            data
        );
    }

    changePassword(data: {
        email: string;
        oldPassword: string;
        newPassword: string;
    }): Observable<any> {
        return this._httpClient.put(
            `${this.baseUrl}/auth/change-password`,
            data
        );
    }

    signIn(credentials: { email: string; password: string }): Observable<any> {
        const base64EncodedCredentials =
            'Basic ' + btoa(credentials.email + ':' + credentials.password);

        const headers = {
            Authorization: base64EncodedCredentials,
        };

        return this._httpClient
            .post(`${this.baseUrl}/auth/login`, null, {
                headers,
                observe: 'response',
            })
            .pipe(
                switchMap((response: any) => {
                    this.accessToken = response.headers.get('Authorization');

                    this._authenticated = true;
                    this._userService.user = response.body;

                    return of(response);
                })
            );
    }

    signInUsingToken(): Observable<any> {
        return this._httpClient
            .get(`${this.baseUrl}/api/user/get`, {
                observe: 'response',
            })
            .pipe(
                catchError(() => of(false)),
                switchMap((response: any) => {
                    if (!response.body) {
                        return of(false);
                    }
                    this._authenticated = true;
                    this._userService.user = response.body;

                    return of(true);
                })
            );
    }

    signOut(): Observable<any> {
        return this._httpClient.post(`${this.baseUrl}/auth/logout`, null).pipe(
            switchMap(() => {
                this.clearSession();
                return of(true);
            })
        );
    }

    clearSession() {
        localStorage.removeItem('accessToken');
        this._authenticated = false;
    }

    check(): Observable<boolean> {
        if (this._authenticated) {
            return of(true);
        }

        if (!this.accessToken) {
            return of(false);
        }

        if (AuthUtils.isTokenExpired(this.accessToken)) {
            return of(false);
        }

        return this.signInUsingToken();
    }
}
