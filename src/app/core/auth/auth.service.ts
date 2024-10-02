import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { catchError, Observable, of, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);

    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    set userInfo(userInfo: string) {
        localStorage.setItem('userInfo', userInfo);
    }

    get userInfo(): string {
        return localStorage.getItem('userInfo') ?? '';
    }

    forgotPassword(data: { username: string }): Observable<any> {
        return this._httpClient.post(
            'http://localhost:9500/public/auth/request-new-password',
            data
        );
    }

    resetPassword(data: { password: string; code: string }): Observable<any> {
        return this._httpClient.patch(
            'http://localhost:9500/public/auth/reset-password',
            data
        );
    }

    changePassword(data: {
        email: string;
        oldPassword: string;
        newPassword: string;
    }): Observable<any> {
        return this._httpClient.put(
            'http://localhost:9500/auth/change-password',
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
            .post('http://localhost:9500/auth/login', null, {
                headers,
                observe: 'response',
            })
            .pipe(
                switchMap((response: any) => {
                    this.accessToken = response.headers.get('Authorization');
                    this.userInfo = JSON.stringify(response.body);

                    this._authenticated = true;
                    this._userService.user = response.body;

                    return of(response);
                })
            );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        // Sign in using the token
        return this._httpClient
            .post('api/auth/sign-in-with-token', {
                accessToken: this.accessToken,
            })
            .pipe(
                catchError(() =>
                    // Return false
                    of(false)
                ),
                switchMap((response: any) => {
                    // Replace the access token with the new one if it's available on
                    // the response object.
                    //
                    // This is an added optional step for better security. Once you sign
                    // in using the token, you should generate a new one on the server
                    // side and attach it to the response object. Then the following
                    // piece of code can replace the token with the refreshed one.
                    if (response.accessToken) {
                        this.accessToken = response.accessToken;
                    }

                    // Set the authenticated flag to true
                    this._authenticated = true;

                    // Store the user on the user service
                    this._userService.user = response.user;

                    // Return true
                    return of(true);
                })
            );
    }

    signOut(): Observable<any> {
        return this._httpClient
            .post('http://localhost:9500/auth/logout', null)
            .pipe(
                switchMap(() => {
                    this.clearSession();
                    return of(true);
                })
            );
    }

    clearSession() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userInfo');

        this._authenticated = false;
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: {
        name: string;
        email: string;
        password: string;
        company: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: {
        email: string;
        password: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // Check if the user is logged in
        if (this._authenticated) {
            return of(true);
        }

        // Check the access token availability
        if (!this.accessToken || !this.userInfo) {
            return of(false);
        }

        // Check the access token expire date
        if (AuthUtils.isTokenExpired(this.accessToken)) {
            return of(false);
        }

        // If the access token exists, and it didn't expire, sign in using it
        // return this.signInUsingToken();
        this._authenticated = true;
        this._userService.user = JSON.parse(this.userInfo);

        return of(true);
    }
}
