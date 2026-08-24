import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
}

export interface ProfileUpdate {
  full_name?: string;
  avatar_url?: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private readonly api: ApiService) {}

  getMine() {
    return this.api.get<Profile>('/profiles/me');
  }

  updateMine(update: ProfileUpdate) {
    return this.api.patch<Profile>('/profiles/me', update);
  }
}
