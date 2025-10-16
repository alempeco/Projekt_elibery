import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');

    if (token) {
      return true; // korisnik ima token → pusti ga
    } else {
      this.router.navigate(['/login']); // ako nema token → vrati ga na login
      return false;
    }
  }
}
