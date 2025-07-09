import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment.prod";

export interface ProfileUpdateRequest {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: "root",
})
export class ProfileService {
  private apiUrl = environment.apiUrl + "/profile";

  constructor(private http: HttpClient) {}

  updateProfile(profileData: ProfileUpdateRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, profileData);
  }

  changePassword(passwordData: PasswordChangeRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/change-password`, passwordData);
  }
}
