import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { RegisterComponent } from './register/register.component';
import { CategoriesComponent } from './categories/categories.component';
import { BooksComponent } from './books/books.component';
import { UsersComponent } from '../users/users.component';
import { LoansComponent } from './loans/loans.component';
import { ReservationsComponent } from './reservations/reservations.component';

export const routes: Routes = [

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'books', component: BooksComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'users', component: UsersComponent },
      { path: 'loans', component: LoansComponent },
      { path: 'reservations', component: ReservationsComponent },


      { path: '', redirectTo: 'books', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: 'login' }

];
