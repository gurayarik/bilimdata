import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-privacy',
  standalone: true,
  template: `
    <section class="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <div class="rounded-2xl bg-gradient-to-br from-brand-900 to-brand-800 px-6 py-8 text-white shadow-md sm:px-8">
        <p class="text-xs font-semibold uppercase tracking-wide text-white/60">BilimData</p>
        <h1 class="mt-1 text-2xl font-bold sm:text-3xl">
          {{ translate.currentLang() === 'en' ? 'Privacy Policy' : 'Gizlilik Politikası' }}
        </h1>
        <p class="mt-2 text-sm text-white/70">
          {{ translate.currentLang() === 'en' ? 'Last updated: August 24, 2026' : 'Son güncelleme: 24 Ağustos 2026' }}
        </p>
      </div>

      <div class="prose-legal mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        @if (translate.currentLang() === 'en') {
          <div class="flex flex-col gap-6 text-sm leading-relaxed text-slate-700">
            <p>
              This Privacy Policy explains how BilimData ("we", "us", "the platform") collects, uses, stores and
              protects your personal data when you use our website and services. By using BilimData, you agree to
              the practices described in this policy.
            </p>

            <div>
              <h2 class="text-lg font-bold text-brand-900">1. Data We Collect</h2>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>
                  <strong>Account information:</strong> your name, email address, and profile photo, collected either
                  when you register with email/password or when you sign in with Google.
                </li>
                <li>
                  <strong>Course activity:</strong> which courses you enroll in, your lesson progress, quiz results,
                  and certificates you earn.
                </li>
                <li>
                  <strong>Course assistant conversations:</strong> messages you send to the course-specific AI chat
                  assistant and the AI progress coach, together with a daily usage counter used to enforce a fair-use
                  message limit.
                </li>
                <li>
                  <strong>Reviews and blog content:</strong> ratings, comments, and blog posts you choose to publish.
                </li>
                <li>
                  <strong>Technical data:</strong> browser language preference and authentication session
                  information, stored locally in your browser or as a secure session token.
                </li>
              </ul>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">2. How We Use Your Data</h2>
              <p class="mt-2">We use your data to:</p>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>Create and manage your account and authenticate you securely;</li>
                <li>Grant access to the courses you are enrolled in and track your learning progress;</li>
                <li>Generate AI-powered features such as course chat answers, progress recaps, and practice quizzes;</li>
                <li>Issue completion certificates when you finish a course;</li>
                <li>Communicate with you about your account, enrollments, or platform updates;</li>
                <li>Improve the quality, security, and usability of our services.</li>
              </ul>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">3. Third-Party Services We Use</h2>
              <p class="mt-2">To operate BilimData, we rely on the following third-party service providers:</p>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>
                  <strong>Supabase</strong> — database hosting, authentication (including Google sign-in), and file
                  storage for cover images and avatars.
                </li>
                <li>
                  <strong>YouTube (Google)</strong> — all course videos are embedded from YouTube. Watching a video
                  is subject to YouTube's own Privacy Policy and Terms of Service.
                </li>
                <li>
                  <strong>AI providers (Anthropic, OpenAI, and/or DeepSeek)</strong> — when you use the course chat
                  assistant, progress coach, or quiz generator, the relevant course context and your message are sent
                  to one of these providers to generate a response. We do not send your account password or payment
                  details to any AI provider.
                </li>
              </ul>
              <p class="mt-2">
                We do not sell your personal data to third parties, and we only share data with the providers above
                to the extent necessary to operate the features described in this policy.
              </p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">4. Cookies and Local Storage</h2>
              <p class="mt-2">
                We use your browser's local storage to remember your language preference and to keep you signed in
                between visits. We do not use third-party advertising or tracking cookies.
              </p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">5. Data Retention</h2>
              <p class="mt-2">
                We retain your account and course data for as long as your account remains active. You may request
                deletion of your account and associated personal data at any time by contacting us; some records
                (such as issued certificates or transaction history) may be retained where required for legal or
                accounting purposes.
              </p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">6. Your Rights (KVKK / GDPR)</h2>
              <p class="mt-2">
                If you are located in Türkiye, you have rights under the Personal Data Protection Law No. 6698
                (KVKK); if you are located in the European Economic Area, you have rights under the GDPR. In both
                cases, you may request to:
              </p>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>Learn whether your personal data is being processed;</li>
                <li>Request access to, correction of, or deletion of your personal data;</li>
                <li>Object to processing that you believe is unlawful;</li>
                <li>Withdraw consent where processing is based on consent.</li>
              </ul>
              <p class="mt-2">To exercise these rights, please contact us using the details below.</p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">7. Children's Privacy</h2>
              <p class="mt-2">
                BilimData is not directed at children under 13. If you believe a child has provided us with personal
                data without parental consent, please contact us so we can remove it.
              </p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">8. Changes to This Policy</h2>
              <p class="mt-2">
                We may update this Privacy Policy from time to time. Material changes will be reflected by updating
                the "Last updated" date at the top of this page.
              </p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">9. Contact</h2>
              <p class="mt-2">
                If you have any questions about this Privacy Policy or wish to exercise your data rights, please
                contact us through the contact channels listed on our website.
              </p>
            </div>
          </div>
        } @else {
          <div class="flex flex-col gap-6 text-sm leading-relaxed text-slate-700">
            <p>
              Bu Gizlilik Politikası, BilimData ("biz", "platform") olarak web sitemizi ve hizmetlerimizi kullanırken
              kişisel verilerinizi nasıl topladığımızı, kullandığımızı, sakladığımızı ve koruduğumuzu açıklar.
              BilimData'yı kullanarak bu politikada açıklanan uygulamaları kabul etmiş olursunuz.
            </p>

            <div>
              <h2 class="text-lg font-bold text-brand-900">1. Topladığımız Veriler</h2>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>
                  <strong>Hesap bilgileri:</strong> e-posta/şifre ile kayıt olduğunuzda ya da Google ile giriş
                  yaptığınızda toplanan ad-soyad, e-posta adresi ve profil fotoğrafınız.
                </li>
                <li>
                  <strong>Eğitim etkinliği:</strong> kayıtlı olduğunuz eğitimler, ders ilerlemeniz, sınav sonuçlarınız
                  ve kazandığınız sertifikalar.
                </li>
                <li>
                  <strong>Kurs asistanı sohbetleri:</strong> kursa özel yapay zeka sohbet asistanına ve ilerleme
                  koçuna gönderdiğiniz mesajlar ile adil kullanım limitini uygulamak için tutulan günlük kullanım
                  sayacı.
                </li>
                <li><strong>Yorumlar ve blog içerikleri:</strong> yayımlamayı tercih ettiğiniz puanlar, yorumlar ve blog yazıları.</li>
                <li>
                  <strong>Teknik veriler:</strong> tarayıcınızda yerel olarak saklanan dil tercihiniz ve güvenli bir
                  oturum belirteci (token) şeklinde tutulan giriş oturumu bilgisi.
                </li>
              </ul>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">2. Verilerinizi Nasıl Kullanıyoruz</h2>
              <p class="mt-2">Verilerinizi şu amaçlarla kullanıyoruz:</p>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>Hesabınızı oluşturmak, yönetmek ve güvenli şekilde kimliğinizi doğrulamak;</li>
                <li>Kayıtlı olduğunuz eğitimlere erişim sağlamak ve öğrenme ilerlemenizi takip etmek;</li>
                <li>Kurs sohbeti yanıtları, ilerleme özetleri ve alıştırma sınavları gibi yapay zeka destekli özellikleri üretmek;</li>
                <li>Bir eğitimi tamamladığınızda tamamlama sertifikası düzenlemek;</li>
                <li>Hesabınız, kayıtlarınız veya platform güncellemeleri hakkında sizinle iletişim kurmak;</li>
                <li>Hizmetlerimizin kalitesini, güvenliğini ve kullanılabilirliğini artırmak.</li>
              </ul>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">3. Kullandığımız Üçüncü Taraf Hizmetler</h2>
              <p class="mt-2">BilimData'yı işletmek için aşağıdaki üçüncü taraf hizmet sağlayıcılardan yararlanıyoruz:</p>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>
                  <strong>Supabase</strong> — veritabanı barındırma, kimlik doğrulama (Google ile giriş dahil) ve
                  kapak görselleri/profil fotoğrafları için dosya depolama.
                </li>
                <li>
                  <strong>YouTube (Google)</strong> — tüm eğitim videoları YouTube üzerinden gömülü olarak
                  sunulmaktadır. Bir videoyu izlemeniz YouTube'un kendi Gizlilik Politikası ve Kullanım Şartları'na
                  tabidir.
                </li>
                <li>
                  <strong>Yapay zeka sağlayıcıları (Anthropic, OpenAI ve/veya DeepSeek)</strong> — kurs sohbet
                  asistanını, ilerleme koçunu veya sınav oluşturucuyu kullandığınızda, ilgili kurs bağlamı ve
                  mesajınız bir yanıt üretmek üzere bu sağlayıcılardan birine gönderilir. Hesap şifreniz veya ödeme
                  bilgileriniz hiçbir yapay zeka sağlayıcısına gönderilmez.
                </li>
              </ul>
              <p class="mt-2">
                Kişisel verilerinizi üçüncü taraflara satmıyoruz; verileri yalnızca bu politikada açıklanan
                özellikleri sunmak için gerekli ölçüde yukarıdaki sağlayıcılarla paylaşıyoruz.
              </p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">4. Çerezler ve Yerel Depolama</h2>
              <p class="mt-2">
                Dil tercihinizi hatırlamak ve ziyaretler arasında oturumunuzu açık tutmak için tarayıcınızın yerel
                depolama alanını kullanıyoruz. Üçüncü taraf reklam veya izleme çerezleri kullanmıyoruz.
              </p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">5. Verilerin Saklanma Süresi</h2>
              <p class="mt-2">
                Hesap ve eğitim verilerinizi hesabınız aktif olduğu sürece saklarız. Bizimle iletişime geçerek
                istediğiniz zaman hesabınızın ve ilişkili kişisel verilerinizin silinmesini talep edebilirsiniz;
                düzenlenmiş sertifikalar veya işlem geçmişi gibi bazı kayıtlar yasal veya muhasebe yükümlülükleri
                nedeniyle saklanmaya devam edebilir.
              </p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">6. Haklarınız (KVKK)</h2>
              <p class="mt-2">
                6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında, kişisel veri sahibi olarak
                aşağıdaki haklara sahipsiniz:
              </p>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme;</li>
                <li>Kişisel verilerinize erişim, düzeltme veya silinmesini talep etme;</li>
                <li>Hukuka aykırı olduğunu düşündüğünüz bir işleme itiraz etme;</li>
                <li>İşlemenin rızaya dayandığı durumlarda rızanızı geri çekme.</li>
              </ul>
              <p class="mt-2">Bu haklarınızı kullanmak için aşağıdaki iletişim bilgilerinden bize ulaşabilirsiniz.</p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">7. Çocukların Gizliliği</h2>
              <p class="mt-2">
                BilimData, 13 yaşın altındaki çocuklara yönelik değildir. Bir çocuğun ebeveyn izni olmadan bize
                kişisel veri sağladığını düşünüyorsanız, bu veriyi kaldırabilmemiz için lütfen bizimle iletişime
                geçin.
              </p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">8. Bu Politikadaki Değişiklikler</h2>
              <p class="mt-2">
                Bu Gizlilik Politikası'nı zaman zaman güncelleyebiliriz. Önemli değişiklikler, bu sayfanın en üstünde
                yer alan "Son güncelleme" tarihinin güncellenmesiyle yansıtılacaktır.
              </p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">9. İletişim</h2>
              <p class="mt-2">
                Bu Gizlilik Politikası hakkında sorularınız varsa veya veri haklarınızı kullanmak istiyorsanız,
                lütfen web sitemizde yer alan iletişim kanalları üzerinden bize ulaşın.
              </p>
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class PrivacyComponent implements OnInit {
  constructor(
    public readonly translate: TranslateService,
    private readonly seo: SeoService
  ) {}

  ngOnInit() {
    this.seo.setTitle('Gizlilik Politikası');
    this.seo.setDescription('BilimData gizlilik politikası — kişisel verilerinizin nasıl işlendiği.');
    this.seo.setCanonical('/privacy');
  }
}
