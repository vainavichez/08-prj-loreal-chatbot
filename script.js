/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendButton = chatForm.querySelector('button[type="submit"]');
const workerURL = "https://summer-wood-e4af.chvainavi.workers.dev/"; // Replace with your Cloudflare Worker URL
const conversation = [];

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

// Add a labeled message to the chat window without treating its text as HTML.
function addMessage(role, text) {
  const messageElement = document.createElement("p");
  messageElement.className = `msg ${role}`;
  messageElement.textContent =
    `${role === "user" ? "You" : "L'Oréal Assistant"}: ${text}`;
  chatWindow.appendChild(messageElement);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Send the conversation to the Cloudflare Worker and display its reply.
chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = userInput.value.trim();
  if (!message) {
    return;
  }

  addMessage("user", message);
  userInput.value = "";
  sendButton.disabled = true;

  const waitingMessage = document.createElement("p");
  waitingMessage.className = "msg ai";
  waitingMessage.textContent = "L'Oréal Assistant: Waiting for response...";
  chatWindow.appendChild(waitingMessage);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  const messages = [
    ...conversation,
    { role: "user", content: message },
  ];

  try {
    const response = await fetch(workerURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}.`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      throw new Error("The response did not contain a message.");
    }

    conversation.push(
      { role: "user", content: message },
      { role: "assistant", content: reply },
    );
    waitingMessage.textContent = `L'Oréal Assistant: ${reply}`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  } catch (error) {
    console.error("Could not get a chat response:", error);
    waitingMessage.textContent =
      "L'Oréal Assistant: Sorry, I couldn't get a response. Please check your connection and try again.";
    chatWindow.scrollTop = chatWindow.scrollHeight;
  } finally {
    sendButton.disabled = false;
  }
});
