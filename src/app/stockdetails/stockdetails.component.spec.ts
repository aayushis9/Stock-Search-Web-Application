import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockdetailsComponent } from './stockdetails.component';

describe('StockdetailsComponent', () => {
  let component: StockdetailsComponent;
  let fixture: ComponentFixture<StockdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StockdetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StockdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
