import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';

export const appRoutes: Route[] = [
    { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty',
        },
        children: [
            {
                path: 'forgot-password',
                loadChildren: () =>
                    import(
                        'app/modules/auth/forgot-password/forgot-password.routes'
                    ),
            },
            {
                path: 'reset-password',
                loadChildren: () =>
                    import(
                        'app/modules/auth/reset-password/reset-password.routes'
                    ),
            },
            {
                path: 'sign-in',
                loadChildren: () =>
                    import('app/modules/auth/sign-in/sign-in.routes'),
            },
        ],
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty',
        },
        children: [
            {
                path: 'change-password',
                loadChildren: () =>
                    import(
                        'app/modules/auth/change-password/change-password.routes'
                    ),
            },
        ],
    },

    // Pages routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver,
        },
        children: [
            {
                path: 'dashboard',
                data: { roles: ['ADMIN', 'INTERNAL_USER'] },
                loadChildren: () =>
                    import('app/modules/pages/dashboard/dashboard.routes'),
            },
            {
                path: 'user',
                data: { roles: ['ADMIN'] },
                loadChildren: () =>
                    import('app/modules/pages/user/user.routes'),
            },
            {
                path: 'branch',
                data: { roles: ['ADMIN'] },
                loadChildren: () =>
                    import('app/modules/pages/branch/branch.routes'),
            },
            {
                path: 'customer',
                data: { roles: ['ADMIN', 'INTERNAL_USER'] },
                loadChildren: () =>
                    import('app/modules/pages/customer/customer.routes'),
            },
            {
                path: 'not-found',
                loadChildren: () =>
                    import('app/modules/pages/not-found/not-found.routes'),
            },
        ],
    },
    { path: '**', redirectTo: 'not-found' },
];
