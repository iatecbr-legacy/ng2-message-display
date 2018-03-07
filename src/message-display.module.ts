import { NgModule, ModuleWithProviders } from "@angular/core";
import { CommonModule } from "@angular/common";

import { MessageDisplayComponent } from './message-display.component';
import { MessageDisplayContainerComponent } from './message-display-container.component';
import { MessageDisplayConfig, MessageDisplayService } from './message-display.service';

export default {
    providers: [MessageDisplayConfig, MessageDisplayService],
    directives: [MessageDisplayComponent, MessageDisplayContainerComponent]
};

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        MessageDisplayComponent,
        MessageDisplayContainerComponent        
    ],
    exports: [
        MessageDisplayComponent,
        MessageDisplayContainerComponent
    ]
})

export class MessageDisplayModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: MessageDisplayModule,
            providers: [MessageDisplayConfig, MessageDisplayService]
        };
    }
}