import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandlerFn,
    HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { Observable, catchError, throwError } from 'rxjs';

/**
 * Intercept
 *
 * @param req
 * @param next
 */
export const authInterceptor = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);

    let newReq = req.clone();

    const isLoginOrPublicRequest =
        req.url.endsWith('/login') || req.url.includes('/public');

    if (
        !isLoginOrPublicRequest &&
        authService.accessToken &&
        !AuthUtils.isTokenExpired(authService.accessToken)
    ) {
        newReq = req.clone({
            headers: req.headers.set(
                'Authorization',
                'Bearer ' + authService.accessToken
            ),
        });
    }

    return next(newReq).pipe(
        catchError((error) => {
            if (
                !isLoginOrPublicRequest &&
                error instanceof HttpErrorResponse &&
                error.status === 401
            ) {
                authService.clearSession();
                location.reload();
            }

            return throwError(error);
        })
    );
};
