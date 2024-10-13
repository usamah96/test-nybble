import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
    selector: 'app-modal-form',
    templateUrl: './modal.component.html',
    standalone: true,
    imports: [MatFormFieldModule, FormsModule, MatDialogModule],
})
export class ModalComponent {}
