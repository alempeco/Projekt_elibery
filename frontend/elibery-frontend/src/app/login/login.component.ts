import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.errorMessage = ''; // reset poruke
    this.authService.login(this.email.trim(), this.password.trim()).subscribe({
      next: (res) => {
        // Spremi token i korisnika u localStorage
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));

        // Preusmjeri na home (ili dashboard)
        this.router.navigate(['/dashboard']);

      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Greška pri loginu';
      }
    });
  }
}
