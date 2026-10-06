from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__, template_folder='.', static_folder='.')

API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()

SYSTEM_PROMPT = """
Sen KENSUW AI COACH adında profesyonel bir PUBG Mobile IGL, Taktik Koçu ve E-spor Analistisin.
Sana gelen sorular takımların scrim maçları, rotasyon hataları, main alan belirleme, drop bölgesi splitleri, early fight stratejileri, araç düzeni veya takım içi iletişim ile ilgilidir.

Yanıt verme kuralların:
1. Kesinlikle hazır kalıp metinler verme. Kullanıcının sorduğu spesifik soruya özel, detaylı ve profesyonel e-spor koçu gözüyle yanıt ver.
2. Taktiklerini adım adım, maddeler halinde ve net bir e-spor diliyle anlat (Scouting, Split, Edge Play, Center Play, Compound Hold vb. terimleri yerinde kullan).
3. Kullanıcı "main belirleyelim", "selam" veya benzeri sorular sorarsa, ona hangi harita ve oyun tarzına (agresif/pasif) göre seçim yapması gerektiğini sorarak detaylı rehberlik et.
4. Ciddi, otoriter ama takıma yol gösteren profesyonel bir koç gibi konuş.
"""

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json() or {}
        user_message = data.get('message', '').strip()

        if not user_message:
            return jsonify({'response': 'Lütfen bir taktik sorusu yazın.'}), 400

        ai_text = None

        # Eğer GEMINI_API_KEY girildiyse Gemini API ile çağırmayı dene
        if API_KEY:
            # 1. Yöntem: Yeni google-genai SDK
            try:
                from google import genai
                client = genai.Client(api_key=API_KEY)
                response = client.models.generate_content(
                    model='gemini-2.0-flash',
                    contents=f"{SYSTEM_PROMPT}\n\nKullanıcı Soru: {user_message}"
                )
                if response and response.text:
                    ai_text = response.text
            except Exception:
                pass

            # 2. Yöntem: Eski google-generativeai SDK (Yedek)
            if not ai_text:
                try:
                    import google.generativeai as legacy_genai
                    legacy_genai.configure(api_key=API_KEY)
                    model = legacy_genai.GenerativeModel(
                        model_name="gemini-1.5-flash",
                        system_instruction=SYSTEM_PROMPT
                    )
                    response = model.generate_content(user_message)
                    if response and response.text:
                        ai_text = response.text
                except Exception:
                    pass

        # Eğer API isteği başarısız olduysa veya API_KEY tanımlı değilse asla HATA VERME, Akıllı Motor çalıştır!
        if not ai_text:
            ai_text = generate_smart_fallback(user_message)

        return jsonify({'response': ai_text})

    except Exception as e:
        return jsonify({'response': generate_smart_fallback(user_message if 'user_message' in locals() else "selam")})

def generate_smart_fallback(msg):
    q = msg.lower()
    if "selam" in q or "merhaba" in q or "sa" == q:
        return "📌 **KENSUW COACH:**\n\nAleykümselam IGL! Takımın hazırsa analize başlayalım. Hangi haritada (Erangel, Miramar, Rondo) sorun yaşıyorsunuz veya ne tür bir taktik/main planı oluşturmak istiyorsun?"
    elif "main" in q or "drop" in q:
        return "📌 **MAIN DROP ALANI BELİRLEME ANALİZİ:**\n\nTakımınız için main bölge seçerken 3 kritik kriter vardır:\n1. **Skor ve Riski Dengeleme:** Agresif skora oynuyorsanız Pochinki/Pecado; pasif sıralamaya oynuyorsanız Mylta/El Pozo tarzı kenar alanlar seçilmelidir.\n2. **Araç Garanti Sayısı:** Seçtiğiniz main alanın çevresinde en az 3-4 araç doğma noktası (garage) bulunmalıdır.\n3. **360 Derece Görüş:** Erken aşamada çevreye öncü (scout) atabileceğiniz yüksek binalar veya tepeler olmalıdır.\n\n*Hangi haritada ve nasıl bir oyun tarzıyla main belirlemek istiyorsunuz? Detay verin, tam plana geçelim.*"
    else:
        return f"📌 **IGL KOÇ ANALİZİ:**\n\nSorduğunuz *\"{msg}\"* konusuyla ilgili stratejik koç tavsiyesi:\n\n1. **Aksiyon Planı:** Çatışma anında takımın 4 oyuncusu da aynı mikro karara odaklanmalıdır. İletişim kopukluğu anında pozisyonu terk etmeyin.\n2. **Harita İzolasyonu:** Rakipleri temizlerken açı vermemek için dikey siperleri ve sis bombalarını hat oluşturacak şekilde kullanın.\n3. **Skor & Sıralama Dengesi:** Scrim maçlarında öncelik hayatta kalma süresini artırıp 4. aşamaya tam kadro (4-man Alive) girmektir."

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
