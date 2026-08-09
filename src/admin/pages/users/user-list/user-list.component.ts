import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../services/user.service';
import { User } from '../../../../shared/models/user.model';
import { UserEditDialogComponent } from '../user-edit-dialog/user-edit-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from '../../../services/confirmation.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'name', 'email', 'role', 'status', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<User>();
  isLoading = false;
  error: string | null = null;
  searchTerm = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private translate: TranslateService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = null;

    this.userService.getUsers(1, 100, this.searchTerm).subscribe({
      next: (response) => {
        this.dataSource.data = response.users;
        this.isLoading = false;
      },
      error: (error) => {
        
        this.error = this.translate.instant('ERROR_LOADING_USERS');
        this.snackBar.open(this.translate.instant('ERROR_LOADING_USERS'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.loadUsers();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.loadUsers();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchTerm = filterValue.trim();
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getRoleColor(role: string): string {
    return role === 'admin' ? 'accent' : 'primary';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'primary';
      case 'inactive': return 'warn';
      default: return 'primary';
    }
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
          this.translate.instant(isBlocked ? 'USER_UNBLOCKED_SUCCESSFULLY' : 'USER_BLOCKED_SUCCESSFULLY'),
          this.translate.instant('CLOSE_BTN'),
          { duration: 3000 }
        );
        this.loadUsers();
      },
      error: (error) => {
        
        this.snackBar.open(this.translate.instant('ERROR_UPDATING_USER_STATUS'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      }
    });
  }

  changeUserRole(user: User): void {
    const newRole = user.role === 'admin' ? 'user' : 'admin';

    this.userService.changeUserRole(user.id, newRole).subscribe({
      next: (updatedUser) => {
        this.snackBar.open(this.translate.instant('USER_ROLE_CHANGED', { role: newRole }), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
        this.loadUsers();
      },
      error: (error) => {
        
        this.snackBar.open(this.translate.instant('ERROR_CHANGING_USER_ROLE'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      }
    });
  }

  deleteUser(user: User): void {
    this.confirmationService.confirmDelete(user.name).pipe(take(1)).subscribe((confirmed) => {
      if (confirmed) {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.snackBar.open(this.translate.instant('USER_DELETED_SUCCESSFULLY'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
            this.loadUsers();
          },
          error: (error) => {
            this.snackBar.open(this.translate.instant('ERROR_DELETING_USER'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
          }
        });
      }
    });
  }
}

