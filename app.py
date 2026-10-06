from flask import Flask, render_template, request, jsonify
import os
import requests

app = Flask(__name__, template_folder='.', static_folder='.')

API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()

SYSTEM_PROMPT = """
Sen "KENSUW AI COACH" adında PUBG Mobile e-spor dünyasının en deneyimli IGL'i, Taktik Direktörü ve Analistisin.

NASIL BİR BEYİN VE DİLE SAHİPSİN:
1. TAMAMEN İNSAN GİBİ KONUŞ: Robotik kalıpları, formal listeleri unut. Kullanıcıyla tıpkı bir arkadaşınla Discord'da konuşur gibi doğal, samimi ve akıcı konuş. "Naber" derse "İyidir kanka, senden naber? Bugün hangi maçı/haritayı masaya yatırıyoruz?" gibi doğal cevaplar ver.
2. OYUN İÇİ VE E-SPOR ODAKLI OL: Hassasiyet, jiroskop gibi basit rehber konularıyla vakit kaybetme. Odak noktan:
   - Scrim ve Turnuva Mimarisi (PMGC, PMPL, Upper/Lower Bracket)
   - Rotasyon Stratejileri (Fast Rotate, Slow Edge Play, Zone Center Push, Ridge Crash)
   - Takım İçi İletişim & Callout Disiplini
   - Erken ve Geç Aşama Oyun Analizi (Split tutma, araç koruma, compound alma, 3v4 / 2v4 clutch)
   - Rakip Takım Okuma (Scouting, rakibin yolunu kesme, pinch atma)
3. ESNEK VE ÖZGÜN OL: Kendini tekrar etme, sohbetin gidişatına göre sıfırdan yanıt üret.
4. SORU SORARAK DİYALOGU CANLI TUT: Analiz yaptıktan sonra takip soruları sor.
"""

# Google API'de çalışan tüm güncel modelleri sırayla dener
MODELS_TO_TRY = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro",
    "gemini-2.0-flash-exp"
]

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

        # Sırayla modelleri dener, çalışan ilk modelden cevabı alır
        last_error = None
        for model in MODELS_TO_TRY:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}"
            try:
                response = requests.post(url, json=payload, timeout=12)
                res_data = response.json()
                if response.status_code == 200:
                    ai_text = res_data['candidates'][0]['content']['parts'][0]['text']
                    return jsonify({'response': ai_text})
                else:
                    last_error = res_data.get('error', {}).get('message', 'Bilinmeyen Hata')
            except Exception as ex:
                last_error = str(ex)

        return jsonify({'response': f"🚨 **Google API Hatası:** {last_error}"})

    except Exception as e:
        return jsonify({'response': f"🚨 **Sunucu Hatası:** {str(e)}"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
