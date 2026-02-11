import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { SearchComponent } from '../search/search.component';

interface Book {
  Id: number;
  ISBN: string;
  Title: string;
  Author: string;
  PublishedYear: number;
  TotalCopies: number;
  AvailableCopies: number;
  CategoryName: string; 
  ImageUrl: string;
  Description: string;
}

@Component({
  selector: 'app-books',
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.css'],
  standalone: true,
  imports: [CommonModule, HeaderComponent, SearchComponent]
})
export class BooksComponent implements OnInit {
  books: Book[] = [];          // Originalni podaci iz baze
  filteredBooks: Book[] = [];   // Podaci koji se zapravo prikazuju (filtrirani)
  loading = true;
  error = '';

  private apiUrl = 'http://localhost:3000/api/books';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Book[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.books = data;
        this.filteredBooks = data; // Na početku su isti
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Greška pri dohvaćanju knjiga:', err);
        this.error = 'Greška pri učitavanju knjiga.';
        this.loading = false;
      }
    });
  }

  // Metoda koja prima tekst iz Search komponente
  handleSearch(text: string) {
    if (!text) {
      this.filteredBooks = this.books;
      return;
    }

    const search = text.toLowerCase();
    this.filteredBooks = this.books.filter(book => 
      book.Title.toLowerCase().includes(search) || 
      book.Author.toLowerCase().includes(search) ||
      book.Description?.toLowerCase().includes(search)
    );
  }
}