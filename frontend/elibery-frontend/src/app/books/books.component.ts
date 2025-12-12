import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface Book {
  Id: number;
  ISBN: string;
  Title: string;
  Author: string;
  PublishedYear: number;
  TotalCopies: number;
  AvailableCopies: number;
  CategoryId: number;
  ImageUrl: string;
  Description: string;
}

@Component({
  selector: 'app-books',
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class BooksComponent implements OnInit {
  books: Book[] = [];
  loading = true;
  error = '';

  private apiUrl = 'http://localhost:3000/api/books';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Book[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.books = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Greška pri dohvaćanju knjiga:', err);
        this.error = 'Greška pri učitavanju knjiga.';
        this.loading = false;
      }
    });
  }
}
