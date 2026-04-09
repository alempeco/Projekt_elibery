import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { SearchComponent } from '../search/search.component';
import { SharedModalComponent } from '../shared/shared-modal/shared-modal.component';
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
    SharedModalComponent, 
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
  
  currentUser: any = null;

  // FIX: Inicijalizacija objekta odmah
  currentBook: any = this.resetBookObject();

  private apiUrl = 'http://localhost:3000/api/books';
  private categoryUrl = 'http://localhost:3000/api/categories';
  private loansUrl = 'http://localhost:3000/api/loans';
  private reservationsUrl = 'http://localhost:3000/api/reservations';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getCurrentUser();
    this.loadBooks();
    this.loadCategories();
  }

  getCurrentUser() {
    const data = localStorage.getItem('user');
    this.currentUser = data ? JSON.parse(data) : null;
    console.log("Trenutni korisnik:", this.currentUser);
  }

  get isAdmin(): boolean {
    const role = this.currentUser?.Role?.toLowerCase();
    return role === 'admin' || role === 'teacher'; 
  }

  get isStudent(): boolean {
    return this.currentUser?.Role?.toLowerCase() === 'student';
  }

  resetBookObject() {
    return {
      Title: '',
      Author: '',
      ISBN: '',
      PublishedYear: new Date().getFullYear(),
      TotalCopies: 1,      // Podrazumijevana vrijednost
      AvailableCopies: 1,  // Podrazumijevana vrijednost
      CategoryId: null,
      ImageUrl: '',
      Description: ''
    };
  }

  loadBooks(): void {
    this.loading = true;
    this.http.get<Book[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.books = data;
        this.filteredBooks = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Greška pri učitavanju knjiga.';
        this.loading = false;
      }
    });
  }

  loadCategories(): void {
    this.http.get<Category[]>(this.categoryUrl).subscribe({
      next: (data) => {
        this.categories = data;
        if (data.length > 0 && !this.currentBook.CategoryId) {
          this.currentBook.CategoryId = data[0].Id;
        }
      }
    });
  }

  borrowBook(book: Book) {
    if (book.AvailableCopies < 1) {
      alert('Nema dostupnih primjeraka!');
      return;
    }
    const loanData = {
    UserId: this.currentUser.Id,
    BookId: book.Id,
    LoanDate: new Date().toISOString().split('T')[0],
    DueDate: null, // Rok još ne teče jer knjiga nije preuzeta
    Status: 'Requested' 
  };
    this.http.post(this.loansUrl, loanData).subscribe({
      next: () => {
        alert('Uspješno posuđeno!');
        this.loadBooks();
      },
      error: (err) => alert("Greška: " + err.error?.message)
    });
  }

  calculateDueDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  handleSearch(text: string) {
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
      // Deep copy da izmjene u modalu ne utiču na tabelu dok se ne spasi
      this.currentBook = JSON.parse(JSON.stringify(book));
    } else {
      this.isEditMode = false;
      this.currentBook = this.resetBookObject();
      if (this.categories.length > 0) {
        this.currentBook.CategoryId = this.categories[0].Id;
      }
    }
    this.showModal = true;
  }

  closeModal() { 
    this.showModal = false; 
    this.currentBook = this.resetBookObject();
  }

  saveBook() {
    // Priprema podataka - vadimo Id i CategoryName jer ih SQL obično ne prima u POST/PUT body-u
    const { CategoryName, Id, ...bookData } = this.currentBook;
    
    // Osiguravamo da su brojevi zaista brojevi (u slučaju da ih input vrati kao string)
    bookData.TotalCopies = Number(bookData.TotalCopies);
    bookData.AvailableCopies = Number(bookData.AvailableCopies);

    if (this.isEditMode) {
      this.http.put(`${this.apiUrl}/${Id}`, bookData).subscribe({
        next: () => { this.loadBooks(); this.closeModal(); },
        error: (err) => alert("Greška pri izmjeni: " + err.message)
      });
    } else {
      this.http.post(this.apiUrl, bookData).subscribe({
        next: () => { this.loadBooks(); this.closeModal(); },
        error: (err) => alert("Greška pri dodavanju: " + err.message)
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
          this.loadBooks();
          this.showConfirm = false;
          this.bookIdToDelete = null;
        },
        error: () => alert("Greška pri brisanju.")
      });
    }
  }
  // Nova metoda za kreiranje rezervacije
reserveBook(book: Book) {
  const reservationData = {
    UserId: this.currentUser.Id,
    BookId: book.Id,
    ReservationDate: new Date().toISOString().slice(0, 19).replace('T', ' '), // Format za MySQL DATETIME
    Status: 'Pending' // Početni status iz vašeg ENUM-a
  };

  this.http.post(this.reservationsUrl, reservationData).subscribe({
    next: () => {
      alert(`Knjiga "${book.Title}" je uspješno rezervisana. Bićete obaviješteni kada bude dostupna.`);
      this.loadBooks(); // Osvježavamo listu
    },
    error: (err) => {
      console.error(err);
      alert("Greška prilikom rezervacije: " + (err.error?.message || "Server nije dostupan"));
    }
  });
}
}