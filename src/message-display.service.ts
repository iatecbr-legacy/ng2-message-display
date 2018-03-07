import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { isString, isNumber, isFunction } from './message-display.utils';
import { MessageDisplayData } from './message-display.interface';
/**
 * Options to configure specific Toast
 */
export interface MessageDisplayOptions {
    title: string;
    msg?: string;
    showClose?: boolean;
    theme?: string;
    timeout?: number;
    onAdd?: Function;
    onRemove?: Function;
}

/**
 * Structrure of Toast
 */


/**
 * Default configuration foa all toats and toasty container
 */
@Injectable()
export class MessageDisplayConfig {

    // Maximum number of toasties to show at once
    limit: number = 5;

    // Whether to show the 'X' icon to close the toast
    showClose: boolean = true;

    // The window position where the toast pops up. Possible values
    // bottom-right, bottom-left, top-right, top-left, top-center, bottom-center, center-center
    position: string = 'bottom-right';

    // How long (in miliseconds) the toasty shows before it's removed. Set to null/0 to turn off.
    timeout: number = 5000;

    // What theme to use. Possible values:
    // default, material or bootstrap
    theme: string = 'default';
}


/**
 * Toasty service helps create different kinds of Toasts
 */
@Injectable()
export class MessageDisplayService {
    // Allowed THEMES
    static THEMES: Array<string> = ['default', 'material', 'bootstrap'];
    // Init the counter
    uniqueCounter: number = 0;
    // ToastyData event emitter
    private messagesEmitter: EventEmitter<MessageDisplayData> = new EventEmitter<MessageDisplayData>();
    // Clear event emitter
    private clearEmitter: EventEmitter<number> = new EventEmitter<number>();

    constructor(private config: MessageDisplayConfig) { }

    /**
     * Get list of toats
     */
    getMessages(): Observable<MessageDisplayData> {
        return this.messagesEmitter.asObservable();
    }

    getClear(): Observable<number> {
        return this.clearEmitter.asObservable();
    }

    /**
     * Create Toast of a default type
     */
    default(options: MessageDisplayOptions | string | number): MessageDisplayData {
        return this.add(options, 'default');
    }

    /**
     * Create Toast of info type
     * @param  {object} options Individual toasty config overrides
     */
    info(options: MessageDisplayOptions | string | number): MessageDisplayData {
        return this.add(options, 'info');
    }

    /**
     * Create Toast of success type
     * @param  {object} options Individual toasty config overrides
     */
    success(options: MessageDisplayOptions | string | number): MessageDisplayData {
        return this.add(options, 'success');
    }

    /**
     * Create Toast of wait type
     * @param  {object} options Individual toasty config overrides
     */
    wait(options: MessageDisplayOptions | string | number): MessageDisplayData {
        return this.add(options, 'wait');
    }

    /**
     * Create Toast of error type
     * @param  {object} options Individual toasty config overrides
     */
    error(options: MessageDisplayOptions | string | number): MessageDisplayData {
        return this.add(options, 'error');
    }

    /**
     * Create Toast of warning type
     * @param  {object} options Individual toasty config overrides
     */
    warning(options: MessageDisplayOptions | string | number): MessageDisplayData {
        return this.add(options, 'warning');
    }


    // Add a new messageDisplay item
    private add(options: MessageDisplayOptions | string | number, type: string): MessageDisplayData {
        let messageOptions: MessageDisplayOptions;

        if (isString(options) && options !== '' || isNumber(options)) {
            messageOptions = <MessageDisplayOptions>{
                title: options.toString()
            };
        } else {
            messageOptions = <MessageDisplayOptions>options;
        }

        if (!messageOptions || !messageOptions.title && !messageOptions.msg) {
            throw new Error('message-display: No title or message specified!');
        }

        type = type || 'default';

        // Set a unique counter for an id
        this.uniqueCounter++;

        // Set the local vs global config items
        let showClose = this._checkConfigItem(this.config, messageOptions, 'showClose');

        // If we have a theme set, make sure it's a valid one
        let theme: string;
        if (messageOptions.theme) {
            theme = MessageDisplayService.THEMES.indexOf(messageOptions.theme) > -1 ? messageOptions.theme : this.config.theme;
        } else {
            theme = this.config.theme;
        }

        let messageDisplay: MessageDisplayData = <MessageDisplayData>{
            id: this.uniqueCounter,
            title: messageOptions.title,
            msg: messageOptions.msg,
            showClose: showClose,
            type: 'message-display-type-' + type,
            theme: 'message-display-theme-' + theme,
            onAdd: messageOptions.onAdd && isFunction(messageOptions.onAdd) ? messageOptions.onAdd : null,
            onRemove: messageOptions.onRemove && isFunction(messageOptions.onRemove) ? messageOptions.onRemove : null
        };

        // If there's a timeout individually or globally, set the messageDisplay to timeout
        // Allows a caller to pass null/0 and override the default. Can also set the default to null/0 to turn off.
        messageDisplay.timeout = messageOptions.hasOwnProperty('timeout') ? messageOptions.timeout : this.config.timeout;

        // Push up a new toast item
        // this.toastsSubscriber.next(messageDisplay);
        this.messagesEmitter.next(messageDisplay);
        // If we have a onAdd function, call it here
        if (messageOptions.onAdd && isFunction(messageOptions.onAdd)) {
            messageOptions.onAdd.call(this, messageDisplay);
        }

        return messageDisplay;
    }

    // Clear all toasts
    clearAll() {
        this.clearEmitter.next(null);
    }

    // Clear the specific one
    clear(id: number) {
        this.clearEmitter.next(id);
    }

    public showError(error: any): void {
        try {
            error = error.json();
        } catch (e) { }
        let message = error.message || error.ExceptionMessage || error.Message || (typeof error === "string" ? error : "Erro!") || "Erro unspecific";

        this.error({ title: "Error", msg: message, showClose: true, timeout: 50000 });
    }


    // Checks whether the local option is set, if not,
    // checks the global config
    private _checkConfigItem(config: any, options: any, property: string) {
        if (options[property] === false) {
            return false;
        } else if (!options[property]) {
            return config[property];
        } else {
            return true;
        }
    }
}