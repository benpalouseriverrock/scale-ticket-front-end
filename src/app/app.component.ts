import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  currentView = 'tickets';
  printTicketId: number | null = null;
  printMode: 'ticket' | 'invoice' = 'invoice';
  editingTicket: any = null;

  setView(view: string) {
    this.currentView = view;
    if (view !== 'print') this.printTicketId = null;
    if (view !== 'create') this.editingTicket = null;
  }

  onPrintRequested(event: { id: number; mode: 'ticket' | 'invoice' }) {
    this.printTicketId = event.id;
    this.printMode = event.mode;
    this.currentView = 'print';
  }

  onEditRequested(ticket: any) {
    this.editingTicket = ticket;
    this.currentView = 'create';
  }
}
