import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InstructorApplication } from '../../../core/models/instructor-application.model';
import { InstructorService } from '../../../core/services/instructor.service';

@Component({
  selector: 'app-instructor-apply',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="mx-auto max-w-lg px-4 py-12">
      <h1 class="text-2xl font-bold text-brand-900">Eğitmen Ol</h1>

      @if (loading) {
        <p class="mt-6 text-slate-500">Yükleniyor...</p>
      } @else if (application) {
        @switch (application.status) {
          @case ('pending') {
            <p class="mt-6 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Başvurunuz alındı ve inceleniyor. Onaylandığında size haber verilecek.
            </p>
          }
          @case ('approved') {
            <p class="mt-6 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Tebrikler, eğitmen başvurunuz onaylandı! Artık
              <a routerLink="/instructor/courses" class="font-semibold underline">kurslarım</a>
              sayfasından kendi kurslarınızı oluşturabilirsiniz.
            </p>
          }
          @case ('rejected') {
            <p class="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              Başvurunuz şu an için onaylanmadı. Sorularınız için bizimle iletişime geçebilirsiniz.
            </p>
          }
        }
      } @else {
        <p class="mt-3 text-sm text-slate-600">
          Kendi ders içeriklerinizi (video + PDF/slayt materyalleri) platformumuzda yayınlamak ister
          misiniz? Aşağıdaki formu doldurup başvurabilirsiniz.
        </p>

        <form class="mt-6 flex flex-col gap-4" (ngSubmit)="submit()">
          <label class="flex flex-col gap-1 text-sm">
            Unvan / Uzmanlık Alanı
            <input
              class="rounded-md border border-slate-300 px-3 py-2"
              [(ngModel)]="title"
              name="title"
              placeholder="Örn. Kıdemli Yazılım Geliştirici"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            Kendinizden Bahsedin
            <textarea
              class="rounded-md border border-slate-300 px-3 py-2"
              rows="4"
              [(ngModel)]="bio"
              name="bio"
            ></textarea>
          </label>

          <div class="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            <strong>KVKK Aydınlatma Metni (özet):</strong> Başvurunuz kapsamında paylaştığınız ad,
            e-posta, unvan ve biyografi bilgileriniz, eğitmen başvurunuzun değerlendirilmesi ve
            onaylanması durumunda platformda eğitmen profilinizin oluşturulması amacıyla
            işlenecektir. Bilgileriniz yalnızca bu amaçla kullanılır ve üçüncü taraflarla
            paylaşılmaz.
          </div>
          <label class="flex items-start gap-2 text-sm">
            <input type="checkbox" class="mt-1" [(ngModel)]="kvkkConsent" name="kvkkConsent" required />
            <span>Yukarıdaki KVKK aydınlatma metnini okudum, kişisel verilerimin bu kapsamda işlenmesini kabul ediyorum.</span>
          </label>

          @if (errorMessage) {
            <p class="text-sm text-red-600">{{ errorMessage }}</p>
          }

          <button
            type="submit"
            [disabled]="!kvkkConsent || submitting"
            class="rounded-md bg-accent-500 py-2.5 font-semibold text-brand-900 hover:bg-accent-600 disabled:opacity-50"
          >
            Başvuruyu Gönder
          </button>
        </form>
      }
    </section>
  `,
})
export class InstructorApplyComponent implements OnInit {
  loading = true;
  application: InstructorApplication | null = null;
  title = '';
  bio = '';
  kvkkConsent = false;
  submitting = false;
  errorMessage = '';

  constructor(private readonly instructorService: InstructorService) {}

  ngOnInit() {
    this.instructorService.myApplication().subscribe({
      next: (application) => {
        this.application = application;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  submit() {
    this.submitting = true;
    this.errorMessage = '';
    this.instructorService
      .apply({ title: this.title, bio: this.bio, kvkk_consent: this.kvkkConsent })
      .subscribe({
        next: (application) => {
          this.submitting = false;
          this.application = application;
        },
        error: (err) => {
          this.submitting = false;
          this.errorMessage = err?.error?.detail || 'Başvuru gönderilemedi';
        },
      });
  }
}
