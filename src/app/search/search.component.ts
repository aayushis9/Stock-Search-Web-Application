import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { map, startWith, debounceTime, tap, switchMap, filter } from 'rxjs/operators';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgModel } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { WatchlistComponent } from '../watchlist/watchlist.component';


import * as Highcharts from 'highcharts/highstock';
import IndicatorsAll from 'highcharts/indicators/indicators-all';
import IndicatorsCore from 'highcharts/indicators/indicators';
import vbp from 'highcharts/indicators/volume-by-price';
import sma from 'highcharts/indicators/ema';

IndicatorsCore(Highcharts);
vbp(Highcharts);
sma(Highcharts);
IndicatorsAll(Highcharts);

import indicators from 'highcharts/indicators/indicators';
import volumeByPrice from 'highcharts/indicators/volume-by-price';
import { getLocaleExtraDayPeriodRules } from '@angular/common';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  providers: [DatePipe]
})
export class SearchComponent implements OnInit {
  @ViewChild('tickersymbol') tickersymbol!: ElementRef;
  myControl = new FormControl();
  Highcharts: typeof Highcharts = Highcharts;
  historicalChartData: [string, Number, Number, Number, Number][] = [];
  historicalChartVolume: [string, Number][] = [];
  chartOptions: Highcharts.Options = {};
  chartOptions2: Highcharts.Options = {};
  stock : any;
  price : any;
  details : any;
  peers: string[] = [];
  options = [{ticker: 'AA', name:'Appple'}];
  filteredOptions: any;
  isLoading = false;
  symbol! : string;
  marketStatus!: string;
  currentTime = Math.floor(Date.now() / 1000);
  news: any[] = [];
  selectedNews: any = null;
  pageLoading: Boolean = false
  star_fill :boolean=false
  insights: any;
  aggregatedData = {
    totalMspr: 0,
    positiveMspr: 0,
    negativeMspr: 0,
    totalChange: 0,
    positiveChange: 0,
    negativeChange: 0,
  };

  volume: any[] = []
  ohlc: any[] = []

  now: any

  datetime: any;


  moneyInWallet: number = 10000;
  quantity: number = 0;
  totalPrice: number = 0;
  transactionType: 'buy' | 'sell' = 'buy';


  constructor(private route:ActivatedRoute, private router : Router, private http:HttpClient, private modalService: NgbModal, private datePipe: DatePipe) { }
 
  ngOnInit(): void {
    this.myControl.valueChanges.pipe(
      debounceTime(400),
      tap(() => this.isLoading = true),
      filter(value => value),
      switchMap(value => 
        this.http.get<any[]>(`https://stock-search-csci571-ass3.uw.r.appspot.com/autocomplete?symbol=${value}`).pipe(
          tap(() => this.isLoading = false),
        )
      )
    ).subscribe(values => this.filteredOptions = values);
  }

  showDetails(){
    this.pageLoading = true
    this.symbol = this.myControl.value.toUpperCase() || ''
    this.fetchStockDetails(this.symbol)
    this.getStockDetails(this.symbol)
    this.shownews(this.symbol)
    this.getPeers(this.symbol)
    this.getInsights(this.symbol)
    this.fetchHistoricalData(this.symbol)
    this.getCharts(this.symbol)
    const ticker = this.myControl.value.toUpperCase()
    if (ticker != '')
      this.router.navigate(['/search/'+ ticker])
    console.log('search')
    this.pageLoading = false
  }

  fetchStockDetails(symbol: string) {
    this.stock =this.http.get(`https://stock-search-csci571-ass3.uw.r.appspot.com/api/stock/${symbol}`).subscribe(data => this.stock = data);
  }
 
  getStockDetails(symbol: string) {
    this.http.get<any>(`https://stock-search-csci571-ass3.uw.r.appspot.com/api/price/${symbol}`).subscribe(data => {
    console.log(data)  
    this.price = data;
      this.checkMarketStatus();
    });
    this.now = new Date()
    console.log(this.price)
  }
  
  checkMarketStatus(): void {
    const timeSinceLastUpdate = this.currentTime - this.stock.timestamp;
    this.marketStatus = timeSinceLastUpdate > 300 ? 'Closed' : 'Open';
  }
  
  shownews(symbol: string){
    this.http.get<any>(`https://stock-search-csci571-ass3.uw.r.appspot.com/api/news/${symbol}`).subscribe(data => {
      console.log(data)  
      this.news = data;
  });
}

