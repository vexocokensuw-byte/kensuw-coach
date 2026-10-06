document.addEventListener("DOMContentLoaded", () => {
    const maps = {
        erangel: {
            title: "ERANGEL TACTICAL MAP",
            bgColor: "#1a3322",
            waterColor: "#0d1b2a",
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
            bgColor: "#4a351e",
            waterColor: "#0d1b2a",
            cities: [
                { name: "Pecado (Main)", x: "48%", y: "54%", info: "Pecado: Miramar kalbi. Casino ve Arena noktası." },
                { name: "Hacienda del Patron", x: "60%", y: "39%", info: "Hacienda: Dar alanda hızlı temizleme bölgesi." },
                { name: "Los Leones (Main)", x: "68%", y: "70%", info: "Los Leones: Devasa metropol alanı." },
                { name: "El Pozo", x: "28%", y: "25%", info: "El Pozo: Kuzeybatı büyük drop alanı." }
            ]
        },
        rondo: {
            title: "RONDO TACTICAL MAP",
            bgColor: "#1f344d",
            waterColor: "#081019",
            cities: [
                { name: "Jadam City (Main)", x: "52%", y: "58%", info: "Jadam City: Yüksek dikey binalar." },
                { name: "NEOX Factory", x: "70%", y: "35%", info: "NEOX Factory: Fabrika bölgesi." },
                { name: "Yu Lin", x: "35%", y: "40%", info: "Yu Lin: Dar sokaklar ve pusu alanları." }
            ]
        }
    };

    let currentMapKey = "erangel";
    let currentColor = "#34c759";
    let currentLineWidth = 5;
    let isPencilActive = true;
    let isCityActive = true;

    const canvas = document.getElementById("drawCanvas");
    const ctx = canvas.getContext("2d");
    const container = document.getElementById("mapDisplayContainer");
    const cityOverlay = document.getElementById("cityOverlay");

    let userStrokes = [];

    function resizeCanvas() {
        canvas.width = container.clientWidth || 600;
        canvas.height = container.clientHeight || 500;
        drawMap();
    }

    function drawMap() {
        const m = maps[currentMapKey];
        const w = canvas.width;
        const h = canvas.height;

        // Deniz
        ctx.fillStyle = m.waterColor;
        ctx.fillRect(0, 0, w, h);

        // Kara
        ctx.fillStyle = m.bgColor;
        ctx.fillRect(w * 0.08, h * 0.08, w * 0.84, h * 0.84);

        if (currentMapKey === "erangel") {
            // Askeri Ada
            ctx.fillStyle = "#122418";
            ctx.fillRect(w * 0.25, h * 0.74, w * 0.5, h * 0.18);
            // Köprüler
            ctx.fillStyle = "#555";
            ctx.fillRect(w * 0.4, h * 0.7, w * 0.03, h * 0.04);
            ctx.fillRect(w * 0.57, h * 0.7, w * 0.03, h * 0.04);
        }

        // Taktik Izgara
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += w / 8) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 0; y < h; y += h / 8) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }

        // Başlık
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText(m.title + " (MILITARY GRID)", 20, 30);

        redrawStrokes();
        renderCities();
    }

    function redrawStrokes() {
        userStrokes.forEach(s => {
            if (s.points.length < 2) return;
            ctx.beginPath();
            ctx.strokeStyle = s.color;
            ctx.lineWidth = s.width;
            ctx.lineCap = "round";
            ctx.moveTo(s.points[0].x, s.points[0].y);
            for (let i = 1; i < s.points.length; i++) {
                ctx.lineTo(s.points[i].x, s.points[i].y);
            }
            ctx.stroke();
        });
    }

    setTimeout(resizeCanvas, 100);
    window.addEventListener("resize", resizeCanvas);

    function switchMap(key) {
        currentMapKey = key;
        userStrokes = [];
        drawMap();
    }

    function renderCities() {
        cityOverlay.innerHTML = "";
        if (!isCityActive) return;

        maps[currentMapKey].cities.forEach(c => {
            const dot = document.createElement("div");
            dot.className = "city-dot";
            dot.style.left = c.x;
            dot.style.top = c.y;
            dot.title = c.name;
            dot.onclick = (e) => {
                e.stopPropagation();
                document.getElementById("modalTitle").textContent = c.name;
                document.getElementById("modalDescription").textContent = c.info;
                document.getElementById("cityModal").style.display = "flex";
            };
            cityOverlay.appendChild(dot);
        });
    }

    document.getElementById("btnErangel").onclick = (e) => { setActiveBtn(e.target); switchMap("erangel"); };
    document.getElementById("btnMiramar").onclick = (e) => { setActiveBtn(e.target); switchMap("miramar"); };
    document.getElementById("btnRondo").onclick = (e) => { setActiveBtn(e.target); switchMap("rondo"); };

    function setActiveBtn(target) {
        document.querySelectorAll(".map-btn").forEach(b => b.classList.remove("active"));
        target.classList.add("active");
    }

    let isDrawing = false;
    let currentStroke = null;

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function startDraw(e) {
        if (!isPencilActive) return;
        isDrawing = true;
        const p = getPos(e);
        currentStroke = { color: currentColor, width: currentLineWidth, points: [p] };
        userStrokes.push(currentStroke);
    }

    function moveDraw(e) {
        if (!isDrawing || !isPencilActive) return;
        const p = getPos(e);
        currentStroke.points.push(p);
        drawMap();
    }

    function stopDraw() { isDrawing = false; }

    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", moveDraw);
    canvas.addEventListener("mouseup", stopDraw);

    canvas.addEventListener("touchstart", (e) => { startDraw(e); e.preventDefault(); });
    canvas.addEventListener("touchmove", (e) => { moveDraw(e); e.preventDefault(); });
    canvas.addEventListener("touchend", stopDraw);

    document.querySelectorAll(".color-picker").forEach(p => {
        p.onclick = (e) => {
            document.querySelectorAll(".color-picker").forEach(x => x.classList.remove("active"));
            e.target.classList.add("active");
            currentColor = e.target.dataset.color;
        };
    });

    document.getElementById("penThickness").onchange = (e) => { currentLineWidth = e.target.value; };
    document.getElementById("clearCanvasBtn").onclick = () => { userStrokes = []; drawMap(); };

    document.getElementById("pencilToggleBtn").onclick = (e) => {
        isPencilActive = !isPencilActive;
        e.currentTarget.classList.toggle("active", isPencilActive);
    };

    document.getElementById("cityInfoToggleBtn").onclick = (e) => {
        isCityActive = !isCityActive;
        e.currentTarget.classList.toggle("active", isCityActive);
        cityOverlay.style.display = isCityActive ? "block" : "none";
        renderCities();
    };

    document.getElementById("modalClose").onclick = () => {
        document.getElementById("cityModal").style.display = "none";
    };

    document.getElementById("mobileMapOpenBtn").onclick = () => {
        document.getElementById("mapSection").classList.add("mobile-active");
        setTimeout(resizeCanvas, 100);
    };
    document.getElementById("mobileMapCloseBtn").onclick = () => {
        document.getElementById("mapSection").classList.remove("mobile-active");
    };

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
            addMessage("🚨 KENSUW Coach: Sunucuya erişilemedi.", "ai");
        }
    }

    function addMessage(text, sender) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `message ${sender === 'user' ? 'user-message' : 'ai-message'}`;
        msgDiv.innerHTML = `<div class="message-content"><p>${text.replace(/\n/g, "<br>")}</p></div>`;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    sendBtn.onclick = sendMessage;
    userInput.onkeypress = (e) => { if (e.key === "Enter") sendMessage(); };
});
