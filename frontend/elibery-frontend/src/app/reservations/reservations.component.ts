import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { SearchComponent } from '../search/search.component'; // Dodaj import
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.css'],
  standalone: true,
  imports: [CommonModule, HeaderComponent, SearchComponent, FormsModule] // Dodaj SearchComponent ovdje
})
export class ReservationsComponent implements OnInit {
  reservations: any[] = [];
  filteredReservations: any[] = []; // Niz za prikaz filtriranih rezultata
  loading = true;
  currentUser: any;

  private detailsUrl = 'http://localhost:3000/api/reservations-details';
  private crudUrl = 'http://localhost:3000/api/reservations';

  constructor(private http: HttpClient) {
    const data = localStorage.getItem('user');
    this.currentUser = data ? JSON.parse(data) : null;
  }

  ngOnInit(): void {
    this.loadReservations();
  }

  get isAdmin(): boolean {
    const role = this.currentUser?.Role?.toLowerCase();
    return role === 'admin' || role === 'teacher';
  }

  loadReservations() {
    this.loading = true;
    this.http.get<any[]>(this.detailsUrl).subscribe({
      next: (data) => {
        let results = [];
        if (!this.isAdmin) {
          results = data.filter(r => r.UserId === this.currentUser.Id);
        } else {
          results = data;
        }
        this.reservations = results;
        this.filteredReservations = results; // Inicijalno su isti
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert("Greška pri učitavanju rezervacija.");
      }
    });
  }

  handleSearch(text: string) {
    const search = text.toLowerCase();
    this.filteredReservations = this.reservations.filter(res => 
      res.BookTitle.toLowerCase().includes(search) || 
      (res.FirstName && res.FirstName.toLowerCase().includes(search)) ||
      (res.LastName && res.LastName.toLowerCase().includes(search)) ||
      res.Status.toLowerCase().includes(search)
    );
  }

  updateStatus(id: number, newStatus: string) {
    this.http.put(`${this.crudUrl}/${id}`, { Status: newStatus }).subscribe({
      next: () => this.loadReservations(),
      error: (err) => alert("Greška: " + err.message)
    });
  }

  deleteReservation(id: number) {
    if (confirm("Jeste li sigurni da želite obrisati ovu rezervaciju?")) {
      this.http.delete(`${this.crudUrl}/${id}`).subscribe({
        next: () => this.loadReservations(),
        error: () => alert("Greška pri brisanju.")
      });
    }
  }
}