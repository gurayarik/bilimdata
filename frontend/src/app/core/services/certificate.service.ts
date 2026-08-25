import { Injectable } from '@angular/core';
import { Certificate } from '../models/certificate.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CertificateService {
  constructor(private readonly api: ApiService) {}

  mine() {
    return this.api.get<Certificate[]>('/certificates/me');
  }

  issue(courseId: string) {
    return this.api.post<{ pdf_url: string }>(`/certificates/${courseId}/issue`, {});
  }
}
