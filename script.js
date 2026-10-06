document.addEventListener("DOMContentLoaded", () => {
    // DOĞRUDAN VE KESİNTİSİZ PUBG MOBILE HARİTA GÖRSELLERİ
    const maps = {
        erangel: {
            img: "https://i.imgur.com/8N6Oq2z.jpeg",
            cities: [
                { name: "Pochinki", x: "47%", y: "49%", info: "Pochinki: Haritanın merkezinde yüksek loot ve çatışma bölgesi." },
                { name: "School", x: "53%", y: "42%", info: "School: Hızlı aksiyon arayan oyuncuların ilk tercihi." },
                { name: "Military Base", x: "60%", y: "82%", info: "Sosnovka Military Base: Üst düzey zırh ve silahların çıktığı ada bölgesi." },
                { name: "Georgopol", x: "25%", y: "30%", info: "Georgopol: Konteynerler ve liman bölgesiyle zengin harita alanı." },
                { name: "Mylta Power", x: "85%", y: "58%", info: "Mylta Power: Haritanın doğusundaki yüksek Seviye 3 kask/zırh alanı." }
            ]
        },
        miramar: {
            img: "https://i.imgur.com/O61qK2X.jpeg",
            cities: [
                { name: "Pecado", x: "48%", y: "54%", info: "Pecado: Casino ve Arena binalarıyla Miramar'ın kalbi." },
                { name: "Hacienda del Patron", x: "60%", y: "39%", info: "Hacienda: Çok dar alanda yüksek riskli lüks villa alanı." },
                { name: "El Pozo", x: "28%", y: "25%", info: "El Pozo: Haritanın kuzeybatısındaki devasa şehir bölgesi." },
                { name: "Los Leones", x: "68%", y: "70%", info: "Los Leones: Haritanın en büyük metropol alanı." }
            ]
        },
        rondo: {
            img: "https://i.imgur.com/k4dG5qY.jpeg",
            cities: [
                { name: "Jadam City", x: "52%", y: "58%", info: "Jadam City: Yüksek binalar ve dikey çatışmalar içeren dev metropol." },
                { name: "NEOX Factory", x: "70%", y: "35%", info: "NEOX Factory: Yeni araç test pisti ve fabrika binaları." },
                { name: "Yu Lin", x: "35%", y: "40%", info: "Yu Lin: Geleneksel mimari ve dar sokaklar." }
            ]
        }
    };

    let currentMapKey = "erangel";
    let isPencilOpen = false;
    let isCityInfoOpen = false;
    let currentColor = "#ff3b30";
    let currentLineWidth = 5;

    // DOM Elementleri
    const mapImg = document.getElementById("currentMapImg");
    const canvas = document.getElementById("drawingCanvas");
    const ctx = canvas.getContext("2d");
    const cityOverlay = document.getElementById("cityOverlay");
    
    const pencilToggleBtn = document.getElementById("pencilToggleBtn");
    const pencilBadge = document.getElementById("pencilBadge");
    const penSettings = document.getElementById("penSettings");
    const cityInfoToggleBtn = document.getElementById("cityInfoToggleBtn");
    const cityBadge = document.getElementById("cityBadge");

    const resizeHandle = document.getElementById("resizeHandle");
    const mapSection = document.getElementById("mapSection");
    const resizeIcon = document.getElementById("resizeIcon");

    const mobileMapOpenBtn = document.getElementById("mobileMapOpenBtn");
    const mobileMapCloseBtn = document.getElementById("mobileMapCloseBtn");

    // Canvas Boyutlandırma
    function resizeCanvas() {
        if (!mapImg) return;
        canvas.width = mapImg.clientWidth;
        canvas.height = mapImg.clientHeight;
    }

    mapImg.onload = () => {
        resizeCanvas();
        loadCities();
    };

    window.addEventListener("resize", resizeCanvas);

    // Harita Butonları (Erangel, Miramar, Rondo)
    document.querySelectorAll(".map-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".map-btn").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            currentMapKey = e.target.dataset.map;
            mapImg.src = maps[currentMapKey].img;
            clearCanvas();
        });
    });

    // Çizim Araçları (Kalem)
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

    function stopDrawing() {
        isDrawing = false;
    }

    // Şehir Bilgisi Göster/Gizle
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

    // Masaüstü Panel Genişletme
    if (resizeHandle) {
        resizeHandle.addEventListener("click", () => {
            mapSection.classList.toggle("expanded");
            const isExpanded = mapSection.classList.contains("expanded");
            resizeIcon.className = isExpanded ? "fa-solid fa-arrows-left-right-to-line" : "fa-solid fa-arrows-left-right";
            setTimeout(resizeCanvas, 300);
        });
    }

    // Mobil Aç/Kapat Butonları
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

    function sendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        addMessage(text, "user");
        userInput.value = "";

        setTimeout(() => {
            addMessage(`KENSUW AI Coach Analizi: "${text}" sorusu için seçilen harita üzerindeki taktiksel noktalar işaretlenmiştir.`, "ai");
        }, 800);
    }

    function addMessage(text, sender) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `message ${sender}-message`;
        msgDiv.innerHTML = `<div class="message-content"><p>${text}</p></div>`;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    sendBtn.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });
});
