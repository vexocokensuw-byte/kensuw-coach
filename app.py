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

def get_active_model():
    """Hesabında aktif olan geçerli bir modeli otomatik bulur"""
    try:
        list_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"
        res = requests.get(list_url, timeout=10)
        if res.status_code == 200:
            models_data = res.json().get('models', [])
            for m in models_data:
                name = m.get('name', '')
                # generateContent destekleyen ilk flash veya pro modelini seçer
                if "generateContent" in m.get('supportedGenerationMethods', []):
                    if "flash" in name or "pro" in name:
                        return name.replace("models/", "")
    except Exception:
        pass
    return "gemini-1.5-flash"  # Varsayılan yedek

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

        # Çalışan modeli otomatik tespit et
        active_model = get_active_model()

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{active_model}:generateContent?key={API_KEY}"
        
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
            ai_text = res_data['candidates'][0]['content']['parts'][0]['text']
            return jsonify({'response': ai_text})
        else:
            error_msg = res_data.get('error', {}).get('message', 'Bilinmeyen Hata')
            return jsonify({'response': f"🚨 **Google API Hatası ({response.status_code}):** {error_msg}"})

    except Exception as e:
        return jsonify({'response': f"🚨 **Sunucu Hatası:** {str(e)}"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
