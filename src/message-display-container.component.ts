import { Component, Input, OnInit } from '@angular/core';

import { isFunction } from './message-display.utils';
import { MessageDisplayService, MessageDisplayConfig } from './message-display.service';
import { MessageDisplayData } from './message-display.interface';

/**
 * MessageDisplay is container for MessageDisplay components
 */
@Component({
    selector: 'message-display-container',
    styleUrls: [
       './message-display-container.component.css'
    ],
    template: `
    <div id="message-display-container" [ngClass]="[position]">
        <message-display *ngFor="let message of messages" [messageDisplay]="message" (closeMessage)="closeMessageDisplay(message)"></message-display>
    </div>`
})

export class MessageDisplayContainerComponent implements OnInit {
    /**
     * Set of constants defins position of Message on the page.
     */
    static POSITIONS: Array<String> = ['bottom-right', 'bottom-left', 'top-right', 'top-left', 'top-center', 'bottom-center', 'center-center'];

    private _position: string = '';
    // The window position where the message pops up. Possible values:
    // - bottom-right (default value from MessageDisplayConfig)
    // - bottom-left
    // - top-right
    // - top-left
    // - top-center
    // - bottom-center
    // - center-center
    @Input() set position(value: string) {
        if (value) {
            let notFound = true;
            for (let i = 0; i < MessageDisplayContainerComponent.POSITIONS.length; i++) {
                if (MessageDisplayContainerComponent.POSITIONS[i] === value) {
                    notFound = false;
                    break;
                }
            }
            if (notFound) {
                // Position was wrong - clear it here to use the one from config.
                value = this.config.position;
            }
        } else {
            value = this.config.position;
        }
        this._position = 'message-position-' + value;
    }

    get position(): string {
        return this._position;
    }

    // The storage for messages.
    messages: Array<MessageDisplayData> = [];

    constructor(private config: MessageDisplayConfig, private messageDisplayService: MessageDisplayService) {
        // Initialise position
        this.position = '';
    }

    /**
     * `ngOnInit` is called right after the directive's data-bound properties have been checked for the
     * first time, and before any of its children have been checked. It is invoked only once when the
     * directive is instantiated.
     */
    ngOnInit(): any {
        // We listen our service to recieve new messages from it
        this.messageDisplayService.getMessages().subscribe((message: MessageDisplayData) => {
            // If we've gone over our limit, remove the earliest
            // one from the array
            if (this.messages.length >= this.config.limit) {
                this.messages.shift();
            }
            // Add message to array
            this.messages.push(message);
            //
            // If there's a timeout individually or globally,
            // set the message to timeout
            if (message.timeout) {
                this._setTimeout(message);
            }
        });
        // We listen clear all comes from service here.
        this.messageDisplayService.getClear().subscribe((id: number) => {
            if (id) {
                this.clear(id);
                return;
            }
            // Lets clear all messages
            this.clearAll();
        });
    }

    /**
     * Event listener of 'closeMessageDisplay' event comes from MessageDisplay.
     * This method removes ToastComponent assosiated with this Toast.
     */
    closeMessageDisplay(message: MessageDisplayData) {
        this.clear(message.id);
    }

    /**
     * Clear individual message by id
     * @param id is unique identifier of Toast
     */
    clear(id: number) {
        if (id) {
            this.messages.forEach((value: any, key: number) => {
                if (value.id === id) {
                    if (value.onRemove && isFunction(value.onRemove)) {
                        value.onRemove.call(this, value);
                    }
                    this.messages.splice(key, 1);
                }
            });
        } else {
            throw new Error('Please provide id of Toast to close');
        }
    }

    /**
     * Clear all messages
     */
    clearAll() {
        this.messages.forEach((value: any, key: number) => {
            if (value.onRemove && isFunction(value.onRemove)) {
                value.onRemove.call(this, value);
            }
        });
        this.messages = [];
    }

    /**
     * Custom setTimeout function for specific setTimeouts on individual messages.
     */
    private _setTimeout(message: MessageDisplayData) {
        window.setTimeout(() => {
            this.clear(message.id);
        }, message.timeout);
    }
}