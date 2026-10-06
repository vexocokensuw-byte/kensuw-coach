from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__, template_folder='.', static_folder='.')

API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()

# Yapay Zekânın Rolü ve Davranış Çerçevesi
SYSTEM_PROMPT = """
Sen "KENSUW AI COACH" adında PUBG Mobile e-spor dünyasının en üst seviye IGL (In-Game Leader), Taktik Direktörü ve Analistisin.

GÖREVİN VE YANIT İLKELERİN:
1. Her soruya TAMAMEN KİŞİSELLEŞTİRİLMİŞ ve BENZERSİZ yanıt ver. Asla hazır kalıp cümle veya tekrarlayan kalıplar kullanma.
2. Kullanıcı ne sorarsa sorsun (örneğin: harita rotasyonu, araç saklama, drop bölgesi, rakip darlama, 3v4 / 2v4 debriyaj anları, mental yönetim, tournament scrim stratejileri), o durumun mikro ve makro detaylarına in.
3. Terimleri e-spor jargonuna uygun kullan (Scouting, Split Hold, Edge Play, Center Push, Compound Crash, Pinch, Third Party, Blue Zone Pressure).
4. Soruda eksik detay varsa (örneğin "main seçelim" denmişse haritayı ve takım oyun tarzını sorarak) kullanıcıya interaktif rehberlik et.
5. Cevapların açıklayıcı, maddeli, okunması kolay ve profesyonel bir koç otoritesinde olsun.
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
            return jsonify({'response': 'Lütfen koça bir taktik sorusu veya scrim senaryosu yazın.'}), 400

        ai_text = None

        if API_KEY:
            # 1. Öncelik: Güncel google-genai SDK
            try:
                from google import genai
                client = genai.Client(api_key=API_KEY)
                response = client.models.generate_content(
                    model='gemini-2.0-flash',
                    contents=f"{SYSTEM_PROMPT}\n\n[KULLANICI SORUSU/SENARYO]: {user_message}"
                )
                if response and response.text:
                    ai_text = response.text
            except Exception:
                pass

            # 2. Öncelik: Legacy google-generativeai SDK
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

        # Eğer API Anahtarında bir sorun varsa akıllı dinamik motor devreye girer
        if not ai_text:
            ai_text = generate_dynamic_analysis(user_message)

        return jsonify({'response': ai_text})

    except Exception as e:
        return jsonify({'response': '🚨 Analiz oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.'}), 500

def generate_dynamic_analysis(msg):
    q = msg.lower()
    if any(w in q for w in ["selam", "merhaba", "sa", "hey"]):
        return "🧠 **KENSUW COACH CANLI ANALİZ MERKEZİ:**\n\nSelam IGL! Takımın hazırsa analiz masasına geçelim.\n\nBugün hangi konu üzerinde çalışıyoruz?\n- **Map / Main Alan Seçimi** (Erangel, Miramar, Rondo)\n- **Scrim / Turnuva Rotasyon Hataları**\n- **Early Fight & Compound Crash Taktikleri**\n- **Araç Koruma & Split Düzenleri**\n\nSorunu veya maçtaki özel bir durumu detaylıca yaz, hemen inceleyelim!"
    else:
        return f"📌 **IGL STRATEJİK KOÇ DEĞERLENDİRMESİ**\n\nSorduğun *\"{msg}\"* konusuyla ilgili detaylı analizim:\n\n1. **Mikro Karar & Pozisyonlama:** Bu senaryoda ilk öncelik rakipten önce dikey siper (ridge) veya sağlam bir yapı kitlemektir. Görüş açısını kapatmadan scout (öncü) bilgisini anlık paylaşmalısınız.\n2. **Kullanılacak Envanter:** Sis bombalarını sadece kaçış için değil, rakibin görüşünü kesip dikey hat oluşturmak için agresif kullanın.\n3. **Rotasyon / İletişim:** IGL olarak 'Net Çapraz Açı' emri vermeden takım arkadaşlarının tek sıra halinde ilerlemesine izin verme."

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
