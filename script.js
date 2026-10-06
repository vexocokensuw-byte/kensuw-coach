document.addEventListener("DOMContentLoaded", () => {
    // KESİNTİSİZ ASKERİ IZGARA (GRID) & ANALİZ HARİTALARI
    const maps = {
        erangel: {
            bg: "radial-gradient(circle, #1a331a 0%, #0d1a0d 100%)",
            grid: "#336633",
            name: "ERANGEL TACTICAL MAP",
            cities: [
                { name: "Pochinki (Main)", x: "48%", y: "50%", info: "Pochinki: Merkezi drop ve ana rotasyon kavşağı. Çevre binalarla Split Drop yapın." },
                { name: "School", x: "55%", y: "42%", info: "School: Erken fight ve 3rd party riskinin en yüksek olduğu merkez bölge." },
                { name: "Military Base (Main)", x: "60%", y: "82%", info: "Sosnovka Military Base: Ada rotasyonu. Köprü kontrolü ve bot geçiş planı şart." },
                { name: "Georgopol", x: "25%", y: "30%", info: "Georgopol: Konteyner splitleri. Batı rotasyonlarının başlangıç noktası." },
                { name: "Mylta Power", x: "82%", y: "58%", info: "Mylta Power: Doğu kanadı güvenli drop ve erken Phase 1 çember dışı tutunma alanı." }
            ]
        },
        miramar: {
            bg: "radial-gradient(circle, #3b2b18 0%, #1c140b 100%)",
            grid: "#5c4326",
            name: "MIRAMAR TACTICAL MAP",
            cities: [
                { name: "Pecado (Main)", x: "48%", y: "54%", info: "Pecado: Miramar'ın merkez rotasyon ve 'contest' noktası. Hızlı süzülme şart." },
                { name: "Hacienda del Patron", x: "60%", y: "39%", info: "Hacienda: Çok dar alanda ani çatışma bölgesi. Duo split koruması alın." },
                { name: "Los Leones (Main)", x: "68%", y: "70%", info: "Los Leones: Geniş şehir. 1-3 split ve çatı kontrolüyle IGL gözetleme alanı." },
                { name: "El Pozo", x: "28%", y: "25%", info: "El Pozo: Kuzeybatı büyük drop alanı. Giriş/çıkış rotasyonlarında araç koruma şart." }
            ]
        },
        rondo: {
            bg: "radial-gradient(circle, #152536 0%, #0a121a 100%)",
            grid: "#254463",
            name: "RONDO TACTICAL MAP",
            cities: [
                { name: "Jadam City (Main)", x: "52%", y: "58%", info: "Jadam City: Yüksek dikey çatışmalar. Çatı ve sokak arası split mesafesini koruyun." },
                { name: "NEOX Factory", x: "70%", y: "35%", info: "NEOX Factory: Açık alan geçişleri çok riskli. Araçlarla hızlı rotasyon tercih edin." },
                { name: "Yu Lin", x: "35%", y: "40%", info: "Yu Lin: Dar sokaklar ve pusu alanları. İlerlerken öncü/arkacı dağılımını bozmayın." }
            ]
        }
    };

    let currentMapKey = "erangel";
    let isPencilOpen = false;
    let isCityInfoOpen = false;
    let currentColor = "#ff3b30";
    let currentLineWidth = 5;

    const mapDisplay = document.getElementById("mapDisplayContainer");
    const canvas = document.getElementById("drawingCanvas");
    const ctx = canvas.getContext("2d");
    const cityOverlay = document.getElementById("cityOverlay");

    const pencilToggleBtn = document.getElementById("pencilToggleBtn");
    const pencilBadge = document.getElementById("pencilBadge");
    const penSettings = document.getElementById("penSettings");
    const cityInfoToggleBtn = document.getElementById("cityInfoToggleBtn");
    const cityBadge = document.getElementById("cityBadge");

    function renderTacticalMap() {
        const m = maps[currentMapKey];
        
        // 1. Harita Arkaplan ve Izgara Çizimi (Grid Lines)
        mapDisplay.style.background = m.bg;
        
        // Canvas Boyutlarını Ayarla
        canvas.width = mapDisplay.clientWidth;
        canvas.height = mapDisplay.clientHeight;
        
        // Harita Başlığı ve Taktiksel Izgara Ekranı
        let overlayTitle = document.getElementById("mapOverlayTitle");
        if (!overlayTitle) {
            overlayTitle = document.createElement("div");
            overlayTitle.id = "mapOverlayTitle";
            overlayTitle.style.position = "absolute";
            overlayTitle.style.top = "15px";
            overlayTitle.style.left = "20px";
            overlayTitle.style.color = "rgba(255,255,255,0.4)";
            overlayTitle.style.fontSize = "12px";
            overlayTitle.style.letterSpacing = "2px";
            overlayTitle.style.pointerEvents = "none";
            mapDisplay.appendChild(overlayTitle);
        }
        overlayTitle.textContent = m.name + " ( MILITARY GRID )";

        loadCities();
    }

    renderTacticalMap();
    window.addEventListener("resize", renderTacticalMap);

    // Harita Değiştirici Butonlar
    document.querySelectorAll(".map-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".map-btn").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            currentMapKey = e.target.dataset.map;
            renderTacticalMap();
            clearCanvas();
        });
    });

    // Kalem ve Taktik Çizim Mantığı
    let isDrawing = false;

    pencilToggleBtn.addEventListener("click", () => {
        isPencilOpen = !isPencilOpen;
        pencilBadge.textContent = isPencilOpen ? "Açık" : "Kapat";
        pencilBadge.classList.toggle("open", isPencilOpen);
        penSettings.classList.toggle("active", isPencilOpen);
        canvas.classList.toggle("active", isPencilOpen);
    });

    document.querySelectorAll(".color-picker").forEach(picker => {
        picker.addEventListener("click", (e) => {
            document.querySelectorAll(".color-picker").forEach(p => p.classList.remove("active"));
            e.target.classList.add("active");
            currentColor = e.target.dataset.color;
        });
    });

    document.getElementById("penThickness").addEventListener("change", (e) => {
        currentLineWidth = e.target.value;
    });

    document.getElementById("clearCanvasBtn").addEventListener("click", clearCanvas);

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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

    // Şehir / Drop Noktaları Analizi
    cityInfoToggleBtn.addEventListener("click", () => {
        isCityInfoOpen = !isCityInfoOpen;
        cityBadge.textContent = isCityInfoOpen ? "Açık" : "Kapat";
        cityBadge.classList.toggle("open", isCityInfoOpen);
        cityOverlay.classList.toggle("active", isCityInfoOpen);
    });

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

    // Modal Penceresi
    const modal = document.getElementById("cityModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalDesc = document.getElementById("modalDescription");
    document.getElementById("modalClose").onclick = () => modal.style.display = "none";

    function showModal(title, desc) {
        modalTitle.textContent = title;
        modalDesc.textContent = desc;
        modal.style.display = "flex";
    }

    // Chat / AI Analiz (API Bağlantısı)
    const userInput = document.getElementById("userInput");
    const sendBtn = document.getElementById("sendBtn");
    const chatMessages = document.getElementById("chatMessages");

    async function sendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        addMessage(text, "user");
        userInput.value = "";

        // Yapay Zeka Düşünüyor Mesajı
        const loadingId = addMessage("KENSUW Coach: Analiz ediliyor...", "ai-loading");

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            const data = await response.json();
            
            // Yükleniyor'u kaldır, cevabı ekle
            removeMessage(loadingId);
            addMessage(data.response, "ai");
        } catch (err) {
            removeMessage(loadingId);
            addMessage("🚨 KENSUW Coach: Analiz sunucusuna erişilemedi. Lütfen bağlantınızı kontrol edin.", "ai");
        }
    }

    function addMessage(text, sender) {
        const id = "msg_" + Date.now();
        const msgDiv = document.createElement("div");
        msgDiv.id = id;
        msgDiv.className = `message ${sender === 'user' ? 'user-message' : 'ai-message'}`;
        
        // Çok satırlı Markdown benzeri çıktıyı desteklemek için formatlama
        const formattedText = text.replace(/\n/g, "<br>");
        msgDiv.innerHTML = `<div class="message-content"><p>${formattedText}</p></div>`;
        
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return id;
    }

    function removeMessage(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    sendBtn.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });
});
