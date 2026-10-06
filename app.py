from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
import os

app = Flask(__name__, template_folder='.', static_folder='.')

# Gemini API Yapılandırması
API_KEY = os.environ.get("GEMINI_API_KEY", "")
if API_KEY:
    genai.configure(api_key=API_KEY)

SYSTEM_PROMPT = """
Sen KENSUW AI COACH adında profesyonel bir PUBG Mobile IGL, Taktik Koçu ve E-spor Analistisin.
Sana gelen sorular takımların scrim maçları, rotasyon hataları, main alan belirleme, drop bölgesi splitleri, early fight stratejileri, araç düzeni veya takım içi iletişim ile ilgilidir.

Yanıt verme kuralların:
1. Kesinlikle hazır kalıp metinler verme. Kullanıcının sorduğu spesifik soruya özel, detaylı ve profesyonel e-spor koçu gözüyle yanıt ver.
2. Taktiklerini adım adım, maddeler halinde ve net bir e-spor diliyle anlat (Scouting, Split, Edge Play, Center Play, Compound Hold vb. terimleri yerinde kullan).
3. Kullanıcı "main belirleyelim" veya benzeri açık uçlu sorular sorarsa, ona hangi harita ve oyun tarzına (agresif/pasif) göre seçim yapması gerektiğini sorarak detaylı rehberlik et.
4. Ciddi, otoriter ama takıma yol gösteren profesyonel bir koç gibi konuş.
"""

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '')

        if not user_message:
            return jsonify({'response': 'Lütfen bir mesaj yazın.'}), 400

        # API KEY varsa akıllı Gemini modelini çalıştır
        if API_KEY:
            # Model adını 404 vermeyecek en güncel standart isimle çağırıyoruz
            try:
                model = genai.GenerativeModel(
                    model_name="gemini-2.5-flash",
                    system_instruction=SYSTEM_PROMPT
                )
                response = model.generate_content(user_message)
                ai_text = response.text
            except Exception as model_err:
                # Eğer 2.5-flash modelinde sorun olursa yedek güncel modele geçiş
                model = genai.GenerativeModel(
                    model_name="gemini-1.5-flash-latest",
                    system_instruction=SYSTEM_PROMPT
                )
                response = model.generate_content(user_message)
                ai_text = response.text
        else:
            ai_text = generate_dynamic_fallback(user_message)

        return jsonify({'response': ai_text})

    except Exception as e:
        return jsonify({'response': f"🚨 Koç Analiz Hatası: {str(e)}"}), 500

def generate_dynamic_fallback(msg):
    q = msg.lower()
    if "main" in q or "drop" in q:
        return "📌 **MAIN DROP ALANI BELİRLEME ANALİZİ:**\n\nTakımınız için main bölge seçerken 3 kritik kriter vardır:\n1. **Skor ve Riski Dengeleme:** Agresif skora oynuyorsanız Pochinki/Pecado; pasif sıralamaya oynuyorsanız Mylta/El Pozo tarzı kenar alanlar seçilmelidir.\n2. **Araç Garanti Sayısı:** Seçtiğiniz main alanın çevresinde en az 3-4 araç doğma noktası (garage) bulunmalıdır.\n3. **360 Derece Görüş:** Erken aşamada çevreye öncü (scout) atabileceğiniz yüksek binalar veya tepeler olmalıdır.\n\n*Hangi haritada ve nasıl bir oyun tarzıyla main belirlemek istiyorsunuz? Detay verin, tam plana geçelim.*"
    else:
        return f"📌 **IGL KOÇ ANALİZİ:**\n\nSorduğunuz *\"{msg}\"* konusuyla ilgili stratejik koç tavsiyesi:\n\n1. **Aksiyon Planı:** Çatışma anında takımın 4 oyuncusu da aynı mikro karara odaklanmalıdır. İletişim kopukluğu anında pozisyonu terk etmeyin.\n2. **Harita İzolasyonu:** Rakipleri temizlerken açı vermemek için dikey siperleri ve sis bombalarını hat oluşturacak şekilde kullanın.\n3. **Skor & Sıralama Dengesi:** Scrim maçlarında öncelik hayatta kalma süresini artırıp 4. aşamaya tam kadro (4-man Alive) girmektir."

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
