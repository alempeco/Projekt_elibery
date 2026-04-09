import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { SearchComponent } from '../search/search.component';
import { SharedModalComponent } from '../shared/shared-modal/shared-modal.component'; // Provjeri putanju!
import { FormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
interface Book {
  Id: number;
  ISBN: string;
  Title: string;
  Author: string;
  PublishedYear: number;
  TotalCopies: number;
  AvailableCopies: number;
  CategoryName: string; 
  CategoryId: number;
  ImageUrl: string;
  Description: string;
}

interface Category {
  Id: number;
  Name: string;
}

@Component({
  selector: 'app-books',
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.css'],
  standalone: true,
  imports: [
    CommonModule, 
    HeaderComponent, 
    SearchComponent, 
    FormsModule, 
    SharedModalComponent, // Dodano u imports
    ConfirmDialogComponent
  ]
})
export class BooksComponent implements OnInit {
  books: Book[] = [];
  filteredBooks: Book[] = [];
  categories: Category[] = [];
  loading = true;
  error = '';
  showModal = false;
  isEditMode = false;
  showConfirm = false;
  bookIdToDelete: number | null = null;
  
  currentBook: any = {
    Title: '',
    Author: '',
    ISBN: '',
    PublishedYear: new Date().getFullYear(),
    TotalCopies: 1,
    AvailableCopies: 1,
    CategoryId: null,
    ImageUrl: '',
    Description: ''
  };

  private apiUrl = 'http://localhost:3000/api/books';
  private categoryUrl = 'http://localhost:3000/api/categories';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadBooks();
    this.loadCategories();
  }

  loadBooks(): void {
    this.loading = true;
    this.http.get<Book[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.books = data;
        this.filteredBooks = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Greška pri učitavanju knjiga.';
        this.loading = false;
      }
    });
  }

  loadCategories(): void {
    this.http.get<Category[]>(this.categoryUrl).subscribe({
      next: (data) => {
        this.categories = data;
        if (!this.currentBook.CategoryId && data.length > 0) {
          this.currentBook.CategoryId = data[0].Id;
        }
      },
      error: (err) => console.error('Greška pri učitavanju kategorija:', err)
    });
  }

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

  openModal(book: any = null) {
    if (book) {
      this.isEditMode = true;
      this.currentBook = { ...book };
    } else {
      this.isEditMode = false;
      this.currentBook = { 
        Title: '', 
        Author: '', 
        ISBN: '', 
        PublishedYear: new Date().getFullYear(), 
        TotalCopies: 1, 
        AvailableCopies: 1, 
        CategoryId: this.categories.length > 0 ? this.categories[0].Id : null, 
        ImageUrl: '', 
        Description: '' 
      };
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveBook() {
    const { CategoryName, Id, ...bookData } = this.currentBook;

    if (this.isEditMode) {
      this.http.put(`${this.apiUrl}/${Id}`, bookData).subscribe({
        next: () => {
          this.loadBooks();
          this.closeModal();
          alert('Izmjene spašene!');
        },
        error: (err) => alert("Greška: " + err.message)
      });
    } else {
      this.http.post(this.apiUrl, bookData).subscribe({
        next: () => {
          this.loadBooks();
          this.closeModal();
          alert('Knjiga dodana!');
        },
        error: (err) => alert("Greška: " + (err.error?.details || err.message))
      });
    }
  }

  deleteBook(id: number) {
    this.bookIdToDelete = id;
    this.showConfirm = true;
  }

  confirmDeletion() {
    if (this.bookIdToDelete !== null) {
      this.http.delete(`${this.apiUrl}/${this.bookIdToDelete}`).subscribe({
        next: () => {
          this.books = this.books.filter(b => b.Id !== this.bookIdToDelete);
          this.filteredBooks = this.filteredBooks.filter(b => b.Id !== this.bookIdToDelete);
          this.showConfirm = false;
        },
        error: () => alert('Greška pri brisanju.')
      });
    }
  }
}