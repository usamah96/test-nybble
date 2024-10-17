import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    ViewEncapsulation,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';

@Component({
    selector: 'feedback-dialog',
    templateUrl: './feedback-dialog.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    standalone: true,
    imports: [MatDialogModule],
})
export class FeedbackDialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: {
            title: string;
            message: string;
            type: string;
        }
    ) {}
}
