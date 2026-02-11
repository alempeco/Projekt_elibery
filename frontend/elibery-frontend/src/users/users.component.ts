import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../app/header/header.component';


interface User {
  Id: number;
  FirstName: string;
  LastName: string;
  Email: string;
  Role: string;
  Class: string;
  CreatedAt: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  // 🔥 DODAN HeaderComponent U IMPORTE
  imports: [CommonModule, HeaderComponent], 
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = true;
  error = '';

  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<User[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Greška pri dohvaćanju korisnika:', err);
        this.error = 'Greška pri učitavanju korisnika.';
        this.loading = false;
      }
    });
  }
}