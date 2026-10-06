document.addEventListener("DOMContentLoaded", () => {
    // KUSURSUZ HARİTA VE TAKTİK VERİLERİ
    const maps = {
        erangel: {
            title: "ERANGEL TACTICAL MAP",
            cities: [
                { name: "Pochinki (Main)", x: "48%", y: "50%", info: "Pochinki: Merkezi drop ve ana rotasyon kavşağı. Çevre binalarla Split Drop yapın." },
                { name: "School", x: "55%", y: "42%", info: "School: Erken fight ve 3rd party riskinin en yüksek olduğu merkez bölge." },
                { name: "Military Base (Main)", x: "60%", y: "82%", info: "Sosnovka Military Base: Ada rotasyonu. Köprü kontrolü ve bot geçiş planı şart." },
                { name: "Georgopol", x: "25%", y: "30%", info: "Georgopol: Konteyner splitleri. Batı rotasyonlarının başlangıç noktası." },
                { name: "Mylta Power", x: "82%", y: "58%", info: "Mylta Power: Doğu kanadı güvenli drop ve erken Phase 1 çember dışı tutunma alanı." }
            ]
        },
        miramar: {
            title: "MIRAMAR TACTICAL MAP",
            cities: [
                { name: "Pecado (Main)", x: "48%", y: "54%", info: "Pecado: Miramar'ın merkez rotasyon ve contest noktası. Hızlı süzülme şart." },
                { name: "Hacienda del Patron", x: "60%", y: "39%", info: "Hacienda: Çok dar alanda ani çatışma bölgesi. Duo split koruması alın." },
                { name: "Los Leones (Main)", x: "68%", y: "70%", info: "Los Leones: Geniş şehir. 1-3 split ve çatı kontrolüyle IGL gözetleme alanı." },
                { name: "El Pozo", x: "28%", y: "25%", info: "El Pozo: Kuzeybatı büyük drop alanı. Giriş/çıkış rotasyonlarında araç koruma şart." }
            ]
        },
        rondo: {
            title: "RONDO TACTICAL MAP",
            cities: [
                { name: "Jadam City (Main)", x: "52%", y: "58%", info: "Jadam City: Yüksek dikey çatışmalar. Çatı ve sokak arası split mesafesini koruyun." },
                { name: "NEOX Factory", x: "70%", y: "35%", info: "NEOX Factory: Açık alan geçişleri çok riskli. Araçlarla hızlı rotasyon tercih edin." },
                { name: "Yu Lin", x: "35%", y: "40%", info: "Yu Lin: Dar sokaklar ve pusu alanları. İlerlerken öncü/arkacı dağılımını bozmayın." }
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
        drawMapBackground();
    }

    // IZGARA VE ŞEMA ÇİZİMİ (SİMSİYAH EKRANI ENGELER)
    function drawMapBackground() {
        ctx.save();
        
        // 1. Harita Arkaplan Rengi
        if (currentMapKey === 'erangel') {
            ctx.fillStyle = "#1b3022";
        } else if (currentMapKey === 'miramar') {
            ctx.fillStyle = "#332619";
        } else {
            ctx.fillStyle = "#192838";
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Taktik Izgaralar (Grid Lines)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1;
        const gridSize = 50;

        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // 3. Harita Ismi
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.font = "bold 18px 'Segoe UI', sans-serif";
        ctx.fillText(maps[currentMapKey].title + " (GRID)", 20, 35);

        ctx.restore();
        loadCities();
    }

    setTimeout(resizeCanvas, 200);
    window.addEventListener("resize", resizeCanvas);

    // Harita Değiştirme
    document.querySelectorAll(".map-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".map-btn").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            currentMapKey = e.target.dataset.map;
            resizeCanvas();
        });
    });

    // Çizim Mantığı
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
    canvas.addEventListener("mouseleave", stopDrawing);

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

    // Şehir / Main Drop Noktaları
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

    // Soru - Cevap Yapay Zeka
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
