async function sendMessage() {
    let inputField = document.getElementById("userInput");
    let messageText = inputField.value.trim();
    let selectedMap = document.getElementById("map").value;

    if (messageText === "") return;

    let chatBox = document.getElementById("chatBox");

    // Kullanıcının mesajını ekrana ekle
    let userMessageDiv = document.createElement("div");
    userMessageDiv.className = "message user-message";
    userMessageDiv.textContent = messageText;
    chatBox.appendChild(userMessageDiv);

    // Kutucuğu temizle
    inputField.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    // Yükleniyor mesajı ekle
    let loadingDiv = document.createElement("div");
    loadingDiv.className = "message ai-message";
    loadingDiv.innerHTML = "⏳ <i>Koç analizi hesaplanıyor...</i>";
    chatBox.appendChild(loadingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        // Python Backend'e istek at
        let response = await fetch("http://127.0.0.1:5000/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: messageText,
                map: selectedMap
            })
        });

        let data = await response.json();
        
        // Yükleniyor yazısını gerçek yanıtla değiştir
        loadingDiv.innerHTML = data.reply;
    } catch (error) {
        loadingDiv.innerHTML = "❌ <b>Hata:</b> Python sunucusuna bağlanılamadı. Lütfen 'py app.py' komutunun çalıştığından emin olun.";
    }

    chatBox.scrollTop = chatBox.scrollHeight;
}

// Enter tuşu desteği
document.getElementById("userInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});