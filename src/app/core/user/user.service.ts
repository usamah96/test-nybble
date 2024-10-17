import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LoginUser } from 'app/shared/types/shared.types';
import { map, Observable, ReplaySubject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _httpClient = inject(HttpClient);
    private _user: ReplaySubject<LoginUser> = new ReplaySubject<LoginUser>(1);

    set user(value: any) {
        this._user.next({
            id: value.userResponse.userId,
            name: value.userResponse.fullName,
            email: value.userResponse.email,
            userType: value.userResponse.userTypeOrdinal,
            roles: value.roles,
        });
    }

    get user$(): Observable<LoginUser> {
        return this._user.asObservable();
    }

    get(): Observable<LoginUser> {
        return this._httpClient.get<LoginUser>('api/common/user').pipe(
            tap((user) => {
                this._user.next(user);
            })
        );
    }

    update(user: LoginUser): Observable<any> {
        return this._httpClient
            .patch<LoginUser>('api/common/user', { user })
            .pipe(
                map((response) => {
                    this._user.next(response);
                })
            );
    }
}
