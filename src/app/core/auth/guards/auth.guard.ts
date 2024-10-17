import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { LoginUser, Role } from 'app/shared/types/shared.types';
import { of, switchMap } from 'rxjs';

export const AuthGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
    const router: Router = inject(Router);
    const authService: AuthService = inject(AuthService);
    const userService: UserService = inject(UserService);

    const expectedRoles: string[] = route.data.roles || [];

    return authService.check().pipe(
        switchMap((authenticated) => {
            if (!authenticated) {
                const redirectURL =
                    state.url === '/sign-out' ? '' : `redirectURL=${state.url}`;
                const urlTree = router.parseUrl(`sign-in?${redirectURL}`);

                return of(urlTree);
            }

            return userService.user$.pipe(
                switchMap((user: LoginUser) => {
                    const isRoleValid = user.roles.some((r: Role) => {
                        return (
                            expectedRoles.length === 0 ||
                            expectedRoles.includes(r.roleName)
                        );
                    });
                    if (isRoleValid) {
                        return of(true);
                    }
                    return of(router.parseUrl('not-found'));
                })
            );
        })
    );
};
