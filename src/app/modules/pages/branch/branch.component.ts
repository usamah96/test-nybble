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
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent } from '@fuse/components/alert';
import { SharedService } from 'app/shared/service/shared.service';
import { Branch, BranchStatusType } from 'app/shared/types/shared.types';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Component({
    selector: 'branch',
    templateUrl: './branch.component.html',
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
        MatSelectModule,
    ],
})
export class BranchComponent implements OnInit {
    branches$: Observable<Branch[]>;
    branchStatuses: BranchStatusType[];
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    selectedBranch: Branch | null = null;
    branchForm: UntypedFormGroup;
    isDialogOpen: boolean = false;
    isLoading: boolean = false;
    showAlert: boolean = false;
    showButtonSpinner: boolean = false;
    isEditMode: boolean = false;
    idField: number = 2;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    branchesSubject = new BehaviorSubject<Branch[]>(null);

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private _sharedService: SharedService
    ) {}

    ngOnInit(): void {
        this.branchForm = this._formBuilder.group({
            id: [''],
            code: ['', [Validators.required]],
            shortName: ['', [Validators.required]],
            name: ['', [Validators.required]],
            addressOne: ['', Validators.required],
            addressTwo: ['', Validators.required],
            addressThree: [''],
            town: ['', Validators.required],
            postcode: ['', Validators.required],
            fax: [''],
            phone: ['', Validators.required],
            county: ['', Validators.required],
            country: ['', Validators.required],
            branchStatusEmail: [''],
            branchStatus: [null],
            branchStatusEmailBody: [''],
        });

        this.branchesSubject.next([
            {
                id: 1,
                code: 'ABC-123',
                shortName: 'Short Branch',
                name: 'My Branch',
                addressOne: 'Address Line 1',
                addressTwo: 'Address Line 2',
                addressThree: 'Address Line 3',
                town: 'Branch Town',
                postcode: 'Branch Post Code',
                fax: 'Branch Fax',
                phone: '+923310247880',
                county: 'Branch County',
                country: 'Branch Country',
            },
        ]);

        this.branchStatuses = [
            { id: 1, name: 'Outstanding' },
            { id: 2, name: 'Queried' },
            { id: 3, name: 'Authorized' },
            { id: 4, name: 'Part Paid' },
        ];

        this.branches$ = this.branchesSubject.asObservable();
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
        this.branchForm.reset();
        this.cleanUp();
    }

    cleanUp() {
        this.isDialogOpen = false;
        this.isEditMode = false;
        this.showButtonSpinner = false;
    }

    addOrEdit(id: number) {
        if (this.branchForm.invalid || this.showButtonSpinner) {
            return;
        }

        this.showButtonSpinner = true;
        setTimeout(() => {
            if (!this.isEditMode) {
                this.branchForm.value.id = this.idField++;
                this.branchesSubject.next([
                    ...this.branchesSubject.value,
                    this.branchForm.value,
                ]);
            } else {
                this.branchesSubject.value[id - 1] = this.branchForm.value;
            }

            this.branchForm.reset();
            this.cleanUp();
            this._changeDetectorRef.markForCheck();
        }, 2000);
    }

    edit(id: number) {
        this.isEditMode = true;
        const branch: Branch = this.branchesSubject.value[id - 1];

        this.branchForm.patchValue(branch);
        this.openDialog();
    }

    closeAlert() {
        this.showAlert = false;
    }
}
