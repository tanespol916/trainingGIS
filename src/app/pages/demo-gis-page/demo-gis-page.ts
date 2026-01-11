import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import Map from '@arcgis/core/Map.js';
import MapView from '@arcgis/core/views/MapView.js';
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
import Graphic from "@arcgis/core/Graphic.js";
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-demo-gis-page',
  imports: [CommonModule, AccordionModule, ButtonModule],
  templateUrl: './demo-gis-page.html',
  styleUrl: './demo-gis-page.css',
})
export class DemoGisPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapViewNode', { static: false }) private mapViewEl!: ElementRef;
  map: Map | null = null;
  mapView: MapView | null = null;
  demoGraphicsLayer = new GraphicsLayer();

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  async initializeMap(): Promise<any> {
    const container = this.mapViewEl.nativeElement;

    this.map = new Map({
      basemap: 'streets-vector',
    });

    this.mapView = new MapView({
      container,
      map: this.map,
      center: [100.5433989, 13.7029924], // longitude, latitude
      zoom: 20,
    });

    this.map.add(this.demoGraphicsLayer);

    this.mapView.when(() => { });

    return this.mapView.when();
  }

  addGraphics() {
    // zoom to specific location
    this.mapView?.goTo({
      center: [-118.805, 34.020],
      zoom: 13
    })
    // clear all old graphics
    this.demoGraphicsLayer.removeAll();

    // Demo Add Point Graphic to GraphicLayer
    const point: any = {
      //Create a point
      type: "point",
      longitude: -118.80657463861,
      latitude: 34.0005930608889,
    };
    const simpleMarkerSymbol: any = {
      type: "simple-marker",
      color: [226, 119, 40], // Orange
      outline: {
        color: [255, 255, 255], // White
        width: 1,
      },
    };

    //const pointGraphic = new Graphic({ geometry: point, symbol: simpleMarkerSymbol });
    //this.demoGraphicsLayer.add(pointGraphic);

    // ---------------------------------------------------------------------------
    // Demo Add Polyline Graphic to GraphicLayer
    const polyline: any = {
      type: "polyline",
      paths: [
        [-118.821527826096, 34.0139576938577], //Longitude, latitude
        [-118.814893761649, 34.0080602407843], //Longitude, latitude
        [-118.808878330345, 34.0016642996246], //Longitude, latitude
      ],
    };
    const simpleLineSymbol: any = {
      type: "simple-line",
      color: [226, 119, 40], // Orange
      width: 2,
    };

    //const polylineGraphic = new Graphic({ geometry: polyline, symbol: simpleLineSymbol });
    //this.demoGraphicsLayer.add(polylineGraphic);

    // ----------------------------------------------------------------------
    // Demo Add Polygon Graphic to GraphicLayer
    const polygon: any = {
      type: "polygon",
      rings: [
        [-118.818984489994, 34.0137559967283], //Longitude, latitude
        [-118.806796597377, 34.0215816298725], //Longitude, latitude
        [-118.791432890735, 34.0163883241613], //Longitude, latitude
        [-118.79596686535, 34.008564864635], //Longitude, latitude
        [-118.808558110679, 34.0035027131376], //Longitude, latitude
      ],
    };

    const simpleFillSymbol: any = {
      type: "simple-fill",
      color: [227, 139, 79, 0.8], // Orange, opacity 80%
      outline: { color: [255, 255, 255], width: 1 },
    };

    const attributes = { Name: "Graphic", Description: "I am a polygon" };
    const popupTemplate = { title: "{Name}", content: "{Description}" };

    const polygonGraphic = new Graphic({
      geometry: polygon,
      symbol: simpleFillSymbol,
      attributes: attributes,
      popupTemplate: popupTemplate,
    });
    this.demoGraphicsLayer.add(polygonGraphic);
  }

  clearGraphicLayer() {
	  this.demoGraphicsLayer.removeAll();
  }

  ngOnDestroy(): void {
    if (this.mapView) {
      this.mapView.destroy();
    }
  }
}
