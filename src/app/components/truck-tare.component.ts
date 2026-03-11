import { Component, OnInit } from '@angular/core';
import { Truck } from '../models';
import { TruckService } from '../services/truck.service';

@Component({
  selector: 'app-truck-tare',
  templateUrl: './truck-tare.component.html',
  styleUrls: ['./truck-tare.component.css']
})
export class TruckTareComponent implements OnInit {
  trucks: Truck[] = [];
  selectedTruckId: number | null = null;
  selectedTruck: Truck | null = null;
  newTareWeight: number = 0;
  message = '';

  constructor(private truckService: TruckService) {}

  ngOnInit() {
    this.loadTrucks();
  }

  loadTrucks() {
    this.truckService.getAll().subscribe({
      next: (data) => {
        this.trucks = data;
      },
      error: (error) => {
        console.error('Error loading trucks:', error);
      }
    });
  }

  onTruckSelect() {
    if (!this.selectedTruckId) return;
    this.selectedTruck = this.trucks.find(t => t.truck_id === this.selectedTruckId) || null;
    this.newTareWeight = this.selectedTruck?.tare_weight || 0;
  }

  updateTare() {
    if (!this.selectedTruckId || !this.newTareWeight) {
      this.message = 'Please select truck and enter tare weight';
      return;
    }

    this.truckService.updateTare(this.selectedTruckId, this.newTareWeight).subscribe({
      next: (response) => {
        this.message = 'Tare weight updated successfully';
        this.loadTrucks();
        this.selectedTruckId = null;
        this.selectedTruck = null;
      },
      error: (error) => {
        this.message = 'Error: ' + error.message;
      }
    });
  }
}
