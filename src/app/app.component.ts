import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {ajax} from "rxjs/internal/observable/dom/ajax";
import {FormControl} from '@angular/forms';

declare var ymaps:any;
declare var jQuery:any;
declare var device;

var coords = [52.629729, -1.131592];
var crimeServiceURL = 'https://data.police.uk/api/crimes-at-location?date=*&lat=#&lng=@';
var map;

interface YandexMap extends MVCObject {
  constructor(el:HTMLElement, opts?:any):void;
  geoObjects:any;
}
interface MVCObject { addListener(eventName:string, handler:Function):MapsEventListener;
}
interface MapsEventListener { remove():void;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  categories:Object = [];
  selectedCategory:string = '';
  title:string = 'app';
  pickerDate = new FormControl(new Date("01-01-2017"));

  map:Promise<YandexMap> = new Promise<YandexMap>((resolve:() => void) => {
    this._mapResolver = resolve;
  });
  private _mapResolver:(value?:YandexMap) => void;

  @ViewChild('yamaps') el:ElementRef;

  private static buildHint(el:any) {
    var hint = el.outcome_status != null && el.outcome_status != 'undefined' ?
    'status: ' + el.outcome_status.category + ", \n date:" + el.outcome_status.date + ', ': '';

    hint += el.location.street != null && el.location.street != 'undefined' ? "\n street name: " + el.location.street.name : ''
    return hint;
  };

  private static buildDateString(date) {
    return date != null && date.value != null
      ? date.value.getFullYear() + '-' + (date.value.getMonth() + 1)
      : '';
  }

  searchCrime(coordinates:any) {

    var reqURL = crimeServiceURL.replace('*', AppComponent.buildDateString(this.pickerDate)).replace('#', coordinates[0]).replace('@', coordinates[1]);
    ajax(reqURL).subscribe(data => {
      data.response.forEach((el, pos) => {
        if (el.category.toLowerCase() == this.selectedCategory.toLowerCase()) {
          map.geoObjects.add(new ymaps.GeoObject({
            // Описание геометрии.
            geometry: {
              type: "Point",
              coordinates: [el.location.latitude, el.location.longitude]
            },
            properties: {
              // Контент метки.
              hintContent: AppComponent.buildHint(el)
            }
          }, {
            // Опции.
            // Иконка метки будет растягиваться под размер ее содержимого.
            preset: 'islands#redIcon',
            // Метку можно перемещать.
            draggable: false
          }))
        }
      })
    });
  }
  clickMaps(e:any) {
    coords = e.get('coords');
  }

  ngOnInit() {
    document.addEventListener('deviceready', function () {
      alert(device.platform);
    }, false);
    ajax('https://data.police.uk/api/crime-categories?date=' + AppComponent.buildDateString(this.pickerDate))
      .subscribe(data=>this.categories = data.response);

    ymaps.ready().done(() => {
      map = new ymaps.Map('map', {
        center: coords,
        zoom: 9
      }, {
        searchControlProvider: 'yandex#search'
      });
      this._mapResolver(<YandexMap>map);

      map.events.add('click', this.clickMaps, this);
      // Создаём макет содержимого.
      const myGeoObject = new ymaps.GeoObject({
        // Описание геометрии.
        geometry: {
          type: "Point",
          coordinates: coords
        },
        properties: {
          iconContent: 'Drag to search crimes'
        }

      }, {
        // Опции.
        // Иконка метки будет растягиваться под размер ее содержимого.
        preset: 'islands#blackStretchyIcon',
        // Метку можно перемещать.
        draggable: true
      });

      myGeoObject.events.add('dragend', e => {
        var coordinates = e.get('target').geometry.getCoordinates();
        coordinates[1] = coordinates[1].toPrecision(6);
        coordinates[0] = coordinates[0].toPrecision(6);

        this.searchCrime(coordinates);

      });

      map.geoObjects
        .add(myGeoObject);
    });
  }

}
