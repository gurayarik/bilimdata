import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminContactMessage } from '../../../core/models/admin.model';
import { AdminService } from '../../../core/services/admin.service';
import { AdminNavComponent } from '../shared/admin-nav.component';

@Component({
  selector: 'app-admin-contact-messages',
  standalone: true,
  imports: [AdminNavComponent, DatePipe, FormsModule],
  template: `
    <section class="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <app-admin-nav />

      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-bold text-brand-900">İletişim Mesajları</h2>
          <p class="mt-1 text-sm text-slate-500">{{ newCount }} yeni · {{ messages.length }} toplam</p>
        </div>
        <div class="flex gap-1 rounded-full border border-slate-200 p-1 text-sm">
          <button
            type="button"
            class="rounded-full px-3 py-1 font-semibold transition"
            [class]="filter === 'all' ? 'bg-brand-900 text-white' : 'text-slate-600 hover:bg-slate-50'"
            (click)="setFilter('all')"
          >
            Tümü
          </button>
          <button
            type="button"
            class="rounded-full px-3 py-1 font-semibold transition"
            [class]="filter === 'new' ? 'bg-brand-900 text-white' : 'text-slate-600 hover:bg-slate-50'"
            (click)="setFilter('new')"
          >
            Yeni
          </button>
          <button
            type="button"
            class="rounded-full px-3 py-1 font-semibold transition"
            [class]="filter === 'answered' ? 'bg-brand-900 text-white' : 'text-slate-600 hover:bg-slate-50'"
            (click)="setFilter('answered')"
          >
            Yanıtlanmış
          </button>
        </div>
      </div>

      @if (messages.length === 0) {
        <div class="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 py-16 text-center">
          <span class="text-4xl">📬</span>
          <p class="text-sm text-slate-500">Bu filtrede mesaj yok.</p>
        </div>
      } @else {
        <div class="mt-6 flex flex-col gap-3">
          @for (msg of messages; track msg.id) {
            <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="flex items-start gap-3">
                  <div
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-500/10 text-base font-bold text-brand-900"
                  >
                    {{ msg.name.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <p class="font-semibold text-brand-900">{{ msg.name }}</p>
                    <p class="text-xs text-slate-500">{{ msg.email }}</p>
                    <p class="mt-0.5 text-xs text-slate-400">{{ msg.created_at | date: 'short' }}</p>
                  </div>
                </div>
                @if (msg.status === 'new') {
                  <span class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">Yeni</span>
                } @else {
                  <span class="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                    >Yanıtlandı</span
                  >
                }
              </div>

              @if (msg.subject) {
                <p class="mt-3 text-sm font-semibold text-brand-900">{{ msg.subject }}</p>
              }
              <p class="mt-1 whitespace-pre-line text-sm text-slate-700">{{ msg.message }}</p>

              @if (msg.admin_reply) {
                <div class="mt-3 rounded-xl bg-slate-50 p-3">
                  <p class="text-xs font-semibold text-slate-500">Yanıtınız ({{ msg.replied_at | date: 'short' }})</p>
                  <p class="mt-1 whitespace-pre-line text-sm text-slate-700">{{ msg.admin_reply }}</p>
                </div>
              }

              <div class="mt-3">
                @if (replyDraft[msg.id] !== undefined) {
                  <div class="flex flex-col gap-2">
                    <textarea
                      class="rounded-md border border-slate-300 px-3 py-2 text-sm"
                      rows="3"
                      [(ngModel)]="replyDraft[msg.id]"
                      [name]="'reply-' + msg.id"
                      placeholder="Kullanıcıya bu adresten (e-posta ile) ileteceğiniz yanıtı buraya not edin..."
                    ></textarea>
                    <div class="flex gap-2">
                      <button
                        type="button"
                        class="rounded-full bg-accent-500 px-4 py-1.5 text-xs font-semibold text-brand-900 hover:bg-accent-600"
                        (click)="sendReply(msg)"
                      >
                        Yanıtı Kaydet
                      </button>
                      <button
                        type="button"
                        class="rounded-full border border-slate-300 px-4 py-1.5 text-xs hover:bg-slate-50"
                        (click)="cancelReply(msg)"
                      >
                        Vazgeç
                      </button>
                    </div>
                  </div>
                } @else {
                  <button
                    type="button"
                    class="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-brand-900 hover:bg-slate-50"
                    (click)="startReply(msg)"
                  >
                    {{ msg.admin_reply ? '✏️ Yanıtı Düzenle' : '↩️ Yanıtla' }}
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }
    </section>
  `,
})
export class AdminContactMessagesComponent implements OnInit {
  allMessages: AdminContactMessage[] = [];
  filter: 'all' | 'new' | 'answered' = 'all';
  replyDraft: Record<string, string> = {};

  constructor(private readonly adminService: AdminService) {}

  ngOnInit() {
    this.load();
  }

  get messages(): AdminContactMessage[] {
    if (this.filter === 'all') return this.allMessages;
    return this.allMessages.filter((m) => m.status === this.filter);
  }

  get newCount(): number {
    return this.allMessages.filter((m) => m.status === 'new').length;
  }

  setFilter(filter: 'all' | 'new' | 'answered') {
    this.filter = filter;
  }

  load() {
    this.adminService.listContactMessages().subscribe((messages) => (this.allMessages = messages));
  }

  startReply(msg: AdminContactMessage) {
    this.replyDraft[msg.id] = msg.admin_reply ?? '';
  }

  cancelReply(msg: AdminContactMessage) {
    delete this.replyDraft[msg.id];
  }

  sendReply(msg: AdminContactMessage) {
    const reply = this.replyDraft[msg.id]?.trim();
    if (!reply) return;
    this.adminService.replyContactMessage(msg.id, reply).subscribe(() => {
      delete this.replyDraft[msg.id];
      this.load();
    });
  }
}
