document.addEventListener("DOMContentLoaded", () => {
    const maps = {
        erangel: {
            title: "ERANGEL TACTICAL MAP (MILITARY GRID)",
            mainFill: "#1b3823",
            subShow: true,
            cities: [
                { name: "Pochinki (Main)", x: "47%", y: "49%", info: "Pochinki: Erangel merkez drop ve rotasyon kavşağı." },
                { name: "School & Apartments", x: "53%", y: "42%", info: "School: Erken çatışma ve çatı kontrol noktası." },
                { name: "Sosnovka Military Base", x: "60%", y: "82%", info: "Military Base: Ada bölgesi. Köprü kontrolü önemli." },
                { name: "Georgopol Containers", x: "24%", y: "28%", info: "Georgopol: Konteyner splitleri ve Batı rotasyonu." },
                { name: "Mylta Power", x: "84%", y: "58%", info: "Mylta Power: Doğu kanadı güvenli drop alanı." }
            ]
        },
        miramar: {
            title: "MIRAMAR TACTICAL MAP (MILITARY GRID)",
            mainFill: "#42321e",
            subShow: false,
            cities: [
                { name: "Pecado (Main)", x: "48%", y: "54%", info: "Pecado: Miramar kalbi. Casino ve Arena noktası." },
                { name: "Hacienda del Patron", x: "60%", y: "39%", info: "Hacienda: Dar alanda hızlı temizleme bölgesi." },
                { name: "Los Leones (Main)", x: "68%", y: "70%", info: "Los Leones: Devasa metropol alanı." },
                { name: "El Pozo", x: "28%", y: "25%", info: "El Pozo: Kuzeybatı büyük drop alanı." }
            ]
        },
        rondo: {
            title: "RONDO TACTICAL MAP (MILITARY GRID)",
            mainFill: "#1a2c3d",
            subShow: false,
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

    function fitCanvas() {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    }

    fitCanvas();
    window.addEventListener("resize", fitCanvas);

    function switchMap(key) {
        currentMapKey = key;
        const m = maps[key];

        document.getElementById("mainIsland").setAttribute("fill", m.mainFill);
        document.getElementById("mapTitle").textContent = m.title;

        const sub = document.getElementById("subIsland");
        const b1 = document.getElementById("bridge1");
        const b2 = document.getElementById("bridge2");

        if (m.subShow) {
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

    renderCities();

    document.getElementById("btnErangel").onclick = (e) => { setActiveBtn(e.target); switchMap("erangel"); };
    document.getElementById("btnMiramar").onclick = (e) => { setActiveBtn(e.target); switchMap("miramar"); };
    document.getElementById("btnRondo").onclick = (e) => { setActiveBtn(e.target); switchMap("rondo"); };

    function setActiveBtn(target) {
        document.querySelectorAll(".map-btn").forEach(b => b.classList.remove("active"));
        target.classList.add("active");
    }

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

    document.querySelectorAll(".color-picker").forEach(p => {
        p.onclick = (e) => {
            document.querySelectorAll(".color-picker").forEach(x => x.classList.remove("active"));
            e.target.classList.add("active");
            currentColor = e.target.dataset.color;
        };
    });

    document.getElementById("penThickness").onchange = (e) => { currentLineWidth = e.target.value; };
    document.getElementById("clearCanvasBtn").onclick = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); };
    
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
        setTimeout(fitCanvas, 100);
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
