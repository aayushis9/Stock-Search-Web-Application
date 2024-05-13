import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class StockService {
  private stockSource = new BehaviorSubject<any>(null);
  currentStock = this.stockSource.asObservable();
  constructor() { }
  updateStockData(stock: any) {
    this.stockSource.next(stock);
  }
}
