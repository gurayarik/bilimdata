import { Injectable } from '@angular/core';
import { Category } from '../models/category.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private readonly api: ApiService) {}

  list() {
    return this.api.get<Category[]>('/categories');
  }
}
