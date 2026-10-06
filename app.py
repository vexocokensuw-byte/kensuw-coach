from flask import Flask, render_template, request, jsonify
import os
import requests

app = Flask(__name__, template_folder='.', static_folder='.')

API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()

# İnsansı Sohbet + Derin E-Spor Koçu Modu
SYSTEM_PROMPT = """
Sen "KENSUW AI COACH" adında PUBG Mobile e-spor dünyasının en deneyimli IGL'i (In-Game Leader), Taktik Direktörü ve Analistisin.

NASIL BİR BEYİN VE DİLE SAHİPSİN:
1. TAMAMEN İNSAN GİBİ KONUŞ: Robotik kalıpları, formal "1. Maddede şu var" tarzı kuru listeleri unut. Kullanıcıyla tıpkı bir arkadaşınla/takım arkadaşınla Discord'da konuşur gibi doğal, samimi, esnek ve akıcı konuş. "Naber" derse "İyidir kanka, senden naber? Bugün hangi maçı/haritayı masaya yatırıyoruz?" gibi doğal cevaplar ver.
2. OYUN İÇİ VE E-SPOR ODAKLI OL: Hassasiyet, jiroskop veya buton boyutu gibi basit rehber konularıyla vakit kaybetme. Senin odak noktan:
   - Scrim ve Turnuva Mimarisi (PMGC, PMPL, Upper/Lower Bracket mantıkları)
   - Rotasyon Stratejileri (Fast Rotate, Slow Edge Play, Zone Center Push, Ridge Crash)
   - Takım İçi İletişim & Callout Disiplini (İnfoyu net verme, panik yapmama, karar alma süreci)
   - Erken ve Geç Aşama Oyun Analizi (Split tutma, araç koruma, compound alma, 3v4 / 2v4 clutch anları)
   - Rakip Takım Okuma (Scouting, rakibin rotasyon yolunu kesme, pinch atma)
3. ESNEK VE ÖZGÜN OL: Aynı şey iki defa sorulsa bile asla aynı cümleleri kurma. Kendini tekrar etme, her seferinde sohbetin gidişatına göre sıfırdan düşünerek yanıt üret.
4. SORU SORARAK DİYALOGU CANLI TUT: Analiz yaptıktan sonra durumu netleştirmek için "Sizin takım genelde kenardan mı oynuyor yoksa merkeze mi giriyor?" gibi samimi takip soruları sor.
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
            return jsonify({'response': 'Koç dinlemede, bir şey yazmadın!'}), 400

        if not API_KEY:
            return jsonify({'response': '🚨 **API Key Eksik:** Render panelinde `GEMINI_API_KEY` tanımlı değil.'})

        # Güncel Gemini 2.0 Flash REST API Adresi
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"
        
        payload = {
            "system_instruction": {
                "parts": [{"text": SYSTEM_PROMPT}]
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": user_message}]
                }
            ],
            "generationConfig": {
                "temperature": 0.95,
                "topP": 0.95
            }
        }

        response = requests.post(url, json=payload, timeout=15)
        res_data = response.json()

        if response.status_code == 200:
            try:
                ai_text = res_data['candidates'][0]['content']['parts'][0]['text']
                return jsonify({'response': ai_text})
            except (KeyError, IndexError):
                return jsonify({'response': f"🚨 **API Yanıtı Okunamadı:** {res_data}"})
        else:
            error_msg = res_data.get('error', {}).get('message', 'Bilinmeyen Hata')
            return jsonify({'response': f"🚨 **Google API Hatası ({response.status_code}):** {error_msg}"})

    except Exception as e:
        return jsonify({'response': f"🚨 **Bağlantı Hatası:** {str(e)}"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
