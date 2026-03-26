import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * @deprecated The adaptive layout coordination has been reverted at user request.
 * Use standard mat-sidenav behavior instead.
 */
@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private isEditorDrawerOpenSubject = new BehaviorSubject<boolean>(false);
  isEditorDrawerOpen$ = this.isEditorDrawerOpenSubject.asObservable();

  setEditorDrawerOpen(isOpen: boolean): void {
    this.isEditorDrawerOpenSubject.next(isOpen);
  }
}
