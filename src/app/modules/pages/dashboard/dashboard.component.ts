import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { UserService } from 'app/core/user/user.service';
import { SharedService } from 'app/shared/service/shared.service';
import {
    DashboardResponse,
    LoginUser,
    Role,
} from 'app/shared/types/shared.types';
import { Subject, finalize, takeUntil } from 'rxjs';

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [MatMenuModule],
})
export class DashboardComponent implements OnInit, OnDestroy {
    user: LoginUser;
    dashboardResponse: DashboardResponse;
    selectedProject: string = 'Trevor Iles - Service Only Contract (S6420)';
    userType: any = {
        0: 'internal/user',
        1: 'customer',
        2: 'admin',
    };

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _userService: UserService,
        private _sharedService: SharedService,
        private _changeDetectorRef: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.loadUser();
    }

    loadUser() {
        this._userService.user$
            .pipe(
                takeUntil(this._unsubscribeAll),
                finalize(() => {
                    this._changeDetectorRef.markForCheck();
                })
            )
            .subscribe((user: LoginUser) => {
                this.user = user;
                this.loadDashboardResponse(this.userType[user.userType]);
            });
    }

    loadDashboardResponse(role) {
        this._sharedService
            .get('dashboard', role)
            .pipe(
                takeUntil(this._unsubscribeAll),
                finalize(() => {
                    this._changeDetectorRef.markForCheck();
                })
            )
            .subscribe(
                (res: DashboardResponse) => {
                    this.dashboardResponse = res;
                },
                (_) => {
                    this.dashboardResponse = {
                        totalBranches: 0,
                        totalInvoiceCustomers: 0,
                        totalUsers: 0,
                    };
                }
            );
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    isRoleValid(roleNames: [string]) {
        return this.user?.roles.some((r: Role) =>
            roleNames.includes(r.roleName)
        );
    }
}
