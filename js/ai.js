"use strict";
import theme from "./theme.js";
import configuration from "./configuration.js";
import { sourceEditor } from "./ide.js";

const THREAD = [
    {
        role: "system",
        content: `
你是一个集成到在线代码编辑器中的人工智能助手。
你的主要工作是帮助用户解决代码问题，但你也应该能够进行轻松随意的交谈。

以下是您的指南：
1. **如果用户寻求编程帮助**：
   - 始终考虑用户提供的代码。
   - 分析代码并提供相关帮助（调试、优化、解释等）。
   - 在解释关于他们代码的事情时，一定要具体且清晰。

2. **如果用户提出了一个随意的问题或发表了一个随意的陈述**：
   - 进行友好、自然的交谈。
   - 除非用户主动提及或寻求帮助，否则不要引用用户的代码。
   - 交谈时要礼貌。

3. **如果用户的信息含糊不清或不明确**：
   - 礼貌地请求澄清或获取更多细节，以便更好地理解用户的需求。
   - 如果用户对某事感到困惑，帮助他们找到所需信息。

4. **总体行为**：
   - 始终以乐于助人、友好且专业的语气回应。
   - 永远不要假设用户的意图。如果不确定，就问一些澄清性的问题。
   - 即使用户没有直接询问他们的代码，也要保持对话的自然流畅。

你将始终能够访问用户的最新代码。
仅在与用户信息相关时使用此上下文。
如果他们的信息与代码无关，那么只需关注他们的对话意图。

        `.trim()
    }
];

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("judge0-chat-form").addEventListener("submit", async function (event) {
        event.preventDefault();

        const userInput = document.getElementById("judge0-chat-user-input");
        const userInputValue = userInput.value.trim();
        if (userInputValue === "") {
            return;
        }

        const sendButton = document.getElementById("judge0-chat-send-button");

        sendButton.classList.add("loading");
        userInput.disabled = true;

        const userMessage = document.createElement("div");
        userMessage.innerText = userInputValue;
        userMessage.classList.add("ui", "message", "judge0-message", "judge0-user-message");
        if (!theme.isLight()) {
            userMessage.classList.add("inverted");
        }

        const messages = document.getElementById("judge0-chat-messages");
        messages.appendChild(userMessage);

        userInput.value = "";
        messages.scrollTop = messages.scrollHeight;

        THREAD.push({
            role: "user",
            content: `
User's code:
${sourceEditor.getValue()}

User's message:
${userInputValue}
`.trim()
        });


        const aiMessage = document.createElement("div");
        aiMessage.classList.add("ui", "basic", "segment", "judge0-message", "loading");
        if (!theme.isLight()) {
            aiMessage.classList.add("inverted");
        }
        messages.appendChild(aiMessage);
        messages.scrollTop = messages.scrollHeight;

        const aiResponse = await puter.ai.chat(THREAD, {
            model: document.getElementById("judge0-chat-model-select").value,
        });
        let aiResponseValue = aiResponse.toString();
 
        if (typeof aiResponseValue !== "string") {
            aiResponseValue = aiResponseValue.map(v => v.text).join("\n");
        }

        THREAD.push({
            role: "assistant",
            content: aiResponseValue
        });

        aiMessage.textContent = aiResponseValue;
        renderMathInElement(aiMessage, {
            delimiters: [
                { left: "\\(", right: "\\)", display: false },
                { left: "\\[", right: "\\]", display: true }
            ]
        });
        aiMessage.innerHTML = marked.parse(aiMessage.textContent);

        aiMessage.classList.remove("loading");
        messages.scrollTop = messages.scrollHeight;

        userInput.disabled = false;
        sendButton.classList.remove("loading");
        userInput.focus();
    });

    document.getElementById("judge0-chat-model-select").addEventListener("change", function () {
        const userInput = document.getElementById("judge0-chat-user-input");
        userInput.placeholder = ``;
    });
});

document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
            case "p":
                if (!configuration.get("appOptions.showAIAssistant")) {
                    break;
                }
                e.preventDefault();
                document.getElementById("judge0-chat-user-input").focus();
                break;
        }
    }
});
