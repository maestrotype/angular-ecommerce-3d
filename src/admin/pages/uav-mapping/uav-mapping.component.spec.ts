import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UavMappingComponent } from './uav-mapping.component';

describe('UavMappingComponent', () => {
  let component: UavMappingComponent;
  let fixture: ComponentFixture<UavMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UavMappingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UavMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
