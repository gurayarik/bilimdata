import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface ContactMessagePayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  constructor(private readonly api: ApiService) {}

  submit(payload: ContactMessagePayload) {
    return this.api.post<{ id: string }>('/contact', payload);
  }
}
