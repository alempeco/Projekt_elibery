import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {
  @Input() placeholderText: string = 'Pretraži...';
  @Output() searchChange = new EventEmitter<string>();

  onInputChange(event: any) {
    const value = event.target.value;
    this.searchChange.emit(value); // Šaljemo tekst roditelju
  }
}