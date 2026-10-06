window.addEventListener("load", () => {
    const maps = {
        erangel: {
            title: "ERANGEL TACTICAL MAP",
            bgColor: "#1d3a24",
            waterColor: "#0f1d2a",
            islandColor: "#14291a",
            cities: [
                { name: "Pochinki (Main)", x: "47%", y: "49%", info: "Pochinki: Erangel merkez drop ve rotasyon kavşağı." },
                { name: "School & Apartments", x: "53%", y: "42%", info: "School: Erken çatışma ve çatı kontrol noktası." },
                { name: "Sosnovka Military Base", x: "60%", y: "82%", info: "Military Base: Ada bölgesi. Köprü kontrolü önemli." },
                { name: "Georgopol Containers", x: "24%", y: "28%", info: "Georgopol: Konteyner splitleri ve Batı rotasyonu." },
                { name: "Mylta Power", x: "84%", y: "58%", info: "Mylta Power: Doğu kanadı güvenli drop alanı." }
            ]
        },
        miramar: {
            title: "MIRAMAR TACTICAL MAP",
            bgColor: "#42321e",
            waterColor: "#0f1d2a",
            islandColor: "#332616",
            cities: [
                { name: "Pecado (Main)", x: "48%", y: "54%", info: "Pecado: Miramar kalbi. Casino ve Arena noktası." },
                { name: "Hacienda del Patron", x: "60%", y: "39%", info: "Hacienda: Dar alanda hızlı temizleme bölgesi." },
                { name: "Los Leones (Main)", x: "68%", y: "70%", info: "Los Leones: Devasa metropol ve çatı alanları." },
                { name: "El Pozo", x: "28%", y: "25%", info: "El Pozo: Kuzeybatı büyük drop alanı." }
            ]
        },
        rondo: {
            title: "RONDO TACTICAL MAP",
            bgColor: "#1a2c3d",
            waterColor: "#0a131c",
            islandColor: "#12202e",
            cities: [
                { name: "Jadam City (Main)", x: "52%", y: "58%", info: "Jadam City: Yüksek dikey binalar ve sokak splitleri." },
                { name: "NEOX Factory", x: "70%", y: "35%", info: "NEOX Factory: Test pisti ve fabrika bölgesi." },
                { name: "Yu Lin", x: "35%", y: "40%", info: "Yu Lin: Dar sokaklar ve pusu alanları." }
            ]
        }
    };

    let currentMapKey = "erangel";
    let isPencilOpen = true;
    let isCityInfoOpen = false;
    let currentColor = "#34c759";
    let currentLineWidth = 5;

    const container = document.getElementById("mapDisplayContainer");
    const canvas = document.getElementById("mapCanvas");
    const ctx = canvas.getContext("2d");
    const cityOverlay = document.getElementById("cityOverlay");

    let strokes = []; // Çizimleri hafızada tutar
    let currentStroke = null;

    function resizeAndDraw() {
        canvas.width = container.clientWidth || 600;
        canvas.height = container.clientHeight || 500;
        redrawAll();
    }

    function redrawAll() {
        const m = maps[currentMapKey];
        const w = canvas.width;
        const h = canvas.height;

        // Arka Plan Deniz
        ctx.fillStyle = m.waterColor;
        ctx.fillRect(0, 0, w, h);

        // Ana Karalar
        ctx.fillStyle = m.bgColor;
        if (currentMapKey === 'erangel') {
            ctx.fillRect(w * 0.12, h * 0.1, w * 0.76, h * 0.58);
            ctx.fillStyle = m.islandColor;
            ctx.fillRect(w * 0.28, h * 0.74, w * 0.44, h * 0.2);
            // Köprüler
            ctx.fillStyle = "#666";
            ctx.fillRect(w * 0.4, h * 0.68, w * 0.03, h * 0.06);
            ctx.fillRect(w * 0.58, h * 0.68, w * 0.03, h * 0.06);
        } else if (currentMapKey === 'miramar') {
            ctx.fillRect(w * 0.08, h * 0.08, w * 0.84, h * 0.84);
        } else {
            ctx.fillRect(w * 0.1, h * 0.1, w * 0.8, h * 0.8);
        }

        // Izgaralar (Military Grid)
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += w / 8) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 0; y < h; y += h / 8) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }

        // Başlık
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px 'Segoe UI', sans-serif";
        ctx.fillText(m.title + " (MILITARY GRID)", 20, 35);

        // Yapılan Çizimleri Yeniden Çiz
        strokes.forEach(stroke => {
            if (stroke.points.length < 2) return;
            ctx.beginPath();
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.width;
            ctx.lineCap = "round";
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }
            ctx.stroke();
        });

        loadCities();
    }

    resizeAndDraw();
    window.addEventListener("resize", resizeAndDraw);

    // Harita Değiştirme
    document.querySelectorAll(".map-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".map-btn").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            currentMapKey = e.target.dataset.map;
            strokes = []; // Harita değişince temizle
            redrawAll();
        });
    });

    // Çizim İşlemleri
    let isDrawing = false;

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function startDraw(e) {
        if (!isPencilOpen) return;
        isDrawing = true;
        const pos = getPos(e);
        currentStroke = { color: currentColor, width: currentLineWidth, points: [pos] };
        strokes.push(currentStroke);
    }

    function moveDraw(e) {
        if (!isDrawing || !isPencilOpen) return;
        const pos = getPos(e);
        currentStroke.points.push(pos);
        redrawAll();
    }

    function stopDraw() { isDrawing = false; }

    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", moveDraw);
    canvas.addEventListener("mouseup", stopDraw);

    canvas.addEventListener("touchstart", (e) => { startDraw(e); e.preventDefault(); });
    canvas.addEventListener("touchmove", (e) => { moveDraw(e); e.preventDefault(); });
    canvas.addEventListener("touchend", stopDraw);

    // Butonlar
    document.getElementById("clearCanvasBtn").addEventListener("click", () => {
        strokes = [];
        redrawAll();
    });

    document.querySelectorAll(".color-picker").forEach(p => {
        p.addEventListener("click", (e) => {
            document.querySelectorAll(".color-picker").forEach(x => x.classList.remove("active"));
            e.target.classList.add("active");
            currentColor = e.target.dataset.color;
        });
    });

    document.getElementById("penThickness").addEventListener("change", (e) => {
        currentLineWidth = e.target.value;
    });

    const pencilBtn = document.getElementById("pencilToggleBtn");
    pencilBtn.addEventListener("click", () => {
        isPencilOpen = !isPencilOpen;
        pencilBtn.classList.toggle("active", isPencilOpen);
    });

    const cityBtn = document.getElementById("cityInfoToggleBtn");
    cityBtn.addEventListener("click", () => {
        isCityInfoOpen = !isCityInfoOpen;
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
            dot.addEventListener("click", () => {
                document.getElementById("modalTitle").textContent = city.name;
                document.getElementById("modalDescription").textContent = city.info;
                document.getElementById("cityModal").style.display = "flex";
            });
            cityOverlay.appendChild(dot);
        });
    }

    document.getElementById("modalClose").onclick = () => {
        document.getElementById("cityModal").style.display = "none";
    };

    // Mobil Aç/Kapat
    document.getElementById("mobileMapOpenBtn").onclick = () => {
        document.getElementById("mapSection").classList.add("mobile-active");
        setTimeout(resizeAndDraw, 100);
    };
    document.getElementById("mobileMapCloseBtn").onclick = () => {
        document.getElementById("mapSection").classList.remove("mobile-active");
    };

    // Sohbet
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
        msgDiv.innerHTML = `<div class="message-content"><p>${text.replace(/\n/g, "<br>")}</p></div>`;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    sendBtn.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });
});
