import { useEffect } from 'react';
import { t, getLang } from '../../i18n';

type PrivacyPolicyProps = {
  onBack: () => void;
};

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
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
    borderBottom: '2px solid #0ea5e9',
    display: 'inline-block',
  };

  const pStyle: React.CSSProperties = {
    fontSize: '15px',
    color: '#334155',
    lineHeight: '1.8',
    marginBottom: '12px',
    margin: '0 0 12px 0',
  };

  const liStyle: React.CSSProperties = {
    fontSize: '15px',
    color: '#334155',
    lineHeight: '1.8',
    marginBottom: '8px',
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Top nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontWeight: 800, fontSize: '1.6rem', color: '#0ea5e9', letterSpacing: '-0.02em' }}>
          XOTIJI
        </span>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: '1px solid #e2e8f0',
            borderRadius: '999px',
            padding: '8px 18px',
            fontSize: '14px',
            color: '#0ea5e9',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: 500,
          }}
        >
          ← {t('privacy.backToHome')}
        </button>
      </div>

      {/* Page title */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
          {t('footer.privacy')}
        </h1>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
          {t('privacy.lastUpdated')}: {isTr ? '5 Mart 2026' : 'March 5, 2026'}
        </p>
      </div>

      {/* Content card */}
      <div style={{
        background: 'white',
        borderRadius: '18px',
        padding: '40px',
        boxShadow: '0 4px 20px rgba(15,23,42,0.07)',
      }}>

        {/* 1. Overview */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>{isTr ? '1. Genel Bakış' : '1. Overview'}</h2>
          <p style={pStyle}>
            {isTr
              ? 'XOTIJI ("biz"), xotiji.app adresinde hizmet veren yapay zeka destekli bir seyahat planlama platformudur. Bu Gizlilik Politikası, platformumuzu kullandığınızda bilgilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklamaktadır.'
              : 'XOTIJI ("we", "our") is an AI-powered travel planning platform available at xotiji.app. This Privacy Policy describes how we collect, use, and protect your information when you use our platform.'}
          </p>
        </section>

        {/* 2. Data We Collect */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>{isTr ? '2. Topladığımız Veriler' : '2. Data We Collect'}</h2>
          <p style={pStyle}>
            {isTr
              ? 'Hizmetimizi kullanırken aşağıdaki verileri toplayabiliriz:'
              : 'We may collect the following data when you use our service:'}
          </p>
          <ul style={{ paddingLeft: '20px', margin: '0 0 0 0' }}>
            <li style={liStyle}>
              <strong>{isTr ? 'Seyahat tercihleri:' : 'Travel selections:'}</strong>{' '}
              {isTr
                ? 'Kişiselleştirilmiş seyahat planları oluşturmak amacıyla yaptığınız şehir, otel ve deneyim seçimleri.'
                : 'City, hotel, and experience selections you make to generate personalized travel plans.'}
            </li>
            <li style={liStyle}>
              <strong>{isTr ? 'Dil tercihi:' : 'Language preference:'}</strong>{' '}
              {isTr
                ? 'Seçtiğiniz arayüz dili (Türkçe veya İngilizce) tarayıcınızın yerel depolama alanında (localStorage) saklanır.'
                : "Your selected interface language (Turkish or English) is stored locally in your browser's localStorage."}
            </li>
            <li style={liStyle}>
              <strong>{isTr ? 'Kullanım verileri:' : 'Usage data:'}</strong>{' '}
              {isTr
                ? 'Ziyaret edilen sayfalar ve kullanılan özellikler gibi temel etkileşim verileri barındırma sağlayıcılarımız tarafından toplanabilir.'
                : 'Basic interaction data such as pages visited and features used may be collected by our hosting providers.'}
            </li>
          </ul>
        </section>

        {/* 3. How We Use Your Data */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>{isTr ? '3. Verilerinizi Nasıl Kullanıyoruz' : '3. How We Use Your Data'}</h2>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            <li style={liStyle}>
              {isTr
                ? 'Seçimlerinize göre kişiselleştirilmiş AI seyahat önerileri ve planları oluşturmak için.'
                : 'To generate AI-powered travel suggestions and itineraries tailored to your selections.'}
            </li>
            <li style={liStyle}>
              {isTr
                ? 'Seyahat önerilerinin kalitesini ve alaka düzeyini iyileştirmek için.'
                : 'To improve the quality and relevance of our travel recommendations.'}
            </li>
            <li style={liStyle}>
              {isTr
                ? 'Platformumuzun işlevselliğini ve performansını sürdürmek için.'
                : 'To maintain the functionality and performance of our platform.'}
            </li>
            <li style={liStyle}>
              {isTr
                ? 'Kişisel verilerinizi pazarlama amacıyla üçüncü taraflara satmıyor, kiralamıyor veya paylaşmıyoruz.'
                : 'We do not sell, rent, or share your personal data with third parties for marketing purposes.'}
            </li>
          </ul>
        </section>

        {/* 4. AI Processing */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>{isTr ? '4. Yapay Zeka İşleme (OpenAI)' : '4. AI Processing (OpenAI)'}</h2>
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '12px',
            padding: '14px 18px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ fontSize: '18px' }}>✨</span>
            <p style={{ ...pStyle, marginBottom: 0, color: '#0369a1', fontWeight: 600 }}>
              {isTr ? 'OpenAI API entegrasyonu kullanılmaktadır.' : 'This platform uses the OpenAI API.'}
            </p>
          </div>
          <p style={pStyle}>
            {isTr
              ? 'XOTIJI, seyahat önerileri ve paket özetleri oluşturmak için OpenAI API\'sini kullanmaktadır. Seyahat seçimleriniz (şehir, otel ve deneyim adları ile fiyatlar) işlenmek üzere OpenAI sunucularına iletilir.'
              : 'XOTIJI uses the OpenAI API to generate travel suggestions and package summaries. Your travel selections (city, hotel, and experience names and prices) are sent to OpenAI\'s servers for processing.'}
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            {isTr
              ? 'OpenAI, bu verileri kendi Gizlilik Politikası kapsamında işlemektedir. İsim, e-posta adresi veya kimlik bilgisi gibi kişisel tanımlayıcı bilgiler OpenAI\'ye iletilmez.'
              : 'OpenAI processes this data in accordance with their own Privacy Policy. No personally identifiable information — such as your name, email address, or credentials — is sent to OpenAI.'}
          </p>
        </section>

        {/* 5. Cookies */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>{isTr ? '5. Çerezler' : '5. Cookies'}</h2>
          <p style={pStyle}>
            {isTr
              ? 'XOTIJI minimum düzeyde çerez ve tarayıcı depolama alanı kullanmaktadır:'
              : 'XOTIJI uses minimal cookies and browser storage:'}
          </p>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            <li style={liStyle}>
              {isTr
                ? 'Dil tercihinizi oturumlar arasında hatırlamak için localStorage kullanıyoruz.'
                : 'We use localStorage to remember your language preference across sessions.'}
            </li>
            <li style={liStyle}>
              {isTr
                ? 'Barındırma ve analitik sağlayıcılarımız standart işlevsel çerezler ayarlayabilir.'
                : 'Our hosting and analytics providers may set standard functional cookies.'}
            </li>
            <li style={liStyle}>
              {isTr
                ? 'Reklam veya siteler arası izleme amacıyla çerez kullanmıyoruz.'
                : 'We do not use cookies for advertising or cross-site tracking.'}
            </li>
          </ul>
        </section>

        {/* 6. Third-Party Services */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>{isTr ? '6. Üçüncü Taraf Hizmetler' : '6. Third-Party Services'}</h2>
          <p style={{ ...pStyle, marginBottom: '16px' }}>
            {isTr
              ? 'XOTIJI, platformun çalışabilmesi için aşağıdaki üçüncü taraf altyapı hizmetlerinden yararlanmaktadır:'
              : 'XOTIJI relies on the following third-party infrastructure services to operate:'}
          </p>
          {[
            {
              name: 'Vercel',
              badge: '▲',
              role: isTr ? 'Frontend Barındırma' : 'Frontend Hosting',
              desc: isTr
                ? 'Ön yüzümüz Vercel üzerinde barındırılmaktadır. Vercel, standart erişim günlükleri ve kullanım ölçümleri toplayabilir.'
                : 'Our frontend is hosted on Vercel. Vercel may collect standard access logs and usage metrics.',
            },
            {
              name: 'Render',
              badge: '⬡',
              role: isTr ? 'Backend API Barındırma' : 'Backend API Hosting',
              desc: isTr
                ? 'Arka uç API\'miz Render üzerinde çalışmaktadır. Render, API isteklerini işler ve istek meta verilerini günlüğe kaydedebilir.'
                : 'Our backend API runs on Render. Render processes API requests and may log request metadata.',
            },
            {
              name: 'Neon PostgreSQL',
              badge: '🐘',
              role: isTr ? 'Bulut Veritabanı' : 'Cloud Database',
              desc: isTr
                ? 'Şehir, otel ve deneyim verilerini saklamak için Neon\'u bulut veritabanı olarak kullanıyoruz. AI işlemesi için gönderilen seyahat seçimleriniz veritabanımızda kalıcı olarak tutulmaz.'
                : 'We use Neon as our cloud database to store city, hotel, and experience data. Travel selections sent for AI processing are not permanently stored in our database.',
            },
          ].map((svc) => (
            <div key={svc.name} style={{
              padding: '16px 20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              marginBottom: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{ fontSize: '18px' }}>{svc.badge}</span>
                <strong style={{ color: '#0f172a', fontSize: '15px' }}>{svc.name}</strong>
                <span style={{
                  fontSize: '11px',
                  background: '#e0f2fe',
                  color: '#0369a1',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontWeight: 600,
                }}>
                  {svc.role}
                </span>
              </div>
              <p style={{ ...pStyle, marginBottom: 0, color: '#475569' }}>{svc.desc}</p>
            </div>
          ))}
        </section>

        {/* 7. Your Rights */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>{isTr ? '7. Haklarınız' : '7. Your Rights'}</h2>
          <p style={pStyle}>
            {isTr
              ? 'XOTIJI, normal kullanım sırasında isim veya e-posta gibi kişisel bilgiler gerektirmez ve toplamaz; verilerinizin büyük çoğunluğu geçici ve oturum tabanlıdır. Yine de aşağıdaki haklara sahipsiniz:'
              : 'XOTIJI does not require or collect personal information such as names or email addresses during normal use — most data is transient and session-based. However, you have the right to:'}
          </p>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            <li style={liStyle}>
              {isTr
                ? 'Dil tercihinizi istediğiniz zaman tarayıcınızın localStorage alanını temizleyerek silebilirsiniz.'
                : 'Clear your language preference at any time by clearing your browser\'s localStorage.'}
            </li>
            <li style={liStyle}>
              {isTr
                ? 'Toplanmış olabilecek veriler hakkında bilgi edinmek veya silme talebinde bulunmak için bizimle iletişime geçebilirsiniz.'
                : 'Contact us to inquire about any data that may have been collected or to request its deletion.'}
            </li>
          </ul>
        </section>

        {/* 8. Contact */}
        <section style={{ ...sectionStyle, marginBottom: 0 }}>
          <h2 style={h2Style}>{isTr ? '8. İletişim' : '8. Contact'}</h2>
          <p style={pStyle}>
            {isTr
              ? 'Bu Gizlilik Politikası veya verilerinizin nasıl işlendiği hakkında sorularınız için bizimle iletişime geçin:'
              : 'If you have questions about this Privacy Policy or how your data is handled, please reach out:'}
          </p>
          <a
            href="mailto:info@xotiji.app"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '999px',
              padding: '10px 22px',
              color: '#0ea5e9',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: 600,
            }}
          >
            ✉ info@xotiji.app
          </a>
        </section>
      </div>

      {/* Bottom back button */}
      <div style={{ textAlign: 'center', marginTop: '32px', marginBottom: '8px' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: '1px solid #e2e8f0',
            borderRadius: '999px',
            padding: '10px 24px',
            fontSize: '14px',
            color: '#64748b',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          ← {t('privacy.backToHome')}
        </button>
      </div>
    </div>
  );
}
