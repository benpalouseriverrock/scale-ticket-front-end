import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { TicketEntryComponent } from './components/ticket-entry.component';
import { TicketListComponent } from './components/ticket-list.component';
import { TruckTareComponent } from './components/truck-tare.component';

@NgModule({
  declarations: [
    AppComponent,
    TicketEntryComponent,
    TicketListComponent,
    TruckTareComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
