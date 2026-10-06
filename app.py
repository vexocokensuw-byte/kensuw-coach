from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# 🔑 API Anahtarını buraya tırnak içine yaz:
GEMINI_API_KEY = "AQ.Ab8RN6InnLgkjBpfQLTYzJsMZ-JeOFu2rmqc7p2YXJk2-f7qmQ"

genai.configure(api_key=GEMINI_API_KEY)

SYSTEM_PROMPT = """
Sen PUBG Mobile E-Spor dünyasının en deneyimli, analitik ve profesyonel AI Koçusun (E-Sports Analyst & IGL Mentor).
Kullanıcılara bir PUBG Mobile koçu ve IGL analizcisi gibi Türkçe yanıt ver.
"""

def generate_with_fallback(prompt):
    # Sırasıyla hesaptaki tüm aktif modeller denenir
    candidate_models = []
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                candidate_models.append(m.name)
    except Exception as e:
        print("Model listeleme hatası:", e)

    # Eğer liste boşsa varsayılan isimleri ekle
    if not candidate_models:
        candidate_models = ['models/gemini-1.5-flash', 'models/gemini-pro', 'models/gemini-1.0-pro']

    last_error = None
    for model_name in candidate_models:
        try:
            print(f"Deneyen model: {model_name}")
            active_model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=SYSTEM_PROMPT
            )
            response = active_model.generate_content(prompt)
            if response and response.text:
                return response.text
        except Exception as err:
            print(f"{model_name} başarısız oldu, sonraki deneniyor... Hata: {err}")
            last_error = err
            continue

    raise Exception(f"Çalışan model bulunamadı: {last_error}")

@app.route('/api/chat', methods=['POST', 'OPTIONS'])
def chat():
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200

    try:
        data = request.json or {}
        user_message = data.get('message', '').strip()
        selected_map = data.get('map', 'Erangel')

        if not user_message:
            return jsonify({"reply": "Lütfen koçunuza bir soru sorun."})

        full_prompt = f"[Seçili Harita: {selected_map}]\nKullanıcı Soru/Durum: {user_message}"
        
        reply_text = generate_with_fallback(full_prompt)
        reply_text = reply_text.replace('\n', '<br>')
        return jsonify({"reply": reply_text})

    except Exception as e:
        print("Hata Detayı:", str(e))
        return jsonify({"reply": f"⚠️ <b>Yapay Zekâ Hatası:</b> {str(e)}"})

if __name__ == '__main__':
    print("🚀 PUBG AI Coach - Sunucu Çalışıyor... (http://127.0.0.1:5000)")
    app.run(port=5000, debug=True)