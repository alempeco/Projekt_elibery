import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  userName = localStorage.getItem('user') 
    ? JSON.parse(localStorage.getItem('user')!).firstName 
    : 'Korisnik';

  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
  navigatetoCategories()
  {
    this.router.navigate(['/categories']);
  }
   navigatetoBooks()
  {
    this.router.navigate(['/books']);
  }
  navigatetoUsers()
  {
    this.router.navigate(['/users']);
  }
}