  openModal(content: any, newsItem: any): void {
    this.selectedNews = newsItem; 
    let ts = new Date(this.selectedNews.datetime * 1000)
    this.selectedNews.datetime = `${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(
      ts
    )} ${ts.getDate()}, ${ts.getFullYear()}`;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      console.log(result); 
  }, (reason) => {
    console.log(reason); 
  }); 
}


  getPeers(symbol: string){
    this.http.get<any>(`https://stock-search-csci571-ass3.uw.r.appspot.com/api/peers/${symbol}`).subscribe(data => {
    console.log(data)  
    this.peers = data;
      this.checkMarketStatus();
    });
    console.log(this.peers)
  }


  getInsights(symbol: string): void {
    this.http.get<any>(`https://stock-search-csci571-ass3.uw.r.appspot.com/api/insights/${symbol}`).subscribe({
      next: (response) => {
        this.aggregateInsightsData(response.data);
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }

  aggregateInsightsData(data: any): void {
    this.aggregatedData = {
      totalMspr: 0,
      positiveMspr: 0,
      negativeMspr: 0,
      totalChange: 0,
      positiveChange: 0,
      negativeChange: 0,
    };
    data.forEach((item:{ mspr: number; change: number })=> {
      
      this.aggregatedData.totalMspr += item.mspr;
      console.log(this.aggregatedData.totalMspr)
      this.aggregatedData.totalChange += item.change;
      
      if (item.mspr > 0) {
        this.aggregatedData.positiveMspr += item.mspr;
      } else if (item.mspr < 0) {
        this.aggregatedData.negativeMspr += item.mspr;
      }
  
      if (item.change > 0) {
        this.aggregatedData.positiveChange += item.change;
      } else if (item.change < 0) {
        this.aggregatedData.negativeChange += item.change;
      }

    });
    this.aggregatedData.totalMspr = Math.round(this.aggregatedData.totalMspr * 100) / 100
    this.aggregatedData.totalChange = Math.round(this.aggregatedData.totalChange * 100) / 100
    this.aggregatedData.positiveChange = Math.round(this.aggregatedData.positiveChange * 100) / 100
    this.aggregatedData.positiveMspr = Math.round(this.aggregatedData.positiveMspr * 100) / 100
    this.aggregatedData.negativeChange = Math.round(this.aggregatedData.negativeChange * 100) / 100
    this.aggregatedData.negativeMspr = Math.round(this.aggregatedData.negativeMspr * 100) / 100
  }


  fetchHistoricalData(symbol: string): void {
    console.log('historic')
    this.http.get(`https://stock-search-csci571-ass3.uw.r.appspot.com/api/historical/${symbol}`).subscribe({
      next: (response: any) => {
        console.log('Historical data:', response);
        response.results.forEach((item: any) => {
            this.ohlc.push([
              item.t, 
              item.o, 
              item.h, 
              item.l,  
              item.c 
            ]);
            this.volume.push([
              item.t, 
              item.v 
            ]);
          });
          console.log(this.ohlc)
      this.chartOptions = {
        rangeSelector: {
          enabled:true,

          buttons:[
            {
              type: 'month',
              count: 1,
              text: '1m'
            },
            {
              type: 'month',
              count: 3,
              text: '3m'
            },
            {
              type: 'month',
              count: 6,
              text: '6m'
            },
            {
              type: 'ytd',
              text: 'YTD'
            },
            {
              type: 'year',
                count: 1,
                text: '1y'
            },

            {
              type: 'all',
              text: 'All'
            },
          ],
          selected: 2,
          inputEnabled: true
        },
        title: {
          text: `${symbol} Historical`
        },
        subtitle: {
          text: 'With SMA and Volume by Price technical indicators'
        },

        xAxis:{
          type: 'datetime',
          dateTimeLabelFormats:{day: '%e. %b'},
          title :{
            text:'Date'
          }
        },

        yAxis: [
          {
          startOnTick: false,
          endOnTick: false,
          labels: {
            align: 'right',
            x: -3
          },
          title: {
            text: 'OHLC'
          },
          height: '60%',
          lineWidth: 2,
          resize: {
            enabled: true
          }
          }, 
          {
          labels: {
            align: 'right',
            x: -3
          },
          title: {
            text: 'Volume'
          },
          top: '65%',
          height: '35%',
          offset: 0,
          lineWidth: 2
        }],

        tooltip:{
          split:true
        },

        series: [{
          type: 'candlestick',
          name: symbol,
          id: 'primarySeries',
          data: this.ohlc,
          zIndex: 2,
        }, {
          type: 'column',
          name: 'Volume',
          id:'volume',
          data: this.volume,
          yAxis: 1
        }, { 
           type:'vbp',
           linkedTo: 'primarySeries',
           params:{
            volumeSeriesID: 'volume'
           },
           dataLabels:{
            enabled:false
           },
           zoneLines:{
            enabled:false
           }
        }, {
          type:'sma',
          linkedTo: 'primarySeries',
          zIndex:1,
          marker:{
            enabled:false
          }
        }]
      };
        },
        error: (error) => console.error('Error fetching historical data:', error)
      });
  }

 
  getCharts(symbol: string): void {
    this.http.get(`https://stock-search-csci571-ass3.uw.r.appspot.com/api/hourly/${symbol}`).subscribe({ 
      next: (response: any) => {
        console.log('Hourly data:', response);
        this.chartOptions2 = {
          time: {
            useUTC: false
          },
          rangeSelector: {
            enabled: false
          },
          series: [{
            data: this.stock,
            name: symbol,
            color: +this.price.change > 0 ? 'green' : +this.price.change < 0 ? 'red' : 'black',
            type: 'line',
            tooltip: {
              valueDecimals: 2
            }
          }]
        };
     }
   });
  }
  

  openTransactionModal(content: any, type: 'buy' | 'sell'): void {
    this.transactionType = type;
    this.quantity = 0; 
    this.totalPrice = 0; 
    this.modalService.open(content); 
  }

  calculateTotal(): void {
    this.totalPrice = this.quantity * this.price.c;
  }

  get isValidTransaction(): boolean {
    if (this.transactionType === 'buy') {
      return this.quantity > 0 && this.totalPrice <= this.moneyInWallet;
    } else {
     
      return this.quantity > 0; 
    }
  }

  executeTransaction(): void {
    if (this.transactionType === 'buy') {
      if (this.totalPrice <= this.moneyInWallet && this.quantity > 0) {
        this.moneyInWallet -= this.totalPrice;
        const newQuantity = this.getStockQuantity(this.symbol) + this.quantity;
        this.updateStockQuantity(this.symbol, newQuantity);
        this.modalService.dismissAll();
        this.quantity = 0;
        this.totalPrice = 0;
        alert('Purchase successful!');
      } else {
        alert('Invalid transaction. Please check your inputs and wallet balance.');
      }
    } else if (this.transactionType === 'sell') {
      if (this.quantity <= this.getStockQuantity(this.symbol) && this.quantity > 0) {
        this.moneyInWallet += this.totalPrice;
        const newQuantity = this.getStockQuantity(this.symbol) - this.quantity;
        this.updateStockQuantity(this.symbol, newQuantity);
        this.modalService.dismissAll();
  
        this.quantity = 0;
        this.totalPrice = 0;
        alert('Sale successful!');
      } else {
        alert('Invalid transaction. Please check your inputs and owned stock quantity.');
      }
    }
  }
  
  getStockQuantity(symbol: string): number {
    return 100; // Example return
  }
  
  updateStockQuantity(symbol: string, newQuantity: number): void {
    console.log(`Updated ${symbol} quantity to ${newQuantity}`);
  }
  
  hasPurchased(symbol: string): boolean {
    return false;
  }


  clickstar(){
    this.star_fill = !this.star_fill;

    if (this.star_fill) {
      this.http.post('https://stock-search-csci571-ass3.uw.r.appspot.com/api/watchlist', { symbol: this.symbol, name: this.stock.name }).subscribe(() => {
      alert('Stock added to watchlist successfully!');
        
      }, error => {
        console.error('Failed to add to watchlist', error);
        alert('Failed to add stock to watchlist.');
      });
    } else {
      this.http.delete(`https://stock-search-csci571-ass3.uw.r.appspot.com/api/watchlist/${this.symbol}`).subscribe(() => {
        console.log(`${this.symbol} removed from watchlist`);
        alert('Stock removed from the watchlist successfully!');
      }, error => {
        console.error('Failed to remove from watchlist', error);
      })
    }
  }
  
  clearScreenAndTicker(){
    this.myControl.reset();
    this.stock = undefined;
  }

}
