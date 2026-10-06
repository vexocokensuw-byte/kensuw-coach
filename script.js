document.addEventListener("DOMContentLoaded", () => {
    const mapData = {
        erangel: {
            title: "ERANGEL TACTICAL MAP (MILITARY GRID)",
            bg: "#0f1d2a",
            island: "#1b3823",
            subIsland: "#162e1d",
            showSub: true,
            cities: [
                { name: "Pochinki (Main Drop)", x: "48%", y: "45%", info: "Pochinki: Erangel merkez drop ve rotasyon kavşağı." },
                { name: "School & Apartments", x: "54%", y: "38%", info: "School: Erken çatışma ve çatı kontrol noktası." },
                { name: "Sosnovka Military Base", x: "60%", y: "84%", info: "Military Base: Ada bölgesi. Köprü kontrolü şart." },
                { name: "Georgopol Containers", x: "24%", y: "25%", info: "Georgopol: Konteyner splitleri." },
                { name: "Mylta Power", x: "82%", y: "54%", info: "Mylta Power: Doğu kanadı güvenli drop alanı." }
            ]
        },
        miramar: {
            title: "MIRAMAR TACTICAL MAP (MILITARY GRID)",
            bg: "#0f1d2a",
            island: "#42321e",
            subIsland: "#332616",
            showSub: false,
            cities: [
                { name: "Pecado (Main Drop)", x: "48%", y: "50%", info: "Pecado: Miramar kalbi. Casino ve Arena noktası." },
                { name: "Hacienda del Patron", x: "60%", y: "35%", info: "Hacienda: Dar alanda hızlı temizleme bölgesi." },
                { name: "Los Leones (Main)", x: "68%", y: "68%", info: "Los Leones: Devasa metropol alanı." },
                { name: "El Pozo", x: "28%", y: "22%", info: "El Pozo: Kuzeybatı büyük drop alanı." }
            ]
        },
        rondo: {
            title: "RONDO TACTICAL MAP (MILITARY GRID)",
            bg: "#0a131c",
            island: "#1a2c3d",
            subIsland: "#12202e",
            showSub: false,
            cities: [
                { name: "Jadam City (Main)", x: "52%", y: "52%", info: "Jadam City: Yüksek dikey binalar." },
                { name: "NEOX Factory", x: "70%", y: "30%", info: "NEOX Factory: Fabrika bölgesi." },
                { name: "Yu Lin", x: "35%", y: "38%", info: "Yu Lin: Dar sokaklar ve pusu alanları." }
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

    function resizeCanvas() {
        canvas.width = container.clientWidth || 600;
        canvas.height = container.clientHeight || 500;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // HARİTA DEĞİŞTİRME
    function switchMap(key) {
        currentMapKey = key;
        const m = mapData[key];

        document.getElementById("mapBg").setAttribute("fill", m.bg);
        document.getElementById("mapIsland").setAttribute("fill", m.island);
        document.getElementById("mapTitleText").textContent = m.title;

        const sub = document.getElementById("mapSubIsland");
        const b1 = document.getElementById("bridge1");
        const b2 = document.getElementById("bridge2");

        if (m.showSub) {
            sub.style.display = "block";
            b1.style.display = "block";
            b2.style.display = "block";
        } else {
            sub.style.display = "none";
            b1.style.display = "none";
            b2.style.display = "none";
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderCities();
    }

    function renderCities() {
        cityOverlay.innerHTML = "";
        if (!isCityActive) return;

        const cities = mapData[currentMapKey].cities;
        cities.forEach(c => {
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

    renderCities();

    // HARİTA BUTONLARI TIKLAMA
    const btnErangel = document.getElementById("btnErangel");
    const btnMiramar = document.getElementById("btnMiramar");
    const btnRondo = document.getElementById("btnRondo");

    if (btnErangel) btnErangel.onclick = (e) => { setActiveBtn(e.target); switchMap("erangel"); };
    if (btnMiramar) btnMiramar.onclick = (e) => { setActiveBtn(e.target); switchMap("miramar"); };
    if (btnRondo) btnRondo.onclick = (e) => { setActiveBtn(e.target); switchMap("rondo"); };

    function setActiveBtn(target) {
        document.querySelectorAll(".map-btn").forEach(b => b.classList.remove("active"));
        target.classList.add("active");
    }

    // ÇİZİM KODLARI
    let isDrawing = false;

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
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
    }

    function moveDraw(e) {
        if (!isDrawing || !isPencilActive) return;
        const p = getPos(e);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentLineWidth;
        ctx.lineCap = "round";
        ctx.stroke();
    }

    function stopDraw() { isDrawing = false; }

    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", moveDraw);
    canvas.addEventListener("mouseup", stopDraw);

    canvas.addEventListener("touchstart", (e) => { startDraw(e); e.preventDefault(); });
    canvas.addEventListener("touchmove", (e) => { moveDraw(e); e.preventDefault(); });
    canvas.addEventListener("touchend", stopDraw);

    // RENK SEÇİMİ
    document.querySelectorAll(".color-picker").forEach(p => {
        p.onclick = (e) => {
            document.querySelectorAll(".color-picker").forEach(x => x.classList.remove("active"));
            e.target.classList.add("active");
            currentColor = e.target.dataset.color;
        };
    });

    document.getElementById("penThickness").onchange = (e) => {
        currentLineWidth = e.target.value;
    };

    document.getElementById("clearCanvasBtn").onclick = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    document.getElementById("pencilToggleBtn").onclick = (e) => {
        isPencilActive = !isPencilActive;
        e.currentTarget.classList.toggle("active", isPencilActive);
    };

    document.getElementById("cityInfoToggleBtn").onclick = (e) => {
        isCityActive = !isCityActive;
        e.currentTarget.classList.toggle("active", isCityActive);
        cityOverlay.classList.toggle("active", isCityActive);
        renderCities();
    };

    document.getElementById("modalClose").onclick = () => {
        document.getElementById("cityModal").style.display = "none";
    };

    // MOBİL
    document.getElementById("mobileMapOpenBtn").onclick = () => {
        document.getElementById("mapSection").classList.add("mobile-active");
        setTimeout(resizeCanvas, 100);
    };

    document.getElementById("mobileMapCloseBtn").onclick = () => {
        document.getElementById("mapSection").classList.remove("mobile-active");
    };

    // CHAT
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
