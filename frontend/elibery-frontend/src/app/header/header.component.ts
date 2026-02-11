import { Component, Input } from '@angular/core';
import { Location, CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  // Naslov koji šalješ iz roditeljske komponente (npr. 'TIMESHEETS' ili 'KORISNICI')
  @Input() title: string = '';

  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}