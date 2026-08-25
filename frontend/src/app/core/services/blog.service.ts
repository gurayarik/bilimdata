import { Injectable } from '@angular/core';
import { BlogComment, BlogLikes, BlogPost } from '../models/blog.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class BlogService {
  constructor(private readonly api: ApiService) {}

  list() {
    return this.api.get<BlogPost[]>('/blog');
  }

  getBySlug(slug: string) {
    return this.api.get<BlogPost>(`/blog/${slug}`);
  }

  getComments(postId: string) {
    return this.api.get<BlogComment[]>(`/blog/${postId}/comments`);
  }

  addComment(postId: string, content: string) {
    return this.api.post<BlogComment>(`/blog/${postId}/comments`, { content });
  }

  deleteComment(commentId: string) {
    return this.api.delete<{ ok: boolean }>(`/blog/comments/${commentId}`);
  }

  getLikes(postId: string) {
    return this.api.get<BlogLikes>(`/blog/${postId}/likes`);
  }

  toggleLike(postId: string) {
    return this.api.post<{ liked: boolean; count: number }>(`/blog/${postId}/like`, {});
  }

  myPosts() {
    return this.api.get<BlogPost[]>('/blog/my-posts');
  }

  createMyPost(payload: Partial<BlogPost>) {
    return this.api.post<BlogPost>('/blog/my-posts', payload);
  }

  uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post<{ url: string }>('/blog/upload-image', formData);
  }
}
