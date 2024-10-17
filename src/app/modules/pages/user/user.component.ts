import { AsyncPipe, NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    ViewChild,
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
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
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
import { FeedbackDialogComponent } from 'app/shared/feedback-dialog/feedback-dialog.component';
import { SharedService } from 'app/shared/service/shared.service';
import {
    BranchSummary,
    CustomerSummary,
    User,
    UserList,
    UserListContent,
} from 'app/shared/types/shared.types';
import { BehaviorSubject, Subject, finalize, takeUntil } from 'rxjs';

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
    @ViewChild(MatPaginator) paginator: MatPaginator;

    userListContent: UserListContent[] = [];
    users: UserList[] = [];
    branchSummaries: BranchSummary[] = [];
    filteredBranchSummaries: BranchSummary[] = [];
    customerSummaries: CustomerSummary[] = [];
    filterCustomerSummaries: CustomerSummary[] = [];
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    selectedUser: User | null = null;
    userForm: UntypedFormGroup;
    isDialogOpen: boolean = false;
    isLoading: boolean = false;
    showButtonSpinner: boolean = false;
    showBranchForm: boolean = false;
    showBranchList: boolean = true;
    showInvoiceCustomerForm: boolean = false;
    isEditMode: boolean = false;
    showErrorAlert: boolean = false;
    showSuccessAlert: boolean = false;
    responseMessage: string = '';
    idField: number = 2;
    pageNumber: number = 1;
    pageIndex: number = 1;
    pageSize: number = 10;
    totalElements: number = 0;
    filterPayload: any = {
        email: null,
        phone: null,
        fullName: null,
        islocked: null,
    };
    userType: any = {
        'internal-user': 0,
        customer: 1,
        admin: 2,
    };

    userTypeReverse: any = {
        0: 'internal-user',
        1: 'customer',
        2: 'admin',
    };

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    userSubject = new BehaviorSubject<User[]>(null);

    passwordPattern =
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])/;

    phonePattern = /^\+[0-9]{11,14}$/;

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private _sharedService: SharedService,
        private _dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.userForm = this._formBuilder.group(
            {
                userId: [null],
                fullName: ['', [Validators.required]],
                phone: [
                    '',
                    [
                        Validators.required,
                        Validators.minLength(11),
                        Validators.maxLength(14),
                        Validators.pattern(this.phonePattern),
                    ],
                ],
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
                branchIds: [[]],
                allBranches: [false],
                sendInvoiceByEmail: [false],
                invoiceCustomerIds: [[]],
                invoiceEmail: [''],
            },
            {
                validators: FuseValidators.mustMatch(
                    'password',
                    'confirmPassword'
                ),
            }
        );

        this.loadFilteredUsers(this.pageNumber, this.pageSize);
        this.loadBranches();
        this.loadCustomers();
        this.onFormChanges();
    }

    loadBranches() {
        this._sharedService.branchNameSummary
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((res: BranchSummary[]) => {
                this.branchSummaries = this.filteredBranchSummaries = res;
            });
    }

    loadCustomers() {
        this._sharedService.customerNameSummary
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((res: CustomerSummary[]) => {
                this.customerSummaries = this.filterCustomerSummaries = res;
            });
    }

    loadFilteredUsers(pageNumber: number, pageSize: number) {
        this.isLoading = true;

        this._sharedService
            .listFiltered('user', pageNumber, pageSize, this.filterPayload)
            .pipe(
                takeUntil(this._unsubscribeAll),
                finalize(() => {
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                })
            )
            .subscribe(
                (res: UserListContent) => {
                    this.users = res.content;
                    this.totalElements = res.totalElements;
                },
                (err) => {
                    this.users = [];
                }
            );
    }

    branchSearch(value) {
        console.log(value);
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
                        .get('branchIds')
                        .setValidators([Validators.required]);

                    this.userForm.get('sendInvoiceByEmail').setValue(false);
                    this.userForm.get('invoiceCustomerIds').setValue([]);
                    this.userForm.get('invoiceEmail').setValue('');

                    this.userForm.get('invoiceCustomerIds').clearValidators();
                    this.userForm.get('invoiceEmail').clearValidators();
                } else if (value === 'customer') {
                    this.showBranchForm = false;
                    this.showBranchList = false;
                    this.showInvoiceCustomerForm = true;
                    this.userForm
                        .get('invoiceCustomerIds')
                        .setValidators([Validators.required]);
                    this.userForm
                        .get('invoiceEmail')
                        .setValidators([Validators.required]);

                    this.userForm.get('branchIds').setValue([]);
                    this.userForm.get('allBranches').setValue(false);

                    this.userForm.get('branchIds').clearValidators();
                }

                this.userForm.get('branchIds').updateValueAndValidity();
                this.userForm
                    .get('invoiceCustomerIds')
                    .updateValueAndValidity();
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
                        .get('branchIds')
                        .setValidators([Validators.required]);
                    this.showBranchList = true;
                    return;
                } else if (this.userForm.get('userType').value !== 'customer') {
                    this.userForm.get('branchIds').setValue([]);
                    this.userForm.get('branchIds').clearValidators();
                    this.showBranchList = false;
                }
                this.userForm.get('branchIds').updateValueAndValidity();
            });
    }

    applyFilter(
        email: string,
        fullName: string,
        phone: string,
        islocked: string
    ) {
        this.paginator.firstPage();

        this.filterPayload = {
            email: email === '' ? null : email,
            fullName: fullName === '' ? null : fullName,
            phone: phone === '' ? null : phone,
            islocked: islocked === '' ? null : islocked,
        };
        this.loadFilteredUsers(this.pageNumber, this.pageSize);
    }

    unlock(id: number) {
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
            if (!result) {
                return;
            }

            this._sharedService
                .patch('user', `unlocked/${id}`)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(
                    (res) => {
                        this._dialog
                            .open(FeedbackDialogComponent, {
                                width: '400px',
                                height: '310px',
                                data: {
                                    title: 'Success',
                                    message: 'User Unlocked Successfuly',
                                    type: 'success',
                                },
                            })
                            .afterClosed()
                            .subscribe((_) => {
                                this.paginator.firstPage();
                                this.loadFilteredUsers(
                                    this.pageNumber,
                                    this.pageSize
                                );
                            });
                    },
                    (err) => {
                        this._dialog.open(FeedbackDialogComponent, {
                            width: '400px',
                            height: '310px',
                            data: {
                                title: 'Error',
                                message:
                                    'An Error Occurred While Unlocking User',
                                type: 'error',
                            },
                        });
                    }
                );
        });
    }

    filterBranchSummary(ev) {
        ev.stopPropagation();

        this.filteredBranchSummaries = this.branchSummaries.filter((b) =>
            b.name.toLowerCase().includes(ev.target.value.toLowerCase())
        );
    }

    filterCustomerSummary(ev) {
        ev.stopPropagation();

        this.filterCustomerSummaries = this.customerSummaries.filter((c) =>
            c.name.toLowerCase().includes(ev.target.value.toLowerCase())
        );
    }

    setPageFilter(ev) {
        this.pageSize = ev.pageSize;
        this.loadFilteredUsers(ev.pageIndex + 1, ev.pageSize);
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
        this.isLoading = false;
        this.isDialogOpen = false;
        this.showBranchForm = false;
        this.showBranchList = true;
        this.showInvoiceCustomerForm = false;
        this.isEditMode = false;
        this.showButtonSpinner = false;
        this.showSuccessAlert = false;
        this.showErrorAlert = false;
        this.responseMessage = '';
    }

    getAllBranchIdsIfApplicable(allBranches: boolean, selectedIds: number[]) {
        if (!allBranches) {
            return selectedIds;
        } else {
            return this.branchSummaries.map((item) => item.branchId);
        }
    }

    addOrEdit(id: number) {
        if (this.userForm.invalid || this.showButtonSpinner) {
            return;
        }
        const obj = {
            ...this.userForm.value,
            userType: this.userType[this.userForm.get('userType').value],
            branchIds: this.getAllBranchIdsIfApplicable(
                this.userForm.get('allBranches').value,
                this.userForm.get('branchIds').value
            ),
        };
        this.showButtonSpinner = true;

        let resposneMsg;
        let req;
        if (!id) {
            req = this._sharedService.post('user', 'create', obj);
            resposneMsg = 'User Created Successfuly';
        } else {
            req = this._sharedService.put('user', `update/${id}`, obj);
            resposneMsg = 'User Updated Successfuly';
        }

        req.pipe(
            takeUntil(this._unsubscribeAll),
            finalize(() => {
                this.showButtonSpinner = false;
                this._changeDetectorRef.markForCheck();
            })
        ).subscribe(
            (_) => {
                this.showSuccessAlert = false;
                this.showErrorAlert = false;
                this.isDialogOpen = false;
                this._dialog
                    .open(FeedbackDialogComponent, {
                        width: '400px',
                        height: '310px',
                        data: {
                            title: 'Success',
                            message: resposneMsg,
                            type: 'success',
                        },
                    })
                    .afterClosed()
                    .subscribe((_) => {
                        this.paginator.firstPage();
                        this.loadFilteredUsers(this.pageNumber, this.pageSize);
                    });
            },
            (err) => {
                this.showSuccessAlert = false;
                this.showErrorAlert = true;
                this.responseMessage =
                    err.error?.message || 'Unexpected Error Occurred';
            }
        );
    }

    edit(id: number) {
        this.isLoading = true;
        this.isEditMode = true;

        this._sharedService
            .get('user', `get/${id}`)
            .pipe(
                takeUntil(this._unsubscribeAll),
                finalize(() => {
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                })
            )
            .subscribe(
                (res: UserList) => {
                    this.userForm.patchValue({
                        ...res,
                        userType: this.userTypeReverse[res.userTypeOrdinal],
                    });
                    this.openDialog();

                    this.userForm.get('password').clearValidators();
                    this.userForm.get('confirmPassword').clearValidators();
                    this.userForm.get('email').clearValidators();

                    this.userForm.get('password').updateValueAndValidity();
                    this.userForm
                        .get('confirmPassword')
                        .updateValueAndValidity();
                    this.userForm.get('email').updateValueAndValidity();
                },
                (_) => {
                    this._dialog.open(FeedbackDialogComponent, {
                        width: '400px',
                        height: '310px',
                        data: {
                            title: 'Success',
                            message: 'Unable To Fetch User Data',
                            type: 'error',
                        },
                    });
                }
            );
    }

    closeAlert() {
        this.showErrorAlert = false;
        this.showSuccessAlert = false;
        this.responseMessage = '';
    }
}
