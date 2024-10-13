import { HttpErrorResponse } from '@angular/common/http';
import {
    ChangeDetectorRef,
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { FuseValidators } from '@fuse/validators';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { LoginUser } from 'app/shared/types/shared.types';
import { Subject, finalize, takeUntil } from 'rxjs';

@Component({
    selector: 'auth-change-password',
    templateUrl: './change-password.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        FuseAlertComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        RouterLink,
    ],
})
export class AuthChangePasswordComponent implements OnInit {
    @ViewChild('changePasswordNgForm') changePasswordNgForm: NgForm;

    passwordPattern =
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])/;
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    changePasswordForm: UntypedFormGroup;
    showAlert: boolean = false;
    showForm: boolean = true;
    user: LoginUser;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _authService: AuthService,
        private _userService: UserService,
        private _formBuilder: UntypedFormBuilder,
        private _changeDetectorRef: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: LoginUser) => {
                this.user = user;
                this._changeDetectorRef.markForCheck();
            });

        this.changePasswordForm = this._formBuilder.group(
            {
                oldPassword: ['', Validators.required],
                password: [
                    '',
                    [
                        Validators.required,
                        Validators.minLength(7),
                        Validators.pattern(this.passwordPattern),
                    ],
                ],
                passwordConfirm: ['', Validators.required],
            },
            {
                validators: FuseValidators.mustMatch(
                    'password',
                    'passwordConfirm'
                ),
            }
        );
    }

    changePassword(): void {
        if (this.changePasswordForm.invalid) {
            return;
        }

        this.changePasswordForm.disable();
        this.showAlert = false;

        this._authService
            .changePassword({
                email: this.user.email,
                oldPassword: this.changePasswordForm.value.oldPassword,
                newPassword: this.changePasswordForm.value.password,
            })
            .pipe(
                takeUntil(this._unsubscribeAll),
                finalize(() => {
                    this.showAlert = true;
                })
            )
            .subscribe(
                () => {
                    this.alert = {
                        type: 'success',
                        message: 'Your password has been changed',
                    };
                    this.showForm = false;
                },
                (err: HttpErrorResponse) => {
                    this.alert = {
                        type: 'error',
                        message:
                            err?.error?.message || 'Unexpected Error Occurred',
                    };
                    this.changePasswordForm.enable();
                }
            );
    }
}
