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
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent } from '@fuse/components/alert';
import { FeedbackDialogComponent } from 'app/shared/feedback-dialog/feedback-dialog.component';
import { SharedService } from 'app/shared/service/shared.service';
import {
    CustomerList,
    CustomerListContent,
} from 'app/shared/types/shared.types';
import { Subject, finalize, takeUntil } from 'rxjs';

@Component({
    selector: 'customer',
    templateUrl: './customer.component.html',
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
        AsyncPipe,
        FuseAlertComponent,
        MatProgressSpinnerModule,
    ],
})
export class CustomerComponent implements OnInit {
    @ViewChild(MatPaginator) paginator: MatPaginator;

    customerListContent: CustomerListContent[] = [];
    customers: CustomerList[] = [];
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    customerForm: UntypedFormGroup;
    isDialogOpen: boolean = false;
    isLoading: boolean = false;
    showAlert: boolean = false;
    showButtonSpinner: boolean = false;
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
        accountCode: null,
        name: null,
        invoiceEmail: null,
        contactName: null,
    };

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    phonePattern = /^\+[0-9]{11,14}$/;

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private _sharedService: SharedService,
        private _dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.customerForm = this._formBuilder.group({
            invoiceCustomerId: [null],
            shortName: ['', [Validators.required]],
            accountCode: ['', [Validators.required]],
            name: ['', [Validators.required]],
            address1: ['', Validators.required],
            address2: [''],
            address3: [''],
            address4: [''],
            address5: [''],
            contactName: ['', Validators.required],
            postCode: ['', Validators.required],
            contactPhone: [
                '',
                [
                    Validators.required,
                    Validators.minLength(11),
                    Validators.maxLength(14),
                    Validators.pattern(this.phonePattern),
                ],
            ],
            phone: [
                '',
                [
                    Validators.required,
                    Validators.minLength(11),
                    Validators.maxLength(14),
                    Validators.pattern(this.phonePattern),
                ],
            ],
            sendInvoiceByEmail: [false, Validators.required],
            invoiceEmail: ['', [Validators.required, Validators.email]],
        });

        this.loadFilteredCustomers(this.pageNumber, this.pageSize);
    }

    loadFilteredCustomers(pageNumber: number, pageSize: number) {
        this.isLoading = true;

        this._sharedService
            .listFiltered(
                'invoice/customer',
                pageNumber,
                pageSize,
                this.filterPayload
            )
            .pipe(
                takeUntil(this._unsubscribeAll),
                finalize(() => {
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                })
            )
            .subscribe(
                (res: CustomerListContent) => {
                    this.customers = res.content;
                    this.totalElements = res.totalElements;
                },
                (err) => {
                    this.customers = [];
                    this.totalElements = 0;
                }
            );
    }

    setPageFilter(ev) {
        this.pageSize = ev.pageSize;
        this.loadFilteredCustomers(ev.pageIndex + 1, ev.pageSize);
    }

    applyFilter(
        accountCode: string,
        name: string,
        invoiceEmail: string,
        contactName: string
    ) {
        this.paginator.firstPage();

        this.filterPayload = {
            accountCode: accountCode === '' ? null : accountCode,
            invoiceEmail: invoiceEmail === '' ? null : invoiceEmail,
            contactName: contactName === '' ? null : contactName,
            name: name === '' ? null : name,
        };
        this.loadFilteredCustomers(this.pageNumber, this.pageSize);
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    openDialog() {
        this.isDialogOpen = true;
    }

    closeDialog() {
        this.customerForm.reset();
        this.cleanUp();
    }

    cleanUp() {
        this.isLoading = false;
        this.isDialogOpen = false;
        this.isEditMode = false;
        this.showButtonSpinner = false;
        this.showSuccessAlert = false;
        this.showErrorAlert = false;
        this.responseMessage = '';
    }

    addOrEdit(id: number) {
        if (this.customerForm.invalid || this.showButtonSpinner) {
            return;
        }

        this.showButtonSpinner = true;

        let req;
        let resposneMsg;
        if (!id) {
            req = this._sharedService.post(
                'invoice/customer',
                'create',
                this.customerForm.value
            );
            resposneMsg = 'Customer Created Successfuly';
        } else {
            req = this._sharedService.put(
                'invoice/customer',
                `update/${id}`,
                this.customerForm.value
            );
            resposneMsg = 'Customer Updated Successfuly';
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
                        this.loadFilteredCustomers(
                            this.pageNumber,
                            this.pageSize
                        );
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

    edit(customer: CustomerList) {
        this.isLoading = true;
        this.isEditMode = true;

        this._sharedService
            .get('invoice/customer', `get/${customer.invoiceCustomerId}`)
            .pipe(
                takeUntil(this._unsubscribeAll),
                finalize(() => {
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                })
            )
            .subscribe(
                (res: CustomerList) => {
                    this.customerForm.patchValue(res);
                    this.openDialog();
                },
                (_) => {
                    this._dialog.open(FeedbackDialogComponent, {
                        width: '400px',
                        height: '310px',
                        data: {
                            title: 'Success',
                            message: 'Unable To Fetch Customer Data',
                            type: 'error',
                        },
                    });
                }
            );
    }

    closeAlert() {
        this.showErrorAlert = false;
        this.showSuccessAlert = false;
    }
}
