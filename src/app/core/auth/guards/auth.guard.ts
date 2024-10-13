import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { LoginUser, Role } from 'app/shared/types/shared.types';
import { of, switchMap } from 'rxjs';

export const AuthGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
    const router: Router = inject(Router);
    const authService: AuthService = inject(AuthService);

    const expectedRoles: string[] = route.data.roles || [];
    const loginUserInfo: string = authService.userInfo;
    const loginUser: LoginUser =
        loginUserInfo && JSON.parse(authService.userInfo);

    const isRoleValid =
        loginUser &&
        loginUser.roles.some((r: Role) => {
            return (
                expectedRoles.length === 0 || expectedRoles.includes(r.roleName)
            );
        });

    if (!isRoleValid) {
        const urlTree = router.parseUrl(`not-found`);
        return of(urlTree);
    }

    return authService.check().pipe(
        switchMap((authenticated) => {
            if (!authenticated) {
                const redirectURL =
                    state.url === '/sign-out' ? '' : `redirectURL=${state.url}`;
                const urlTree = router.parseUrl(`sign-in?${redirectURL}`);

                return of(urlTree);
            }

            return of(true);
        })
    );
};
