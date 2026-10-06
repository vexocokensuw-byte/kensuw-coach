from flask import Flask, render_template, request, jsonify
import os
import requests

app = Flask(__name__, template_folder='.', static_folder='.')

API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()

SYSTEM_PROMPT = """
Sen "KENSUW AI COACH" adında profesyonel bir Espor Analisti, PUBG Mobile IGL Koçu ve Oyun Stratejistisin.

GÖREVİN VE DAVRANIŞ KURALLARIN:
1. GERÇEK BİR İNSAN KOÇ GİBİ KONUŞ: Asla robotik, ezber veya hazır kalıp metinler verme. Kullanıcıyla canlı bir sohbet içindeymiş gibi doğal, samimi ama otoriter bir espor koçu diliyle konuş.
2. SANA SORULAN HER SORUYU SPESİFİK ANALİZ ET: Sadece rotasyon değil; hassasiyet ayarları, jiroskop, cihaz FPS performansı, turnuva mentali, harita stratejileri, 1v1 clutch anları, rakip okuma, drop bölgeleri veya silah spreyi gibi her konuda özel rehberlik et.
3. AYNILIKTAN KAÇIN: Aynı soru sorulsa bile asla aynı cümleleri kurma. Yaratıcı ve farklı açılardan yaklaş.
4. MİKRO VE MAKRO DETAYLAR: Cevaplarında pozisyon alma, görüş açısı (angle), harita okuma (scouting), araç yönetimi ve iletişim (callout) detaylarına in.
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
            return jsonify({'response': 'Lütfen koça bir soru yazın.'}), 400

        if not API_KEY:
            return jsonify({'response': '🚨 **API Key Eksik:** Render panelinde `GEMINI_API_KEY` değişkeni bulunamadı. Lütfen Environment bölümünden ekleyin.'})

        # Doğrudan Google Gemini REST API Çağrısı (Model: gemini-1.5-flash / gemini-2.0-flash)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}"
        
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
                "temperature": 0.9,
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
            # Yedek Model Denemesi (gemini-2.0-flash)
            url_v2 = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"
            res_v2 = requests.post(url_v2, json=payload, timeout=15)
            res_v2_data = res_v2.json()
            
            if res_v2.status_code == 200:
                try:
                    ai_text = res_v2_data['candidates'][0]['content']['parts'][0]['text']
                    return jsonify({'response': ai_text})
                except (KeyError, IndexError):
                    pass

            error_msg = res_data.get('error', {}).get('message', 'Bilinmeyen Hata')
            return jsonify({'response': f"🚨 **Google API Hatası ({response.status_code}):** {error_msg}"})

    except Exception as e:
        return jsonify({'response': f"🚨 **Bağlantı Hatası:** {str(e)}"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
