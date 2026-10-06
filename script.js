document.addEventListener("DOMContentLoaded", () => {
    // Harita Bağlantıları
    const maps = {
        erangel: {
            img: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop",
            cities: [
                { name: "Pochinki", x: "48%", y: "48%", info: "Pochinki: Haritanın tam merkezinde yüksek loot ve yoğun çatışma bölgesi." },
                { name: "School", x: "54%", y: "42%", info: "School: Hızlı aksiyon arayanların ilk tercihi olan orta alan." },
                { name: "Military Base", x: "60%", y: "80%", info: "Sosnovka Military Base: En üst seviye zırh ve kaskların çıktığı ada bölgesi." }
            ]
        },
        miramar: {
            img: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1000&auto=format&fit=crop",
            cities: [
                { name: "Pecado", x: "50%", y: "52%", info: "Pecado: Casino ve Arena binalarıyla Miramar'ın kalbi." },
                { name: "Hacienda", x: "62%", y: "38%", info: "Hacienda del Patron: Çok dar alanda yüksek riskli lüks villa alanı." }
            ]
        },
        rondo: {
            img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop",
            cities: [
                { name: "Jadam City", x: "45%", y: "55%", info: "Jadam City: Yüksek binalar ve dikey çatışmalar içeren büyük metropol." }
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
        canvas.width = mapImg.clientWidth;
        canvas.height = mapImg.clientHeight;
    }

    mapImg.onload = () => {
        resizeCanvas();
        loadCities();
    };

    window.addEventListener("resize", resizeCanvas);

    // Harita Değiştirme
    document.querySelectorAll(".map-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".map-btn").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            currentMapKey = e.target.dataset.map;
            mapImg.src = maps[currentMapKey].img;
            clearCanvas();
        });
    });

    // Kalem / Çizim Mantığı
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

    // Şehir Bilgi Mantığı
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

    // Modal İşlemleri
    const modal = document.getElementById("cityModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalDesc = document.getElementById("modalDescription");
    document.getElementById("modalClose").onclick = () => modal.style.display = "none";

    function showModal(title, desc) {
        modalTitle.textContent = title;
        modalDesc.textContent = desc;
        modal.style.display = "flex";
    }

    // Panel Genişletme (Masaüstü)
    resizeHandle.addEventListener("click", () => {
        mapSection.classList.toggle("expanded");
        const isExpanded = mapSection.classList.contains("expanded");
        resizeIcon.className = isExpanded ? "fa-solid fa-arrows-left-right-to-line" : "fa-solid fa-arrows-left-right";
        setTimeout(resizeCanvas, 300);
    });

    // Mobil Aç / Kapat
    mobileMapOpenBtn.addEventListener("click", () => {
        mapSection.classList.add("mobile-active");
        setTimeout(resizeCanvas, 100);
    });

    mobileMapCloseBtn.addEventListener("click", () => {
        mapSection.classList.remove("mobile-active");
    });

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
            addMessage(`KENSUW Coach Analizi: "${text}" sorunuz için haritada belirtilen taktiksel rotaları izlemeniz önerilir.`, "ai");
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
