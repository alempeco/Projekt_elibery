import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';

interface Category {
  Id: number;
  Name: string;
  Description: string;
}

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
  standalone: true,
  imports: [CommonModule,HeaderComponent]
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  loading = true;
  error = '';

  private apiUrl = 'http://localhost:3000/api/categories';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Category[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Greška pri dohvaćanju kategorija:', err);
        this.error = 'Greška pri učitavanju kategorija.';
        this.loading = false;
      }
    });
  }
}
