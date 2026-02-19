import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { SearchComponent } from '../search/search.component';

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
  imports: [CommonModule, HeaderComponent, SearchComponent]

})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];       // Originalni podaci iz baze
  filteredCategories: Category[] = [];  
  loading = true;
  error = '';

  private apiUrl = 'http://localhost:3000/api/categories';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Category[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.categories = data;
        this.filteredCategories =data;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Greška pri dohvaćanju kategorija:', err);
        this.error = 'Greška pri učitavanju kategorija.';
        this.loading = false;
      }
    });
  }
  handleSearch(text: string) {
    if (!text) {
      this.filteredCategories = this.categories;
      return;
    }

    const search = text.toLowerCase();
    this.filteredCategories = this.categories.filter(categoriess => 
      categoriess.Name.toLowerCase().includes(search) || 
      categoriess.Description.toLowerCase().includes(search)
      
    );
  }
}
