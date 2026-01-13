import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import CSVLayer from '@arcgis/core/layers/CSVLayer';

@Component({
  selector: 'app-demo-gis-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './demo-gis-page.html',
  styleUrl: './demo-gis-page.css',
})
export class DemoGisPage implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('mapViewNode', { static: false })
  private mapViewEl!: ElementRef<HTMLDivElement>;

  map!: Map;
  mapView!: MapView;

  graphicsLayer = new GraphicsLayer();
  csvLayer!: CSVLayer;

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  async initializeMap() {
    this.map = new Map({
      basemap: 'streets-vector'
    });

    this.mapView = new MapView({
      container: this.mapViewEl.nativeElement,
      map: this.map,
      center: [100.6124, 14.0736], // Thailand
      zoom: 14
    });

    this.map.add(this.graphicsLayer);

    await this.mapView.when();
    this.addCsvLayer();
  }

  // =========================
  // CSV LAYER
  // =========================
  addCsvLayer() {
    this.csvLayer = new CSVLayer({
      url: '/data/hotel_list.csv', 
      latitudeField: 'latitude',
      longitudeField: 'longitude',

      featureReduction: null,

      popupTemplate: {
        title: '{hotel_name}',
        content: `
          <img src="{image}" class="w-full h-auto rounded-lg mt-2"/>
          <b>ราคา:</b> {price} บาท<br/>
          <b>ที่อยู่:</b> {address}
        `
      }
    });


    this.csvLayer.renderer = {
      type: 'simple',
      symbol: {
        type: 'simple-marker',
        color: '#6366F1',
        size: 10,
        outline: {
          color: 'white',
          width: 1
        }
      }
    } as any;

    // 🔹 Label ราคา
    this.csvLayer.labelingInfo = [
      {
        labelExpressionInfo: {
          expression: "Text($feature.price) + 'Bath'"
        },
        labelPlacement: 'above-center',
        symbol: {
          type: 'text',
          color: 'black',
          haloColor: 'white',
          haloSize: 1,
          backgroundColor: 'white',
          borderLineColor: '#ddd',
          borderLineSize: 1,
          font: {
            size: 12,
            weight: 'bold'
          },
          yoffset: 10
        }
      }
    ];

    this.csvLayer.labelsVisible = true;

    this.map.add(this.csvLayer);

    // zoom ไปยังข้อมูลทั้งหมด
    this.csvLayer.when(async () => {
      const result = await this.csvLayer.queryFeatures();
      console.table(
        result.features.map(f => f.attributes)
      );
      this.mapView?.goTo(this.csvLayer.fullExtent);
    });

  }

  ngOnDestroy(): void {
    if (this.mapView) {
      this.mapView.destroy();
    }
  }
}
