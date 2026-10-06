document.addEventListener("DOMContentLoaded", () => {
    // GERÇEK PUBG E-SPOR HARİTA DETAYLARI
    const maps = {
        erangel: {
            title: "ERANGEL TACTICAL MAP",
            bgColor: "#1d3a24",
            waterColor: "#102336",
            islandColor: "#162e1c",
            cities: [
                { name: "Pochinki (Main)", x: "47%", y: "49%", info: "Pochinki: Erangel merkez loot ve rotasyon kavşağı. Çevre binalardan split drop yapın." },
                { name: "School & Apartments", x: "53%", y: "42%", info: "School: Erken çatışma alanı. Çatı kontrolü şart." },
                { name: "Sosnovka Military Base", x: "60%", y: "82%", info: "Military Base: Ada bölgesi. Köprü pusuları ve bot rotasyonları önemli." },
                { name: "Georgopol Containers", x: "24%", y: "28%", info: "Georgopol: Konteyner splitleri ve Batı kıyı rotasyonu başlangıcı." },
                { name: "Mylta Power", x: "84%", y: "58%", info: "Mylta Power: Doğu kanadı güvenli drop ve Seviye 3 kask/zırh alanı." },
                { name: "Yasnaya Polyana", x: "65%", y: "30%", info: "Yasnaya: Geniş şehir alanı. Ev tutma taktikleri için ideal." }
            ]
        },
        miramar: {
            title: "MIRAMAR TACTICAL MAP",
            bgColor: "#42321e",
            waterColor: "#102336",
            islandColor: "#332616",
            cities: [
                { name: "Pecado (Main)", x: "48%", y: "54%", info: "Pecado: Miramar kalbi. Casino ve Arena çatışma noktası." },
                { name: "Hacienda del Patron", x: "60%", y: "39%", info: "Hacienda: Dar alanda hızlı temizleme (early fight) bölgesi." },
                { name: "Los Leones (Main)", x: "68%", y: "70%", info: "Los Leones: Haritanın en büyük metropolü. Yüksek çatı gözetleme alanları." },
                { name: "El Pozo", x: "28%", y: "25%", info: "El Pozo: Kuzeybatı büyük drop alanı. Araç koruması şart." }
            ]
        },
        rondo: {
            title: "RONDO TACTICAL MAP",
            bgColor: "#1a2c3d",
            waterColor: "#0a1826",
            islandColor: "#12202e",
            cities: [
                { name: "Jadam City (Main)", x: "52%", y: "58%", info: "Jadam City: Yüksek dikey binalar. Çatı-sokak split mesafesini koruyun." },
                { name: "NEOX Factory", x: "70%", y: "35%", info: "NEOX Factory: Test pisti ve fabrika bölgesi. Araçlı rotasyon tercih edin." },
                { name: "Yu Lin", x: "35%", y: "40%", info: "Yu Lin: Dar sokaklar ve pusu alanları. Öncü bilgisi (scouting) şart." }
            ]
        }
    };

    let currentMapKey = "erangel";
    let isPencilOpen = true;
    let isCityInfoOpen = false;
    let currentColor = "#34c759";
    let currentLineWidth = 5;

    const mapDisplay = document.getElementById("mapDisplayContainer");
    const canvas = document.getElementById("drawingCanvas");
    const ctx = canvas.getContext("2d");
    const cityOverlay = document.getElementById("cityOverlay");

    const pencilToggleBtn = document.getElementById("pencilToggleBtn");
    const cityInfoToggleBtn = document.getElementById("cityInfoToggleBtn");

    function resizeCanvas() {
        if (!mapDisplay || !canvas) return;
        canvas.width = mapDisplay.clientWidth;
        canvas.height = mapDisplay.clientHeight;
        drawCompleteTacticalMap();
    }

    // YÜKLENME HATASI VERMEYEN BİREBİR TAKTİKSEL PUBG HARİTA ÇİZİMİ
    function drawCompleteTacticalMap() {
        const m = maps[currentMapKey];
        const w = canvas.width;
        const h = canvas.height;

        ctx.save();
        
        // 1. DENİZ / SU ARKA PLANI
        ctx.fillStyle = m.waterColor;
        ctx.fillRect(0, 0, w, h);

        // 2. ANA KARA / ADALAR ÇİZİMİ
        ctx.fillStyle = m.bgColor;
        ctx.beginPath();
        if (currentMapKey === 'erangel') {
            // Erangel Ana Ada
            ctx.roundRect(w * 0.15, h * 0.1, w * 0.7, h * 0.6, 30);
            ctx.fill();
            // Sosnovka Askeri Ada
            ctx.fillStyle = m.islandColor;
            ctx.beginPath();
            ctx.roundRect(w * 0.3, h * 0.75, w * 0.4, h * 0.18, 20);
            ctx.fill();
            // Köprüler
            ctx.fillStyle = "#555";
            ctx.fillRect(w * 0.42, h * 0.68, w * 0.03, h * 0.08);
            ctx.fillRect(w * 0.58, h * 0.68, w * 0.03, h * 0.08);
        } else if (currentMapKey === 'miramar') {
            // Miramar Çöl Karası
            ctx.roundRect(w * 0.1, h * 0.08, w * 0.8, h * 0.84, 20);
            ctx.fill();
        } else {
            // Rondo Karası ve Nehirler
            ctx.roundRect(w * 0.12, h * 0.1, w * 0.76, h * 0.8, 25);
            ctx.fill();
        }

        // 3. ASKERİ IZGARA (A1, B2 TAKTİK KOORDİNAT HATLARI)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = 1;
        const cols = 8;
        const rows = 8;
        const stepX = w / cols;
        const stepY = h / rows;

        for (let i = 1; i < cols; i++) {
            ctx.beginPath();
            ctx.moveTo(i * stepX, 0);
            ctx.lineTo(i * stepX, h);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, i * stepY);
            ctx.lineTo(w, i * stepY);
            ctx.stroke();
        }

        // 4. BÖLGE VE KOORDİNAT ETİKETLERİ
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.font = "bold 14px 'Segoe UI', sans-serif";
        ctx.fillText(m.title + " - IGL BOARD", 20, 30);

        ctx.restore();
        loadCities();
    }

    setTimeout(resizeCanvas, 150);
    window.addEventListener("resize", resizeCanvas);

    // Harita Değiştirici Butonlar
    document.querySelectorAll(".map-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".map-btn").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            currentMapKey = e.target.dataset.map;
            resizeCanvas();
        });
    });

    // Taktiksel Çizim Araçları
    let isDrawing = false;

    if (pencilToggleBtn) {
        pencilToggleBtn.addEventListener("click", () => {
            isPencilOpen = !isPencilOpen;
            pencilToggleBtn.classList.toggle("active-tool", isPencilOpen);
        });
    }

    document.querySelectorAll(".color-picker").forEach(picker => {
        picker.addEventListener("click", (e) => {
            document.querySelectorAll(".color-picker").forEach(p => p.classList.remove("active"));
            e.target.classList.add("active");
            currentColor = e.target.dataset.color;
        });
    });

    const thicknessSelect = document.getElementById("penThickness");
    if (thicknessSelect) {
        thicknessSelect.addEventListener("change", (e) => {
            currentLineWidth = e.target.value;
        });
    }

    const clearBtn = document.getElementById("clearCanvasBtn");
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            resizeCanvas();
        });
    }

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);

    canvas.addEventListener("touchstart", (e) => { startDrawing(e.touches[0]); });
    canvas.addEventListener("touchmove", (e) => { draw(e.touches[0]); e.preventDefault(); });
    canvas.addEventListener("touchend", stopDrawing);

    function startDrawing(e) {
        if (!isPencilOpen) return;
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }

    function draw(e) {
        if (!isDrawing || !isPencilOpen) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentLineWidth;
        ctx.lineCap = "round";
        ctx.stroke();
    }

    function stopDrawing() { isDrawing = false; }

    // Şehir / Drop Noktaları
    if (cityInfoToggleBtn) {
        cityInfoToggleBtn.addEventListener("click", () => {
            isCityInfoOpen = !isCityInfoOpen;
            cityOverlay.classList.toggle("active", isCityInfoOpen);
        });
    }

    function loadCities() {
        cityOverlay.innerHTML = "";
        const cityList = maps[currentMapKey].cities;
        cityList.forEach(city => {
            const dot = document.createElement("div");
            dot.className = "city-dot";
            dot.style.left = city.x;
            dot.style.top = city.y;
            dot.title = city.name;
            dot.addEventListener("click", () => showModal(city.name, city.info));
            cityOverlay.appendChild(dot);
        });
    }

    // Modal
    const modal = document.getElementById("cityModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalDesc = document.getElementById("modalDescription");
    const modalClose = document.getElementById("modalClose");
    if (modalClose) modalClose.onclick = () => modal.style.display = "none";

    function showModal(title, desc) {
        modalTitle.textContent = title;
        modalDesc.textContent = desc;
        modal.style.display = "flex";
    }

    // Mobil Harita Aç/Kapat
    const mobileMapOpenBtn = document.getElementById("mobileMapOpenBtn");
    const mobileMapCloseBtn = document.getElementById("mobileMapCloseBtn");
    const mapSection = document.getElementById("mapSection");

    if (mobileMapOpenBtn) {
        mobileMapOpenBtn.addEventListener("click", () => {
            mapSection.classList.add("mobile-active");
            setTimeout(resizeCanvas, 100);
        });
    }

    if (mobileMapCloseBtn) {
        mobileMapCloseBtn.addEventListener("click", () => {
            mapSection.classList.remove("mobile-active");
        });
    }

    // Chat Soru-Cevap
    const userInput = document.getElementById("userInput");
    const sendBtn = document.getElementById("sendBtn");
    const chatMessages = document.getElementById("chatMessages");

    async function sendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        addMessage(text, "user");
        userInput.value = "";

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            const data = await response.json();
            addMessage(data.response, "ai");
        } catch (err) {
            addMessage("🚨 KENSUW Coach: Analiz sunucusuna erişilemedi.", "ai");
        }
    }

    function addMessage(text, sender) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `message ${sender === 'user' ? 'user-message' : 'ai-message'}`;
        const formattedText = text.replace(/\n/g, "<br>");
        msgDiv.innerHTML = `<div class="message-content"><p>${formattedText}</p></div>`;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    if (sendBtn) sendBtn.addEventListener("click", sendMessage);
    if (userInput) {
        userInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") sendMessage();
        });
    }
});
