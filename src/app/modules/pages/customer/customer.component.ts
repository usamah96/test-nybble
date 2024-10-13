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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent } from '@fuse/components/alert';
import { SharedService } from 'app/shared/service/shared.service';
import { Branch, Customer } from 'app/shared/types/shared.types';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

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
    customer$: Observable<Customer[]>;
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    selectedCustomer: Customer | null = null;
    customerForm: UntypedFormGroup;
    isDialogOpen: boolean = false;
    isLoading: boolean = false;
    showAlert: boolean = false;
    showButtonSpinner: boolean = false;
    isEditMode: boolean = false;
    idField: number = 2;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    customerSubject = new BehaviorSubject<Customer[]>(null);

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private _sharedService: SharedService
    ) {}

    ngOnInit(): void {
        this.customerForm = this._formBuilder.group({
            id: [''],
            shortName: ['', [Validators.required]],
            accountCode: ['', [Validators.required]],
            name: ['', [Validators.required]],
            addressOne: ['', Validators.required],
            addressTwo: [''],
            addressThree: [''],
            addressFour: [''],
            addressFive: [''],
            contactName: ['', Validators.required],
            postcode: ['', Validators.required],
            contactPhone: ['', [Validators.required]],
            phone: ['', Validators.required],
            sendInvoiceByEmail: [false, Validators.required],
            invoiceEmail: ['', [Validators.required]],
        });

        this.customerSubject.next([
            {
                id: 1,
                accountCode: 'ABC-123',
                shortName: 'Customer Short Name',
                name: 'Test Customer',
                addressOne: 'Address Line 1',
                addressTwo: 'Address Line 2',
                addressThree: 'Address Line 3',
                addressFour: 'Address Line 4',
                addressFive: 'Address Line 5',
                postcode: 'Customer Post Code',
                phone: '+923310247880',
                sendInvoiceByEmail: true,
                invoiceEmail: 'test@nybble.co.uk',
                contactName: 'Test Contact',
                contactPhone: 'Test Contact Phone',
            },
        ]);

        this.customer$ = this.customerSubject.asObservable();
    }

    setPageFilter(ev) {
        this.isLoading = true;
        setTimeout(() => {
            this.isLoading = false;
            this._changeDetectorRef.markForCheck();
        }, 2000);
        console.log('Ev', ev);
    }

    trackByFn(index: number, item: Branch): any {
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
        this.isDialogOpen = false;
        this.isEditMode = false;
        this.showButtonSpinner = false;
    }

    addOrEdit(id: number) {
        if (this.customerForm.invalid || this.showButtonSpinner) {
            return;
        }

        this.showButtonSpinner = true;
        setTimeout(() => {
            if (!this.isEditMode) {
                this.customerForm.value.id = this.idField++;
                this.customerSubject.next([
                    ...this.customerSubject.value,
                    this.customerForm.value,
                ]);
            } else {
                this.customerSubject.value[id - 1] = this.customerForm.value;
            }

            this.customerForm.reset();
            this.cleanUp();
            this._changeDetectorRef.markForCheck();
        }, 2000);
    }

    edit(id: number) {
        this.isEditMode = true;
        const customer: Customer = this.customerSubject.value[id - 1];

        this.customerForm.patchValue(customer);
        this.openDialog();
    }

    closeAlert() {
        this.showAlert = false;
    }
}
