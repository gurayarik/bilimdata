import { Injectable } from '@angular/core';
import { ChatMessage, ChatResponse } from '../models/chat.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private readonly api: ApiService) {}

  sendMessage(slug: string, message: string, history: ChatMessage[], uiLanguage: string) {
    return this.api.post<ChatResponse>(`/courses/${slug}/chat`, {
      message,
      history,
      ui_language: uiLanguage,
    });
  }
}
