import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  role = 'student';
  userClass = '';
  message = '';

  constructor(private http: HttpClient, private router: Router) {}

  onRegister() {
    if (!this.firstName || !this.lastName || !this.email || !this.password) {
      this.message = 'Sva polja su obavezna!';
      return;
    }

    const body = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      role: this.role,
      class: this.userClass
    };

    this.http.post('http://localhost:3000/api/register', body).subscribe({
      next: (res: any) => {
        this.message = 'Registracija uspješna!';
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Greška pri registraciji:', err);
        this.message = err.status === 409 ? 'Email već postoji!' : 'Greška na serveru!';
      }
    });
  }
}
