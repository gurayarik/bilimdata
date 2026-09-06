import { Injectable } from '@angular/core';
import {
  LearningPath,
  LearningPathDetail,
  PathMyProgressSummary,
  PathProgress,
} from '../models/path.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class PathService {
  constructor(private readonly api: ApiService) {}

  list() {
    return this.api.get<LearningPath[]>('/paths');
  }

  getBySlug(slug: string) {
    return this.api.get<LearningPathDetail>(`/paths/${slug}`);
  }

  getMyProgress(slug: string) {
    return this.api.get<PathProgress>(`/paths/${slug}/my-progress`);
  }

  markArticleComplete(pathSlug: string, articleSlug: string, completed: boolean) {
    return this.api.post<PathProgress>(`/paths/${pathSlug}/articles/${articleSlug}/complete`, {
      completed,
    });
  }

  myProgressAll() {
    return this.api.get<PathMyProgressSummary[]>('/paths/my-progress');
  }
}
