import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { SearchComponent } from '../search/search.component';
import { SharedModalComponent } from '../shared/shared-modal/shared-modal.component';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [
    CommonModule, 
    HeaderComponent, 
    SearchComponent, 
    FormsModule, 
    SharedModalComponent, 
    ConfirmDialogComponent
  ],
  templateUrl: './loans.component.html',
  styleUrls: ['./loans.component.css']
})
export class LoansComponent implements OnInit {
  loans: any[] = [];
  filteredLoans: any[] = [];
  users: any[] = [];
  books: any[] = [];
  
  loading = true;
  showModal = false;
  currentUser: any = null;

  currentLoan: any = {
    UserId: null,
    BookId: null,
    LoanDate: new Date().toISOString().split('T')[0],
    DueDate: '',
    Status: 'Active'
  };

  private apiUrl = 'http://localhost:3000/api/loans';

  constructor(private http: HttpClient) {
    this.currentLoan.DueDate = this.getFutureDate(14);
  }

  ngOnInit(): void {
    this.getCurrentUser();
    this.loadData();
  }

  getCurrentUser() {
    const data = localStorage.getItem('user');
    this.currentUser = data ? JSON.parse(data) : null;
  }

  get isAdmin(): boolean {
    // Ovako je bilo u tvom kodu, zadržavamo precizno provjeru "Admin"
    return this.currentUser?.Role === 'Admin';
  }

  loadData() {
    this.loading = true;
    this.http.get<any[]>('http://localhost:3000/api/users').subscribe(res => this.users = res);
    this.http.get<any[]>('http://localhost:3000/api/books').subscribe(res => this.books = res);
    
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.loans = data;
        this.applyRoleFiltering();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        console.error('Greška pri učitavanju posudbi');
      }
    });
  }

  applyRoleFiltering() {
    if (this.isAdmin) {
      this.filteredLoans = [...this.loans];
    } else {
      this.filteredLoans = this.loans.filter(l => l.UserId === this.currentUser?.Id);
    }
  }

  getUserName(id: number): string {
    const user = this.users.find(u => u.Id === id);
    return user ? `${user.FirstName} ${user.LastName}` : 'Nepoznat korisnik';
  }

  getBookTitle(id: number): string {
    const book = this.books.find(b => b.Id === id);
    return book ? book.Title : 'Nepoznata knjiga';
  }

  getFutureDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  handleSearch(text: string) {
    const search = text.toLowerCase();
    const baseList = this.isAdmin 
      ? this.loans 
      : this.loans.filter(l => l.UserId === this.currentUser?.Id);

    this.filteredLoans = baseList.filter(l => 
      this.getBookTitle(l.BookId).toLowerCase().includes(search) || 
      (this.isAdmin && this.getUserName(l.UserId).toLowerCase().includes(search)) ||
      l.Status.toLowerCase().includes(search)
    );
  }

  openModal() {
    if (!this.isAdmin) return;
    this.currentLoan = {
      UserId: null,
      BookId: null,
      LoanDate: new Date().toISOString().split('T')[0],
      DueDate: this.getFutureDate(14),
      Status: 'Active'
    };
    this.showModal = true;
  }

  saveLoan() {
    this.http.post(this.apiUrl, this.currentLoan).subscribe({
      next: () => {
        this.loadData();
        this.showModal = false;
        alert('Evidencija uspješna!');
      },
      error: (err) => alert(err.error?.message || 'Greška pri spremanju')
    });
  }

  // NOVO: Metoda za potvrdu fizičkog preuzimanja
  confirmPickup(loan: any) {
    if (!confirm('Potvrđujete da je korisnik preuzeo knjigu? Od danas teče rok od 14 dana.')) return;

    const update = { 
      ...loan, 
      Status: 'Active', 
      LoanDate: new Date().toISOString().split('T')[0], 
      DueDate: this.getFutureDate(14) 
    };

    this.http.put(`${this.apiUrl}/${loan.Id}`, update).subscribe({
      next: () => {
        this.loadData();
        alert('Knjiga je uručena!');
      },
      error: () => alert('Greška pri ažuriranju')
    });
  }

  returnBook(loan: any) {
    if (!confirm('Potvrdi povrat knjige u biblioteku?')) return;
    const update = { 
      ...loan, 
      Status: 'Returned', 
      ReturnDate: new Date().toISOString().split('T')[0] 
    };
    this.http.put(`${this.apiUrl}/${loan.Id}`, update).subscribe({
      next: () => {
        this.loadData();
        alert('Knjiga je vraćena!');
      },
      error: () => alert('Greška pri ažuriranju statusa')
    });
  }
}