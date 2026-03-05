import { useEffect } from 'react';
import { t, getLang } from '../../i18n';

type TermsOfServiceProps = {
  onBack: () => void;
};

export function TermsOfService({ onBack }: TermsOfServiceProps) {
  const isTr = getLang() === 'tr';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sectionStyle: React.CSSProperties = {
    marginBottom: '36px',
  };

  const h2Style: React.CSSProperties = {
    fontSize: '17px',
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: '14px',
    paddingBottom: '10px',
    borderBottom: '2px solid #0f766e',
    display: 'inline-block',
  };

  const pStyle: React.CSSProperties = {
    fontSize: '15px',
    color: '#334155',
    lineHeight: '1.8',
    margin: '0 0 12px 0',
  };

  const liStyle: React.CSSProperties = {
    fontSize: '15px',
    color: '#334155',
    lineHeight: '1.8',
    marginBottom: '8px',
  };

  const backBtn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: '1px solid #e2e8f0',
    borderRadius: '999px',
    padding: '8px 18px',
    fontSize: '14px',
    color: '#0f766e',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: 500,
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Top nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontWeight: 800, fontSize: '1.6rem', color: '#0ea5e9', letterSpacing: '-0.02em' }}>
          XOTIJI
        </span>
        <button onClick={onBack} style={backBtn}>
          ← {t('terms.backToHome')}
        </button>
      </div>

      {/* Page title */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
          {t('footer.terms')}
        </h1>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
          {t('terms.lastUpdated')}: {isTr ? '5 Mart 2026' : 'March 5, 2026'}
        </p>
      </div>

      {/* Content card */}
      <div style={{
        background: 'white',
        borderRadius: '18px',
        padding: '40px',
        boxShadow: '0 4px 20px rgba(15,23,42,0.07)',
      }}>

        {/* 1. Service Description */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>{isTr ? '1. Hizmet Tanımı' : '1. Service Description'}</h2>
          <p style={pStyle}>
            {isTr
              ? 'XOTIJI, xotiji.app adresinde sunulan yapay zeka destekli bir seyahat planlama platformudur. Hizmetimiz; şehir, otel ve deneyim keşfi, AI destekli seyahat önerileri ve kişiselleştirilmiş seyahat paketi oluşturma özelliklerini kapsamaktadır.'
              : 'XOTIJI is an AI-powered travel planning platform available at xotiji.app. Our service includes city, hotel, and experience discovery, AI-driven travel suggestions, and personalized travel package composition.'}
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            {isTr
              ? 'Hizmet, OpenAI API\'si aracılığıyla güçlendirilmiş yapay zeka teknolojisi kullanmaktadır. Sunulan öneriler yalnızca bilgilendirme amaçlıdır; profesyonel seyahat danışmanlığı yerine geçmez.'
              : 'The service uses AI technology powered by the OpenAI API. Suggestions provided are for informational purposes only and do not constitute professional travel advice.'}
          </p>
        </section>

        {/* 2. User Responsibilities */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>{isTr ? '2. Kullanıcı Sorumlulukları' : '2. User Responsibilities'}</h2>
          <p style={pStyle}>
            {isTr
              ? 'Platformumuzu kullanarak aşağıdaki koşulları kabul etmiş olursunuz:'
              : 'By using our platform, you agree to the following:'}
          </p>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            <li style={liStyle}>
              {isTr
                ? 'Hizmeti yalnızca yasal amaçlar için ve bu Kullanım Koşulları\'na uygun şekilde kullanacaksınız.'
                : 'You will use the service only for lawful purposes and in accordance with these Terms.'}
            </li>
            <li style={liStyle}>
              {isTr
                ? 'Platformu zarar verici, yanıltıcı veya kötüye kullanıma yönelik herhangi bir faaliyette kullanmayacaksınız.'
                : 'You will not use the platform for any harmful, deceptive, or abusive activity.'}
            </li>
            <li style={liStyle}>
              {isTr
                ? 'Hizmetin işleyişini bozmaya, güvenliğini tehlikeye atmaya veya yetkisiz erişim elde etmeye çalışmayacaksınız.'
                : 'You will not attempt to disrupt the service, compromise its security, or gain unauthorized access.'}
            </li>
            <li style={liStyle}>
              {isTr
                ? 'AI tarafından oluşturulan seyahat önerilerini nihai kararlarınızda dikkate alırken kendi takdirinizi kullanacaksınız.'
                : 'You will exercise your own judgment when acting on AI-generated travel suggestions.'}
            </li>
            <li style={liStyle}>
              {isTr
                ? 'Girdiğiniz bilgilerin doğruluğundan ve yaptığınız seçimlerin sonuçlarından siz sorumlusunuz.'
                : 'You are responsible for the accuracy of the information you provide and the consequences of the selections you make.'}
            </li>
          </ul>
        </section>

        {/* 3. Intellectual Property */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>{isTr ? '3. Fikri Mülkiyet' : '3. Intellectual Property'}</h2>
          <p style={pStyle}>
            {isTr
              ? 'XOTIJI platformunun kendisi — marka adı, logosu, tasarımı, kullanıcı arayüzü ve kaynak kodu dahil — XOTIJI\'ye aittir ve telif hakkı yasaları kapsamında korunmaktadır.'
              : 'The XOTIJI platform itself — including its brand name, logo, design, user interface, and source code — is owned by XOTIJI and protected under copyright law.'}
          </p>
          <p style={pStyle}>
            {isTr
              ? 'Platform üzerinden sunulan şehir, otel ve deneyim içerikleri kendi telif hakkı sahiplerine aittir. AI tarafından oluşturulan seyahat planları ve öneriler size özel olarak üretilmektedir; ancak bunlar üzerinde ticari kullanım hakkı talep edilemez.'
              : 'City, hotel, and experience content served through the platform belongs to their respective copyright holders. AI-generated travel plans and suggestions are produced specifically for you, but no commercial rights over them may be claimed.'}
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            {isTr
              ? 'Platformun herhangi bir bölümünü önceden yazılı izin almaksızın kopyalamak, dağıtmak veya ticari amaçla kullanmak yasaktır.'
              : 'Reproducing, distributing, or using any part of the platform for commercial purposes without prior written permission is prohibited.'}
          </p>
        </section>

        {/* 4. Limitation of Liability */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>{isTr ? '4. Sorumluluk Sınırlaması' : '4. Limitation of Liability'}</h2>
          <div style={{
            background: '#fefce8',
            border: '1px solid #fde68a',
            borderRadius: '12px',
            padding: '14px 18px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ fontSize: '18px' }}>⚠️</span>
            <p style={{ ...pStyle, marginBottom: 0, color: '#92400e', fontWeight: 600 }}>
              {isTr
                ? 'Hizmet "olduğu gibi" sunulmaktadır; herhangi bir garanti verilmemektedir.'
                : 'The service is provided "as is" without warranties of any kind.'}
            </p>
          </div>
          <p style={pStyle}>
            {isTr
              ? 'XOTIJI, AI tarafından üretilen seyahat önerilerinin doğruluğu, eksiksizliği veya belirli bir amaca uygunluğu konusunda herhangi bir garanti vermemektedir. Nihai seyahat kararları tamamen kullanıcının sorumluluğundadır.'
              : 'XOTIJI makes no warranty regarding the accuracy, completeness, or fitness for a particular purpose of AI-generated travel suggestions. Final travel decisions are entirely the user\'s responsibility.'}
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            {isTr
              ? 'XOTIJI; hizmet kesintileri, veri kayıpları, üçüncü taraf bağlantı arızaları veya platformun kullanımından kaynaklanan dolaylı ya da doğrudan zararlar nedeniyle hiçbir koşulda sorumlu tutulamaz.'
              : 'XOTIJI shall not be liable for service interruptions, data loss, third-party integration failures, or any indirect or direct damages arising from the use of the platform.'}
          </p>
        </section>

        {/* 5. Termination */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>{isTr ? '5. Fesih' : '5. Termination'}</h2>
          <p style={pStyle}>
            {isTr
              ? 'XOTIJI, bu Kullanım Koşulları\'nı ihlal eden veya hizmetin güvenliğini ya da bütünlüğünü tehdit eden kullanıcıların platforma erişimini önceden bildirim yapmaksızın askıya alma veya sonlandırma hakkını saklı tutar.'
              : 'XOTIJI reserves the right to suspend or terminate access to the platform for users who violate these Terms or threaten the security or integrity of the service, without prior notice.'}
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            {isTr
              ? 'Kullanıcılar, hizmeti kullanmayı bırakarak herhangi bir zamanda platformla ilişkilerini sonlandırabilir. Tarayıcı verilerini temizleyerek yerel olarak saklanan tercihlerini (dil seçimi gibi) silebilirler.'
              : 'Users may discontinue their use of the platform at any time. Locally stored preferences (such as language selection) can be removed by clearing browser data.'}
          </p>
        </section>

        {/* 6. Governing Law */}
        <section style={{ ...sectionStyle, marginBottom: 0 }}>
          <h2 style={h2Style}>{isTr ? '6. Geçerli Hukuk' : '6. Governing Law'}</h2>
          <p style={pStyle}>
            {isTr
              ? 'Bu Kullanım Koşulları, Türkiye Cumhuriyeti kanunlarına tabidir ve bu kanunlara göre yorumlanır. Bu koşullardan kaynaklanan her türlü uyuşmazlık için Türkiye mahkemeleri münhasır yargı yetkisine sahiptir.'
              : 'These Terms of Service are governed by and construed in accordance with the laws of the Republic of Turkey. Any disputes arising from these Terms are subject to the exclusive jurisdiction of Turkish courts.'}
          </p>
          <p style={{ ...pStyle, marginBottom: '20px' }}>
            {isTr
              ? 'Bu koşulların herhangi bir hükmünün geçersiz sayılması, diğer hükümlerin geçerliliğini etkilemez.'
              : 'If any provision of these Terms is found to be invalid, the remaining provisions shall remain in full force and effect.'}
          </p>
          <p style={{ ...pStyle, marginBottom: 0, color: '#64748b', fontSize: '14px' }}>
            {isTr
              ? 'Bu Kullanım Koşulları hakkında sorularınız için: '
              : 'For questions about these Terms, contact us at: '}
            <a href="mailto:hello@xotiji.app" style={{ color: '#0ea5e9', textDecoration: 'none', fontWeight: 600 }}>
              hello@xotiji.app
            </a>
          </p>
        </section>
      </div>

      {/* Bottom back button */}
      <div style={{ textAlign: 'center', marginTop: '32px', marginBottom: '8px' }}>
        <button onClick={onBack} style={{ ...backBtn, color: '#64748b', borderColor: '#e2e8f0' }}>
          ← {t('terms.backToHome')}
        </button>
      </div>
    </div>
  );
}
