import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import Map from '@arcgis/core/Map.js';
import MapView from '@arcgis/core/views/MapView.js';

@Component({
  selector: 'app-demo-gis-page',
  imports: [CommonModule],
  templateUrl: './demo-gis-page.html',
  styleUrl: './demo-gis-page.css',
})
export class DemoGisPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapViewNode', { static: false }) private mapViewEl!: ElementRef;
  map: Map | null = null;
  mapView: MapView | null = null;

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    //console.log('Initializing map...');
    this.initializeMap();
  }

  async initializeMap(): Promise<any> {
    const container = this.mapViewEl.nativeElement;
    
    this.map = new Map({
      basemap: 'streets-vector',
    });

    this.mapView = new MapView({
      container: container,
      map: this.map,
      center: [100.5433989, 13.7029924], // longitude, latitude
      zoom: 20,
    });

    this.mapView.when(() => { });

    return this.mapView.when();
  }

  ngOnDestroy(): void {
    if (this.mapView) {
      this.mapView.destroy();
    }
  }
}
