import re
from flask import Flask, jsonify, render_template, request

app = Flask(__name__, template_folder='.')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json or {}
    user_msg = data.get('message', '').strip()
    
    if not user_msg:
        return jsonify({'response': 'Lütfen analiz için bir scrim hatası veya taktik sorusu yazın.'})
    
    msg_lower = user_msg.lower()
    
    # 1. ROTASYON VE ALAN (ZONE) GİRİŞ ANALİZLERİ
    if any(w in msg_lower for w in ['rotasyon', 'rotation', 'zone', 'alan', 'giriş', 'çember']):
        reply = (
            "🎯 **[IGL & KOÇ ANALİZİ: ROTASYON HATALARI]**\n\n"
            "Takımların scrimlerde en çok düştüğü hata, 3. ve 4. evrelerde (Phase 3-4) alanın merkezine geç kalmaktır. "
            "Eğer 'Edge' (kenar) oynuyorsanız, alanın dar/yavaş tarafını (slow side) tercih etmelisiniz. Geç kalındığında choke point (boğaz) noktalarında sıkışırsınız.\n\n"
            "🔍 **Öneri:** \n"
            "- **Erken Rotasyon:** Çember daralmadan 15-30 saniye önce öncü (Scout) oyuncuyu yola çıkarın. Bilgi (info) almadan tüm takımla hareket etmeyin.\n"
            "- **Plan B:** İlk rotasyon hattı kapalıysa (örneğin köprüler veya Pochinki geçişi) hemen alternatif 'outer' (dış) rotasyona dönün. Araç korumasını kesinlikle kaybetmeyin."
        )
        
    # 2. DROP / MAIN NOKTALARI ANALİZİ
    elif any(w in msg_lower for w in ['drop', 'main', 'başlangıç', 'iniş', 'pochinki', 'pecado', 'military', 'school']):
        reply = (
            "📍 **[IGL & KOÇ ANALİZİ: DROP & MAIN BÖLGE KONTROLÜ]**\n\n"
            "Profesyonel lobilerde ana drop bölgenizin (örneğin Pochinki veya Pecado) 500-800 metre çevresini 'Split Drop' olarak kontrol altında tutmalısınız.\n\n"
            "⚠️ **Sık Yapılan Hatalar & Çözümleri:**\n"
            "- **Dağınık İniş:** Oyuncuların birbirini koruyamayacak kadar uzak binalara inmesi. İniş yaparken en az ikişerli (duo) birbirinizi cover'layacak mesafede olun.\n"
            "- **Loot Hızı:** Rakip takım drop'unuza 'contest' (ortak iniş) yapıyorsa, IGL hemen en yakın araçları rezerve etmeli veya 'early fight' yerine 'split loot' yapıp bölgeyi güvenli terk etme çağrısı yapmalıdır."
        )
        
    # 3. IGL KARARLARI & TAKIM HATALARI / ANALYSIS
    elif any(w in msg_lower for w in ['igl', 'lider', 'karar', 'hata', 'scrim', 'analiz', 'fight', 'savaş']):
        reply = (
            "⚡ **[IGL TAKTİK & HATA ÇÖZÜMÜ]**\n\n"
            "Bir IGL/Koç olarak takımdaki en büyük sorunlardan biri 'Kararsızlık' ve 'Fight uzatmak'tır.\n\n"
            "🛠 **Hatalar & Çözüm Metotları:**\n"
            "- **3. Parti (3rd Party) Yakalanma:** Bir fight 45 saniyeden uzun sürüyorsa, diğer takımların oraya rotasyon yapacağını varsayarak hemen geri çekilmeli (disengage) veya çok hızlı bitirmelisiniz (push).\n"
            "- **Bilgi (Info) Eksikliği:** Öldürme akışını (kill feed) takip etmemek. IGL, yakındaki çatışmaları kimin kazandığını bilerek o yöne rota çizmelidir.\n"
            "- **Araç Kaybı:** Araçları korunaklı/siperli park etmemek. Lastiklerin patlatılması late-game rotasyonunu tamamen imkansız kılar."
        )
        
    # 4. SPLIT / POZİSYON VE DAĞILIM ANALİZLERİ
    elif any(w in msg_lower for w in ['split', 'dağılım', 'bölünme', 'pozisyon', 'çapraz']):
        reply = (
            "🛡 **[KOÇ ANALİZİ: SPLIT (BÖLÜNME) & POZİSYON HATALARI]**\n\n"
            "Rekabetçi lobilerde 2-2 veya 1-3 split'ler hayat kurtarır ancak en büyük hata 'Bağlantının Kopması'dır.\n\n"
            "📐 **Güvenli Split Kuralları:**\n"
            "- **Görüş Mesafesi:** Split yapan iki grubun birbirine atılan atışları duyabilecek ve destek (trade) atabilecek maksimum 150-200 metre mesafede olması gerekir.\n"
            "- **Kaçış Güzergahı:** Dağılan oyuncuların baskın yediklerinde geri çekilebilecekleri hazır araçları ve siper yolları bulunmalıdır. Siperi olmayan split intihardır."
        )
        
    # 5. GENEL SOHBET / KOÇ KABULÜ
    elif any(w in msg_lower for w in ['selam', 'merhaba', 'koç', 'coach', 'kimsin', 'sa']):
        reply = (
            "🏆 **KENSUW AI COACH** sistemine hoş geldiniz, IGL!\n\n"
            "Takımınızın scrimlerdeki hatalarını çözmek, drop ve rotasyon planlarını analiz etmek için buradayım. "
            "Bana takımınızın yaşadığı spesifik bir sorunu (örn: 'Rotasyonda sürekli arkadan yiyoruz', 'Drop'ta dağınık ölüyoruz' vb.) yazın, "
            "profesyonel e-spor standartlarında hataları analiz edip çözüm yollarını sunayım."
        )
        
    else:
        # Standart koç geri bildirimi
        reply = (
            f"📋 **[IGL & KOÇ TAKTİKSEL ANALİZİ]**\n\n"
            f"Gönderilen durum: '{user_msg}'\n\n"
            "Bu durum analiz edildiğinde, rekabetçi PUBG Mobile metasına göre:\n"
            "1. **Öncü Bilgisi (Scouting):** Savaşın veya rotasyonun başladığı bölgeye körlemesine girmeyin. Bir öncüyü önden gönderin.\n"
            "2. **Hızlı Karar (Quick Calls):** IGL olarak kararınızı net ve kısa comms (telsiz) kullanarak verin ('Rotate now', 'Hold this compound').\n"
            "3. **Hata İncelemesi (VOD Review):** Bu durumun tekrar etmemesi için takımınızla maç sonrası pozisyon dağılımını (split) kontrol edin."
        )

    return jsonify({'response': reply})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
