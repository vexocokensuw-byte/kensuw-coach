from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__, template_folder='.', static_folder='.')

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

        # KENSUW AI COACH - IGL VE TAKTİK YANIT MOTORU
        ai_response = (
            f"📌 **KENSUW COACH ANALİZİ**\n\n"
            f"Soru: *\"{user_message}\"*\n\n"
            f"**Taktik Tavsiye:**\n"
            f"1. **Rotasyon & Araç Düzeni:** Erken aşamada 2'li split koruması sağlayın ve araçları alan sınırında siper yapacak şekilde konumlandırın.\n"
            f"2. **IGL Komutu:** Çatışma anında görüş açısını kaybetmemek için yüksek çatı ve tepe noktalarını scouting (gözetleme) amacıyla tutun.\n"
            f"3. **Alan İçi Disiplin:** Çember kapanışlarında gereksiz early fight riskine girmeden puan odaklı alan merkezine sızın."
        )

        return jsonify({'response': ai_response})
    except Exception as e:
        return jsonify({'response': f'Sunucu Hatası: {str(e)}'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
