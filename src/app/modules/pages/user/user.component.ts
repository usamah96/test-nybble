import { AsyncPipe, NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormControl,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
    MatRadioButton,
    MatRadioGroup,
    MatRadioModule,
} from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent } from '@fuse/components/alert';
import { FuseValidators } from '@fuse/validators';
import { DialogComponent } from 'app/shared/dialog/dialog.component';
import { SharedService } from 'app/shared/service/shared.service';
import {
    BranchSummary,
    CustomerSummary,
    User,
} from 'app/shared/types/shared.types';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        MatProgressBarModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatSortModule,
        MatPaginatorModule,
        NgClass,
        MatSelectModule,
        MatOptionModule,
        AsyncPipe,
        FuseAlertComponent,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatRadioButton,
        MatRadioGroup,
        MatTooltipModule,
    ],
})
export class UserComponent implements OnInit {
    users$: Observable<User[]>;
    branchSummary$: Observable<BranchSummary[]>;
    customerSummary$: Observable<CustomerSummary[]>;
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    selectedUser: User | null = null;
    userForm: UntypedFormGroup;
    isDialogOpen: boolean = false;
    isLoading: boolean = false;
    showAlert: boolean = false;
    showButtonSpinner: boolean = false;
    showBranchForm: boolean = false;
    showBranchList: boolean = true;
    showInvoiceCustomerForm: boolean = false;
    isEditMode: boolean = false;
    idField: number = 2;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    userSubject = new BehaviorSubject<User[]>(null);

    passwordPattern =
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])/;

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private _sharedService: SharedService,
        private _dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.userForm = this._formBuilder.group(
            {
                id: [''],
                name: ['', [Validators.required]],
                phone: ['', [Validators.required]],
                email: ['', [Validators.required, Validators.email]],
                password: [
                    '',
                    [
                        Validators.required,
                        Validators.minLength(7),
                        Validators.pattern(this.passwordPattern),
                    ],
                ],
                confirmPassword: ['', Validators.required],
                userType: ['', Validators.required],
                branches: [[]],
                allBranches: [false],
                sendInvoiceByEmail: [false],
                invoiceCustomers: [[]],
                invoiceEmail: [''],
            },
            {
                validators: FuseValidators.mustMatch(
                    'password',
                    'confirmPassword'
                ),
            }
        );

        this.userSubject.next([
            {
                id: 1,
                name: 'Test User',
                email: 'testuser@gmail.com',
                phone: '+925545023115',
                password: 'Test123#',
                isEmailConfirmed: true,
                isLocked: true,
                userType: 'internal-user',
                branches: [3],
                allBranches: false,
                sendInvoiceByEmail: false,
                invoiceCustomers: [],
                invoiceEmail: '',
            },
        ]);

        this.users$ = this.userSubject.asObservable();
        this.branchSummary$ = this._sharedService.branchSummary$;
        this.customerSummary$ = this._sharedService.customerSummary$;
        this.onFormChanges();
    }

    onFormChanges() {
        this.userForm
            .get('userType')
            .valueChanges.pipe(takeUntil(this._unsubscribeAll))
            .subscribe((value) => {
                if (!value) {
                    return;
                }

                if (value === 'admin' || value === 'internal-user') {
                    this.showBranchForm = true;
                    this.showBranchList = true;
                    this.showInvoiceCustomerForm = false;
                    this.userForm
                        .get('branches')
                        .setValidators([Validators.required]);

                    this.userForm.get('sendInvoiceByEmail').setValue(false);
                    this.userForm.get('invoiceCustomers').setValue([]);
                    this.userForm.get('invoiceEmail').setValue('');

                    this.userForm.get('invoiceCustomers').clearValidators();
                    this.userForm.get('invoiceEmail').clearValidators();
                } else if (value === 'customer') {
                    this.showBranchForm = false;
                    this.showBranchList = false;
                    this.showInvoiceCustomerForm = true;
                    this.userForm
                        .get('invoiceCustomers')
                        .setValidators([Validators.required]);
                    this.userForm
                        .get('invoiceEmail')
                        .setValidators([Validators.required]);

                    this.userForm.get('branches').setValue([]);
                    this.userForm.get('allBranches').setValue(false);

                    this.userForm.get('branches').clearValidators();
                }

                this.userForm.get('branches').updateValueAndValidity();
                this.userForm.get('invoiceCustomers').updateValueAndValidity();
                this.userForm.get('invoiceEmail').updateValueAndValidity();
            });

        this.userForm
            .get('allBranches')
            .valueChanges.pipe(takeUntil(this._unsubscribeAll))
            .subscribe((value) => {
                if (
                    this.userForm.get('userType').value !== 'customer' &&
                    !value
                ) {
                    this.userForm
                        .get('branches')
                        .setValidators([Validators.required]);
                    this.showBranchList = true;
                    return;
                } else if (this.userForm.get('userType').value !== 'customer') {
                    this.userForm.get('branches').setValue([]);
                    this.userForm.get('branches').clearValidators();
                    this.showBranchList = false;
                }
                this.userForm.get('branches').updateValueAndValidity();
            });
    }

    test(email: string, fullname: string, phone: string) {
        console.log(email, fullname, phone);
    }

    unblock() {
        const dialogRef = this._dialog.open(DialogComponent, {
            data: {
                title: 'Confirmation',
                content: 'Do you want to unlock this user?',
                actions: {
                    success: 'Yes',
                    cancel: 'No',
                },
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                console.log('User chose to unblock the user');
            } else {
                console.log('User chose not to unblock the user');
            }
        });
    }

    setPageFilter(ev) {
        this.isLoading = true;
        setTimeout(() => {
            this.isLoading = false;
            this._changeDetectorRef.markForCheck();
        }, 2000);
        console.log('Ev', ev);
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    openDialog() {
        this.isDialogOpen = true;
    }

    closeDialog() {
        this.userForm.reset();
        this.cleanUp();
    }

    cleanUp() {
        this.isDialogOpen = false;
        this.showBranchForm = false;
        this.showBranchList = true;
        this.showInvoiceCustomerForm = false;
        this.isEditMode = false;
        this.showButtonSpinner = false;
    }

    addOrEdit(id: number) {
        if (this.userForm.invalid || this.showButtonSpinner) {
            return;
        }

        this.showButtonSpinner = true;
        setTimeout(() => {
            if (!this.isEditMode) {
                this.userForm.value.id = this.idField++;
                this.userSubject.next([
                    ...this.userSubject.value,
                    this.userForm.value,
                ]);
            } else {
                this.userSubject.value[id - 1] = this.userForm.value;
            }

            this.userForm.reset();
            this.cleanUp();
            this._changeDetectorRef.markForCheck();
        }, 2000);
    }

    edit(id: number) {
        this.isEditMode = true;
        const user: User = this.userSubject.value[id - 1];

        this.userForm.patchValue({ ...user, confirmPassword: user.password });
        this.openDialog();
    }

    closeAlert() {
        this.showAlert = false;
    }
}
