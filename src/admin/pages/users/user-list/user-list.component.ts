
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../services/user.service';
import { User } from '../../../../shared/models/user.model';
import { UserEditDialogComponent } from '../user-edit-dialog/user-edit-dialog.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['id', 'name', 'email', 'role', 'status', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<User>();
  
  totalUsers = 0;
  pageSize = 10;
  currentPage = 0;
  searchTerm = '';
  isLoading = false;

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    
    this.userService.getUsers(this.currentPage + 1, this.pageSize, this.searchTerm).subscribe({
      next: (response) => {
        this.dataSource.data = response.users;
        this.totalUsers = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        
        this.snackBar.open('Error loading users', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadUsers();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 0;
    this.loadUsers();
  }

  editUser(user: User): void {
    const dialogRef = this.dialog.open(UserEditDialogComponent, {
      width: '500px',
      data: { user: { ...user } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  toggleUserStatus(user: User): void {
    const isBlocked = user.status === 'inactive';
    const operation = isBlocked ? this.userService.unblockUser(user.id) : this.userService.blockUser(user.id);

    operation.subscribe({
      next: (updatedUser) => {
        this.snackBar.open(
          `User ${isBlocked ? 'unblocked' : 'blocked'} successfully`, 
          'Close', 
          { duration: 3000 }
        );
        this.loadUsers();
      },
      error: (error) => {
        
        this.snackBar.open('Error updating user status', 'Close', { duration: 3000 });
      }
    });
  }

  changeUserRole(user: User): void {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    
    this.userService.changeUserRole(user.id, newRole).subscribe({
      next: (updatedUser) => {
        this.snackBar.open(`User role changed to ${newRole}`, 'Close', { duration: 3000 });
        this.loadUsers();
      },
      error: (error) => {
        
        this.snackBar.open('Error changing user role', 'Close', { duration: 3000 });
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user ${user.name}?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: (error) => {
          
          this.snackBar.open('Error deleting user', 'Close', { duration: 3000 });
        }
      });
    }
  }

  getRoleColor(role: string): string {
    return role === 'admin' ? 'accent' : 'primary';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'primary';
      case 'blocked': return 'warn';
      default: return 'primary';
    }
  }
}
