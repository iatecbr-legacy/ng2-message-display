import { Component, Input, Output, EventEmitter } from '@angular/core';

import { MessageDisplayData } from './message-display.interface';

/**
 * A MessageDisplay component shows message with title and close button.
 */
@Component({
    selector: 'message-display',
    styleUrls: [
       './message-display.component.css'
    ],
    template: `
        <div class="message-display" [ngClass]="[messageDisplay.type, messageDisplay.theme]">
            <div *ngIf="messageDisplay.showClose" class="close-button" (click)="close($event)"></div>
            <div *ngIf="messageDisplay.title || messageDisplay.msg" class="message-display-text">
                <span *ngIf="messageDisplay.title" class="message-display-title">{{messageDisplay.title}}</span>
                <br *ngIf="messageDisplay.title && messageDisplay.msg" />
                <span *ngIf="messageDisplay.msg" class="message-display-msg" [innerHTML]="messageDisplay.msg"></span>
            </div>
        </div>`
})

export class MessageDisplayComponent {

    @Input() messageDisplay: MessageDisplayData;
    @Output() closeMessage = new EventEmitter();

    /**
     * Event handler invokes when user clicks on close button.
     * This method emit new event into MessageDisplayComponent to close it.
     */
    close($event: any) {
        $event.preventDefault();
        this.closeMessage.next(this.messageDisplay);
    }
}