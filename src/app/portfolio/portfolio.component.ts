import { Component,  OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.css'
})
export class PortfolioComponent implements OnInit {
  list: any;
  loaded = false;

  constructor(private route: Router) { }
  ngOnInit(): void {
  }

}
