import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SearchComponent } from '../search/search.component';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit {
  list : any;
  watchlist: any[] = []; 
  loaded = false; 
  data : any;
  
  
  constructor(
    private http: HttpClient,
    private router: Router,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.fetchWatchlist(); 
  }

  fetchWatchlist() {
    this.watchlist = []
    this.http.get<any[]>('https://stock-search-csci571-ass3.uw.r.appspot.com/api/watchlist').subscribe({
      next: (data2) => {
        for(let i=0; i<data2.length; i++) {
          this.http.get<any[]>('https://stock-search-csci571-ass3.uw.r.appspot.com/api/price/'+data2[i].symbol).subscribe(data1 => {
            let price  = data1
            let pricedata = {ticker: data2[i].symbol, name: data2[i].name, pData: price}
            this.watchlist.push(pricedata)
          console.log(this.watchlist)})
            
          console.log(data2[i].symbol)
        }
        this.loaded = true; 
      },
      error: (error) => {
        console.error('Error fetching watchlist:', error);
        this.loaded = true; 
      }
    });
  }

  removeWatchlist(ticker: string) {
    this.http.delete(`https://stock-search-csci571-ass3.uw.r.appspot.com/api/watchlist/${ticker}`).subscribe(() => {
        console.log(`${ticker} removed from watchlist`);
        alert('Stock removed from the watchlist successfully!');
      }, error => {
        console.error('Failed to remove from watchlist', error);
      })
      location.reload()
  }

 
}
