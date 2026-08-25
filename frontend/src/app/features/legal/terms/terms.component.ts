import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-terms',
  standalone: true,
  template: `
    <section class="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <div class="rounded-2xl bg-gradient-to-br from-brand-900 to-brand-800 px-6 py-8 text-white shadow-md sm:px-8">
        <p class="text-xs font-semibold uppercase tracking-wide text-white/60">BilimData</p>
        <h1 class="mt-1 text-2xl font-bold sm:text-3xl">
          {{ translate.currentLang() === 'en' ? 'Terms of Use' : 'Kullanım Koşulları' }}
        </h1>
        <p class="mt-2 text-sm text-white/70">
          {{ translate.currentLang() === 'en' ? 'Last updated: August 24, 2026' : 'Son güncelleme: 24 Ağustos 2026' }}
        </p>
      </div>

      <div class="prose-legal mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        @if (translate.currentLang() === 'en') {
          <div class="flex flex-col gap-6 text-sm leading-relaxed text-slate-700">
            <p>
              These Terms of Use ("Terms") govern your access to and use of BilimData (the "Platform"). By creating
              an account or using the Platform, you agree to be bound by these Terms. If you do not agree, please do
              not use the Platform.
            </p>

            <div>
              <h2 class="text-lg font-bold text-brand-900">1. Eligibility and Accounts</h2>
              <p class="mt-2">
                You must provide accurate information when creating an account, either via email/password or Google
                sign-in. You are responsible for keeping your account credentials confidential and for all activity
                that occurs under your account. Accounts may not be shared or transferred.
              </p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">2. Course Access</h2>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>Anyone may browse the course catalog and course detail pages without an account.</li>
                <li>Lessons marked as "preview" can be watched by anyone, including visitors without an account.</li>
                <li>
                  All other lessons require an active account and an enrollment record with a verified payment
                  status ("paid", "free", or "coupon") for that specific course.
                </li>
                <li>
                  Where a course is currently offered free of charge or through a manual enrollment process, access
                  is granted after your enrollment request is recorded and, where applicable, approved by an
                  administrator.
                </li>
                <li>
                  Some courses on the Platform are promotions for courses hosted on third-party platforms (such as
                  Udemy or other providers) created by instructors or by BilimData itself. Purchasing or accessing
                  those courses happens entirely on the third-party platform, under that platform's own terms; we
                  are not responsible for the content, delivery, pricing, or support of externally hosted courses.
                </li>
              </ul>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">3. Coupons and Pricing</h2>
              <p class="mt-2">
                Coupon codes displayed on the Platform (including on the Deals page) are provided for convenience and
                may be limited in quantity, validity period, or scope. We do not guarantee that a coupon will remain
                valid at the time you attempt to use it, especially for coupons belonging to third-party platforms.
              </p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">4. AI-Generated Content</h2>
              <p class="mt-2">
                Certain features — including the course chat assistant, the AI progress coach, and automatically
                generated practice quizzes — are produced by artificial intelligence models based on course
                curriculum data. This content is provided for informational and study purposes only, may contain
                inaccuracies, and does not replace the instructor's actual course material. Quiz results generated
                by this feature are not used to gate access to any content and do not constitute an official
                assessment or certification. To keep this feature available to everyone, course chat usage is
                subject to a daily message limit per user.
              </p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">5. User Content</h2>
              <p class="mt-2">
                If you submit reviews, ratings, or blog posts, you retain ownership of that content but grant
                BilimData a non-exclusive, worldwide license to display, distribute, and promote it on the Platform.
                You are solely responsible for the content you submit and confirm that it does not infringe on the
                rights of any third party or violate applicable law. We may remove content that violates these Terms
                without prior notice.
              </p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">6. Instructor Content and Course Promotion</h2>
              <p class="mt-2">
                Approved instructors may create and manage their own courses on the Platform, or promote courses they
                offer on other platforms (subject to Section 2 above). Instructors are responsible for the accuracy
                of the information they submit, including pricing, curriculum, and any coupon codes or external
                links they provide.
              </p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">7. Prohibited Conduct</h2>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>Sharing your account credentials or granting unauthorized users access to paid content;</li>
                <li>Downloading, redistributing, or publicly re-uploading course videos or materials;</li>
                <li>Using automated tools to scrape, abuse, or overload the Platform or its AI features;</li>
                <li>Uploading unlawful, infringing, or harmful content through reviews or blog posts;</li>
                <li>Attempting to bypass access controls for lessons you are not enrolled in.</li>
              </ul>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">8. Third-Party Services</h2>
              <p class="mt-2">
                The Platform uses YouTube to host and embed all video content, Supabase for authentication and data
                storage, and third-party AI providers to power certain features. Your use of these embedded or
                connected services is also subject to their respective terms and policies.
              </p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">9. Disclaimer and Limitation of Liability</h2>
              <p class="mt-2">
                The Platform and its content are provided "as is" without warranties of any kind. To the fullest
                extent permitted by law, BilimData shall not be liable for indirect, incidental, or consequential
                damages arising from your use of the Platform, including reliance on AI-generated content or issues
                with courses hosted on third-party platforms.
              </p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">10. Changes to These Terms</h2>
              <p class="mt-2">
                We may update these Terms from time to time. Continued use of the Platform after changes take effect
                constitutes acceptance of the revised Terms. Material changes will be reflected by updating the "Last
                updated" date at the top of this page.
              </p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">11. Governing Law</h2>
              <p class="mt-2">
                These Terms are governed by the laws of the Republic of Türkiye. Any disputes arising from these
                Terms shall be subject to the exclusive jurisdiction of the competent courts of Türkiye.
              </p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">12. Contact</h2>
              <p class="mt-2">
                If you have questions about these Terms, please contact us through the contact channels listed on
                our website.
              </p>
            </div>
          </div>
        } @else {
          <div class="flex flex-col gap-6 text-sm leading-relaxed text-slate-700">
            <p>
              Bu Kullanım Koşulları ("Koşullar"), BilimData'ya ("Platform") erişiminizi ve Platform'u kullanımınızı
              düzenler. Bir hesap oluşturarak veya Platform'u kullanarak bu Koşullar'a bağlı kalmayı kabul etmiş
              olursunuz. Kabul etmiyorsanız lütfen Platform'u kullanmayın.
            </p>

            <div>
              <h2 class="text-lg font-bold text-brand-900">1. Uygunluk ve Hesaplar</h2>
              <p class="mt-2">
                E-posta/şifre ile ya da Google ile giriş yaparak hesap oluştururken doğru bilgiler sağlamalısınız.
                Hesap bilgilerinizin gizliliğinden ve hesabınız altında gerçekleşen tüm faaliyetlerden siz
                sorumlusunuz. Hesaplar başkalarıyla paylaşılamaz veya devredilemez.
              </p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">2. Eğitimlere Erişim</h2>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>Herkes, hesap oluşturmadan eğitim kataloğunu ve kurs detay sayfalarını görüntüleyebilir.</li>
                <li>"Önizleme" olarak işaretlenmiş dersler, hesabı olmayan ziyaretçiler dahil herkes tarafından izlenebilir.</li>
                <li>
                  Diğer tüm dersler, aktif bir hesap ve ilgili eğitim için doğrulanmış bir ödeme statüsüne
                  ("paid", "free" veya "coupon") sahip bir kayıt gerektirir.
                </li>
                <li>
                  Bir eğitim şu anda ücretsiz sunuluyorsa veya manuel kayıt süreciyle işletiliyorsa, erişim kayıt
                  talebiniz kaydedildikten ve gerekli durumlarda bir yönetici tarafından onaylandıktan sonra
                  verilir.
                </li>
                <li>
                  Platform'daki bazı eğitimler; eğitmenler veya BilimData tarafından oluşturulmuş, Udemy gibi üçüncü
                  taraf platformlarda barındırılan eğitimlerin tanıtımlarıdır. Bu eğitimlerin satın alınması veya
                  erişimi tamamen ilgili üçüncü taraf platform üzerinde ve o platformun kendi koşullarına tabi olarak
                  gerçekleşir; harici platformlarda barındırılan eğitimlerin içeriğinden, sunumundan, fiyatlandırmasından
                  veya desteğinden sorumlu değiliz.
                </li>
              </ul>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">3. Kupon Kodları ve Fiyatlandırma</h2>
              <p class="mt-2">
                Platform üzerinde (Fırsatlar sayfası dahil) gösterilen kupon kodları kolaylık amacıyla sunulmaktadır
                ve miktar, geçerlilik süresi veya kapsam açısından sınırlı olabilir. Özellikle üçüncü taraf
                platformlara ait kuponların, kullanmayı denediğiniz anda hâlâ geçerli olacağını garanti etmiyoruz.
              </p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">4. Yapay Zeka Tarafından Üretilen İçerik</h2>
              <p class="mt-2">
                Kurs sohbet asistanı, yapay zeka ilerleme koçu ve otomatik oluşturulan alıştırma sınavları gibi bazı
                özellikler, eğitim müfredat verilerine dayanılarak yapay zeka modelleri tarafından üretilmektedir. Bu
                içerikler yalnızca bilgilendirme ve çalışma amaçlıdır, hatalar içerebilir ve eğitmenin gerçek eğitim
                materyalinin yerini tutmaz. Bu özellik tarafından üretilen sınav sonuçları herhangi bir içeriğe
                erişimi kısıtlamak için kullanılmaz ve resmi bir değerlendirme veya sertifikasyon niteliği taşımaz.
                Bu özelliği herkes için kullanılabilir tutmak amacıyla, kurs sohbeti kullanımı kullanıcı başına
                günlük bir mesaj limitine tabidir.
              </p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">5. Kullanıcı İçerikleri</h2>
              <p class="mt-2">
                Yorum, değerlendirme veya blog yazısı gönderdiğinizde, bu içeriğin sahipliği sizde kalır ancak
                BilimData'ya bu içeriği Platform üzerinde gösterme, dağıtma ve tanıtma konusunda münhasır olmayan,
                dünya çapında bir lisans vermiş olursunuz. Gönderdiğiniz içerikten tamamen siz sorumlusunuz ve bu
                içeriğin üçüncü tarafların haklarını ihlal etmediğini veya yürürlükteki mevzuata aykırı olmadığını
                onaylarsınız. Bu Koşullar'ı ihlal eden içerikleri önceden bildirimde bulunmaksızın kaldırabiliriz.
              </p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">6. Eğitmen İçeriği ve Eğitim Tanıtımı</h2>
              <p class="mt-2">
                Onaylanmış eğitmenler, Platform üzerinde kendi eğitimlerini oluşturup yönetebilir veya (yukarıdaki
                2. Madde'ye tabi olarak) başka platformlarda sundukları eğitimleri tanıtabilir. Eğitmenler; fiyat,
                müfredat ve sağladıkları kupon kodları veya harici bağlantılar dahil olmak üzere gönderdikleri
                bilgilerin doğruluğundan sorumludur.
              </p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">7. Yasaklı Davranışlar</h2>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>Hesap bilgilerinizi paylaşmak veya yetkisiz kullanıcılara ücretli içeriğe erişim sağlamak;</li>
                <li>Eğitim videolarını veya materyallerini indirmek, yeniden dağıtmak veya kamuya açık şekilde yeniden yüklemek;</li>
                <li>Platform'u veya yapay zeka özelliklerini kazımak, kötüye kullanmak veya aşırı yüklemek için otomatik araçlar kullanmak;</li>
                <li>Yorumlar veya blog yazıları aracılığıyla hukuka aykırı, ihlal edici veya zararlı içerik yüklemek;</li>
                <li>Kayıtlı olmadığınız derslerin erişim kontrollerini aşmaya çalışmak.</li>
              </ul>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">8. Üçüncü Taraf Hizmetler</h2>
              <p class="mt-2">
                Platform; tüm video içeriğini barındırmak ve göstermek için YouTube'u, kimlik doğrulama ve veri
                depolama için Supabase'i ve belirli özellikleri desteklemek için üçüncü taraf yapay zeka
                sağlayıcılarını kullanır. Bu gömülü veya bağlı hizmetleri kullanımınız, ilgili hizmetlerin kendi
                koşullarına ve politikalarına da tabidir.
              </p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">9. Sorumluluk Reddi ve Sınırlaması</h2>
              <p class="mt-2">
                Platform ve içeriği "olduğu gibi" sunulmaktadır, herhangi bir garanti verilmemektedir. Yürürlükteki
                mevzuatın izin verdiği azami ölçüde, BilimData; Platform'u kullanımınızdan, yapay zeka tarafından
                üretilen içeriğe güvenmenizden veya üçüncü taraf platformlarda barındırılan eğitimlerle ilgili
                sorunlardan kaynaklanan dolaylı, arızi veya sonuç olarak ortaya çıkan zararlardan sorumlu değildir.
              </p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">10. Bu Koşullardaki Değişiklikler</h2>
              <p class="mt-2">
                Bu Koşullar'ı zaman zaman güncelleyebiliriz. Değişiklikler yürürlüğe girdikten sonra Platform'u
                kullanmaya devam etmeniz, güncellenmiş Koşullar'ı kabul ettiğiniz anlamına gelir. Önemli
                değişiklikler, bu sayfanın en üstünde yer alan "Son güncelleme" tarihinin güncellenmesiyle
                yansıtılacaktır.
              </p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">11. Uygulanacak Hukuk</h2>
              <p class="mt-2">
                Bu Koşullar, Türkiye Cumhuriyeti kanunlarına tabidir. Bu Koşullar'dan doğan uyuşmazlıklarda
                Türkiye'deki yetkili mahkemeler münhasıran yetkilidir.
              </p>
            </div>

            <div>
              <h2 class="text-lg font-bold text-brand-900">12. İletişim</h2>
              <p class="mt-2">
                Bu Koşullar hakkında sorularınız varsa, lütfen web sitemizde yer alan iletişim kanalları üzerinden
                bize ulaşın.
              </p>
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class TermsComponent {
  constructor(public readonly translate: TranslateService) {}
}
