import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Truck, Trailer } from '../models';
import { TruckService } from '../services/truck.service';
import { TrailerService } from '../services/trailer.service';

@Component({
  selector: 'app-truck-tare',
  templateUrl: './truck-tare.component.html',
  styleUrls: ['./truck-tare.component.css']
})
export class TruckTareComponent implements OnInit {
  activeTab: 'truck-tare' | 'add-truck' | 'trailer-tare' | 'add-trailer' = 'truck-tare';

  trucks: Truck[] = [];
  trailers: Trailer[] = [];

  // Truck tare update
  selectedTruckId: number | null = null;
  selectedTruck: Truck | null = null;
  newTareWeight = 0;
  truckTareMessage = '';
  truckTareSuccess = false;

  // Add truck
  newTruck = { unit_number: '', configuration: '', tare_weight: 0 };
  addTruckMessage = '';
  addTruckSuccess = false;

  // Trailer tare update
  selectedTrailerId: number | null = null;
  selectedTrailer: Trailer | null = null;
  newTrailerTareWeight = 0;
  trailerTareMessage = '';
  trailerTareSuccess = false;

  // Add trailer
  newTrailer = { unit_number: '', configuration: '', tare_weight: 0 };
  addTrailerMessage = '';
  addTrailerSuccess = false;

  constructor(
    private truckService: TruckService,
    private trailerService: TrailerService
  ) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    forkJoin({
      trucks: this.truckService.getAll(),
      trailers: this.trailerService.getAll()
    }).subscribe({
      next: ({ trucks, trailers }) => {
        this.trucks = trucks;
        this.trailers = trailers;
      }
    });
  }

  setTab(tab: 'truck-tare' | 'add-truck' | 'trailer-tare' | 'add-trailer') {
    this.activeTab = tab;
    this.truckTareMessage = '';
    this.addTruckMessage = '';
    this.trailerTareMessage = '';
    this.addTrailerMessage = '';
  }

  onTruckSelect() {
    this.selectedTruck = this.trucks.find(t => t.truck_id === Number(this.selectedTruckId)) || null;
    this.newTareWeight = this.selectedTruck?.tare_weight || 0;
  }

  updateTruckTare() {
    if (!this.selectedTruckId || !this.newTareWeight) {
      this.truckTareMessage = 'Please select a truck and enter tare weight';
      this.truckTareSuccess = false;
      return;
    }
    this.truckService.updateTare(Number(this.selectedTruckId), this.newTareWeight).subscribe({
      next: () => {
        this.truckTareMessage = 'Truck tare weight updated successfully';
        this.truckTareSuccess = true;
        this.selectedTruckId = null;
        this.selectedTruck = null;
        this.newTareWeight = 0;
        this.loadAll();
      },
      error: (err) => {
        this.truckTareMessage = 'Error: ' + (err.error?.error || err.message);
        this.truckTareSuccess = false;
      }
    });
  }

  addTruck() {
    if (!this.newTruck.unit_number || !this.newTruck.tare_weight) {
      this.addTruckMessage = 'Unit number and tare weight are required';
      this.addTruckSuccess = false;
      return;
    }
    this.truckService.create(this.newTruck as any).subscribe({
      next: (res: any) => {
        this.addTruckMessage = `Truck "${res.unit_number}" added successfully`;
        this.addTruckSuccess = true;
        this.newTruck = { unit_number: '', configuration: '', tare_weight: 0 };
        this.loadAll();
      },
      error: (err) => {
        this.addTruckMessage = 'Error: ' + (err.error?.error || err.message);
        this.addTruckSuccess = false;
      }
    });
  }

  onTrailerSelect() {
    this.selectedTrailer = this.trailers.find(t => t.trailer_id === Number(this.selectedTrailerId)) || null;
    this.newTrailerTareWeight = this.selectedTrailer?.tare_weight || 0;
  }

  updateTrailerTare() {
    if (!this.selectedTrailerId) {
      this.trailerTareMessage = 'Please select a trailer and enter tare weight';
      this.trailerTareSuccess = false;
      return;
    }
    this.trailerService.updateTare(Number(this.selectedTrailerId), this.newTrailerTareWeight).subscribe({
      next: () => {
        this.trailerTareMessage = 'Trailer tare weight updated successfully';
        this.trailerTareSuccess = true;
        this.selectedTrailerId = null;
        this.selectedTrailer = null;
        this.newTrailerTareWeight = 0;
        this.loadAll();
      },
      error: (err) => {
        this.trailerTareMessage = 'Error: ' + (err.error?.error || err.message);
        this.trailerTareSuccess = false;
      }
    });
  }

  addTrailer() {
    if (!this.newTrailer.unit_number) {
      this.addTrailerMessage = 'Unit number is required';
      this.addTrailerSuccess = false;
      return;
    }
    this.trailerService.create(this.newTrailer as any).subscribe({
      next: (res: any) => {
        this.addTrailerMessage = `Trailer "${res.unit_number}" added successfully`;
        this.addTrailerSuccess = true;
        this.newTrailer = { unit_number: '', configuration: '', tare_weight: 0 };
        this.loadAll();
      },
      error: (err) => {
        this.addTrailerMessage = 'Error: ' + (err.error?.error || err.message);
        this.addTrailerSuccess = false;
      }
    });
  }
}
