import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import Map from '@arcgis/core/Map.js';
import MapView from '@arcgis/core/views/MapView.js';
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
import Graphic from "@arcgis/core/Graphic.js";
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import PictureMarkerSymbol from "@arcgis/core/symbols/PictureMarkerSymbol.js";
import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer.js";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import CSVLayer from "@arcgis/core/layers/CSVLayer.js";
import HeatmapRenderer from "@arcgis/core/renderers/HeatmapRenderer.js";
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import Point from "@arcgis/core/geometry/Point";


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
  csvLayer: CSVLayer | null = null;
  defaultCsvRenderer: any = null;

  // Inject HttpClient
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  // Hotel Listings - โหลดจาก local CSV
  hotelListings: any[] = [];

  demoGraphicsLayer = new GraphicsLayer();
  demoVectorTileLayer = new VectorTileLayer({
    url: "https://tiles.arcgis.com/tiles/jSaRWj2TDlcN1zOC/arcgis/rest/services/Thailand_Transportation/VectorTileServer"
  });
  demoFeatureLayer = new FeatureLayer({
    url: "https://services-ap1.arcgis.com/iA7fZQOnjY9D67Zx/ArcGIS/rest/services/OSM_AS_POIs/FeatureServer/0",
    outFields: ["*"],
    popupTemplate: {
      title: "{name}",
      content:
        "<b>Type:</b> {amenity} <br><b>Place:</b> {place} <br>",
    }
  });
  provinceFeatureLayer = new FeatureLayer({
    url: "https://services1.arcgis.com/jSaRWj2TDlcN1zOC/ArcGIS/rest/services/Thailand_Province_Boundaries_view/FeatureServer/1",
    outFields: ["*"]
  });


  ngOnInit(): void {
    this.loadHotelsFromCSV();
  }

  /**
   * โหลดข้อมูลโรงแรมจาก local CSV
   */
  loadHotelsFromCSV() {
    this.http.get('/data/hotel_list.csv', { responseType: 'text' }).subscribe({
      next: (data) => {
        const lines = data.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());

        this.hotelListings = lines.slice(1)
          .filter(line => line.trim())
          .map((line, index) => {
            const values = this.parseCSVLine(line);

            return {
              id: index + 1,
              latitude: parseFloat(values[headers.indexOf('latitude')] || '0'),
              longitude: parseFloat(values[headers.indexOf('longitude')] || '0'),
              address: values[headers.indexOf('address')] || '',
              price: parseFloat(values[headers.indexOf('price')] || '0'),
              name: values[headers.indexOf('hotel_name')] || '',
              image: values[headers.indexOf('image')] || 'https://via.placeholder.com/400x300?text=No+Image'
            };
          });

        console.log('Loaded hotels:', this.hotelListings.length);
        this.cdr.markForCheck();

        // เพิ่มหมุดโรงแรมบนแผนที่
        this.addHotelMarkers();
      },
      error: (err) => {
        console.error('Error loading CSV:', err);
      }
    });
  }

  /**
   * Parse CSV line ที่อาจมี quotes
   */
  parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  /**
   * Click รายการโรงแรม -> zoom ไปที่ตำแหน่ง
   */
  onHotelClick(hotel: any) {
    if (!this.mapView) return;

    this.mapView.goTo({
      center: [hotel.longitude, hotel.latitude],
      zoom: 17
    }, {
      duration: 1000,
      easing: 'ease-in-out'
    });
  }

  ngAfterViewInit(): void {
    this.initializeMap();
    this.addPriceMarker();
  }

  async initializeMap(): Promise<any> {
    const container = this.mapViewEl.nativeElement;

    this.map = new Map({
      basemap: 'streets-vector',
    });

    this.mapView = new MapView({
      container,
      map: this.map,
      center: [100.61238932664604, 14.073619468605445], // longitude, latitude
      zoom: 20,

    });
    this.map.add(this.demoGraphicsLayer);

    this.mapView.when(() => { });

    return this.mapView.when();
  }

  hideCsvLayer() {
    if (!this.csvLayer) return;
    this.csvLayer.visible = false;
  }

  resetAnalysis() {
    if (!this.csvLayer || !this.defaultCsvRenderer) return;
    this.csvLayer.renderer = this.defaultCsvRenderer;
  }

  analysis() {
    if (!this.csvLayer) {
      return;
    }
    if (!this.defaultCsvRenderer) {
      this.defaultCsvRenderer = this.csvLayer.renderer;
    }

    const heatmapRenderer = new HeatmapRenderer({
      minDensity: 0,
      maxDensity: 1,
      colorStops: [
        { color: "rgba(63, 40, 102, 0)", ratio: 0 },
        { color: "#472b77", ratio: 0.083 },
        { color: "#4e2d87", ratio: 0.166 },
        { color: "#563098", ratio: 0.249 },
        { color: "#5d32a8", ratio: 0.332 },
        { color: "#6735be", ratio: 0.415 },
        { color: "#7139d4", ratio: 0.498 },
        { color: "#7b3ce9", ratio: 0.581 },
        { color: "#853fff", ratio: 0.664 },
        { color: "#a46fbf", ratio: 0.747 },
        { color: "#c29f80", ratio: 0.83 },
        { color: "#e0cf40", ratio: 0.913 },
        { color: "#ffff00", ratio: 1 },
      ]
    });

    this.csvLayer.renderer = heatmapRenderer;
  }


  addCSV() {
    if (!this.map || !this.mapView) return;

    this.csvLayer = new CSVLayer({
      url: '/data/hotel_list.csv',
      latitudeField: 'latitude',
      longitudeField: 'longitude',
      popupTemplate: {
        title: "{hotel_name}",
        content: `
          <b>Price:</b> {price} THB<br/>
          <b>Address:</b> {address}
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
          expression: "Text($feature.price) + ' Bath'"
        },
        labelPlacement: 'above-center',
        symbol: {
          type: 'text',
          color: 'black',
          haloColor: 'white',
          haloSize: 1,
          font: {
            size: 12,
            weight: 'bold'
          }
        } as any
      }
    ];

    this.map.add(this.csvLayer);

    this.mapView.goTo({
      center: [100.49553188909185, 13.7552797457819],
      zoom: 16
    }, {
      duration: 1200,
      easing: "ease-in-out"
    });
  }

  /**
   * สร้างหมุดโรงแรมบนแผนที่จากข้อมูล hotelListings
   */
  addHotelMarkers() {
    if (!this.mapView || !this.map) return;

    // ลบหมุดเก่าออกก่อน
    this.demoGraphicsLayer.removeAll();

    // สร้างหมุดสำหรับแต่ละโรงแรม
    this.hotelListings.forEach(hotel => {
      const point = new Point({
        longitude: hotel.longitude,
        latitude: hotel.latitude
      });

      // Symbol แบบ Text แสดงราคา
      const priceSymbol = new TextSymbol({
        text: `฿${hotel.price.toLocaleString()}`,
        color: "white",
        haloColor: "#6366F1",
        haloSize: "2px",
        font: {
          size: 11,
          weight: "bold"
        },
        backgroundColor: "#6366F1",
        borderLineColor: "#4F46E5",
        borderLineSize: 1,
        yoffset: 0
      });

      const graphic = new Graphic({
        geometry: point,
        symbol: priceSymbol,
        attributes: {
          id: hotel.id,
          name: hotel.name,
          price: hotel.price,
          address: hotel.address,
          image: hotel.image
        },
        popupTemplate: {
          title: "{name}",
          content: `
            <div style="width: 250px;">
              <img src="{image}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;" />
              <p style="font-size: 18px; font-weight: bold; color: #6366F1; margin: 5px 0;">฿{price}</p>
              <p style="font-size: 13px; color: #666;">{address}</p>
            </div>
          `
        }
      });

      this.demoGraphicsLayer.add(graphic);
    });

    // Zoom ไปที่พื้นที่โรงแรม (สยาม กรุงเทพฯ)
    if (this.hotelListings.length > 0) {
      const firstHotel = this.hotelListings[0];
      this.mapView.goTo({
        center: [firstHotel.longitude, firstHotel.latitude],
        zoom: 16
      }, {
        duration: 1000,
        easing: "ease-in-out"
      });
    }
  }

  addFeatureLayer() {
    if (!this.map) return;

    if (!this.map.layers.includes(this.demoFeatureLayer)) {
      this.map.add(this.demoFeatureLayer);
    } else {
      this.demoFeatureLayer.visible = true;
    }
  }

  hideFeatureLayer() {
    if (!this.map) return;

    if (this.map.layers.includes(this.demoFeatureLayer)) {
      this.demoFeatureLayer.visible = false;
    }
  }

  addVectorTile() {
    if (!this.map) return;

    if (!this.map.layers.includes(this.demoVectorTileLayer)) {
      this.map.add(this.demoVectorTileLayer);
    } else {
      this.demoVectorTileLayer.visible = true;
    }
  }

  hideVectorTile() {
    if (!this.map) return;

    if (this.map.layers.includes(this.demoVectorTileLayer)) {
      this.demoVectorTileLayer.visible = false;
    }
  }

  addGraphics() {
    // zoom to specific location
    this.mapView?.goTo({
      center: [100.49553188909185, 13.7552797457819],
      zoom: 20
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

    const IconPoint: any = {
      //Create a point
      type: "point",
      longitude: 100.61238932664604,
      latitude: 14.073619468605445,
    };
    const IconSymbol = new PictureMarkerSymbol({
      url: "images/photos/school.png",
      width: "64px",
      height: "64px"
    });

    const IconGraphic = new Graphic({
      geometry: IconPoint,
      symbol: IconSymbol,
      attributes: {
        name: "มหาวิทยาลัยธรรมศาสตร์ ศูนย์รังสิต",
        image: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSwd49k6GoOfrdkidJoQedxNjkJKkVLXQJCQyQ187eyDibb2IFQw49Y5gCQVYvVVtACzIykU1rSQZbzWuIZwCT4KPE-Q-gDlBcu8qNlvNUlsOeqrXu3IJ3p6vi4_v6qnsl-_2F-8=w408-h350-k-no",
        address: "99 หมู่ที่ 18 ถ. พหลโยธิน ต.คลองหนึ่ง อ.คลองหลวง ปทุมธานี 12120"
      },
      popupTemplate: {
        title: "{name}",
        content: `
      <div class="w-64">
        <img 
          src="{image}" 
          class="w-full h-40 object-cover rounded-lg mb-3"
        />

        <p class="text-sm text-gray-700">
          {address}
        </p>
    `
      }
    });

    this.demoGraphicsLayer.add(IconGraphic);

  }

  clearGraphicLayer() {
    this.demoGraphicsLayer.removeAll();
  }

  ngOnDestroy(): void {
    if (this.mapView) {
      this.mapView.destroy();
    }
  }

  addPriceMarker() {
    const point = new Point({
      longitude: 100.61238932664604,
      latitude: 14.073619468605445
    });

    const symbol = new TextSymbol({
      text: `$900K`,
      color: "black",
      haloColor: "white",
      haloSize: "2px",
      font: {
        size: 12,
        weight: "bold"
      },
      backgroundColor: "white",
      borderLineColor: "#ddd",
      borderLineSize: 1,
      yoffset: -10
    });

    const graphic = new Graphic({
      geometry: point,
      symbol,
      attributes: {
        name: "มหาวิทยาลัยธรรมศาสตร์ ศูนย์รังสิต",
        image: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSwd49k6GoOfrdkidJoQedxNjkJKkVLXQJCQyQ187eyDibb2IFQw49Y5gCQVYvVVtACzIykU1rSQZbzWuIZwCT4KPE-Q-gDlBcu8qNlvNUlsOeqrXu3IJ3p6vi4_v6qnsl-_2F-8=w408-h350-k-no",
        address: "99 หมู่ที่ 18 ถ. พหลโยธิน ต.คลองหนึ่ง อ.คลองหลวง ปทุมธานี 12120"
      },
      popupTemplate: {
        title: "{name}",
        content: `
      <div class="w-64">
        <img 
          src="{image}" 
          class="w-full h-40 object-cover rounded-lg mb-3"
        />

        <p class="text-sm text-gray-700">
          {address}
        </p>
    `
      }
    });

    this.demoGraphicsLayer.add(graphic);
  }
}
