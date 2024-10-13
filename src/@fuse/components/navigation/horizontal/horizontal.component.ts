import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    ViewEncapsulation,
    inject,
} from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseNavigationItem } from '@fuse/components/navigation/navigation.types';
import { FuseUtilsService } from '@fuse/services/utils/utils.service';
import { UserService } from 'app/core/user/user.service';
import { LoginUser, Role } from 'app/shared/types/shared.types';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';
import { FuseHorizontalNavigationBasicItemComponent } from './components/basic/basic.component';
import { FuseHorizontalNavigationBranchItemComponent } from './components/branch/branch.component';
import { FuseHorizontalNavigationSpacerItemComponent } from './components/spacer/spacer.component';

@Component({
    selector: 'fuse-horizontal-navigation',
    templateUrl: './horizontal.component.html',
    styleUrls: ['./horizontal.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'fuseHorizontalNavigation',
    standalone: true,
    imports: [
        FuseHorizontalNavigationBasicItemComponent,
        FuseHorizontalNavigationBranchItemComponent,
        FuseHorizontalNavigationSpacerItemComponent,
    ],
})
export class FuseHorizontalNavigationComponent
    implements OnChanges, OnInit, OnDestroy
{
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _fuseNavigationService = inject(FuseNavigationService);
    private _fuseUtilsService = inject(FuseUtilsService);
    private _userService = inject(UserService);

    @Input() name: string = this._fuseUtilsService.randomId();
    @Input() navigation: FuseNavigationItem[];

    user: LoginUser;
    onRefreshed: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    ngOnChanges(changes: SimpleChanges): void {
        if ('navigation' in changes) {
            this._changeDetectorRef.markForCheck();
        }
    }

    ngOnInit(): void {
        if (this.name === '') {
            this.name = this._fuseUtilsService.randomId();
        }

        this._fuseNavigationService.registerComponent(this.name, this);

        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: LoginUser) => {
                this.user = user;
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this._fuseNavigationService.deregisterComponent(this.name);

        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    refresh(): void {
        this._changeDetectorRef.markForCheck();
        this.onRefreshed.next(true);
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    isRoleValid(roleNames: [string]) {
        return this.user.roles.some((r: Role) =>
            roleNames.includes(r.roleName)
        );
    }
}
