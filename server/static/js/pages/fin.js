
import { api } from '../api.js';
import { state } from '../state.js';

export async function renderFinChat(container) {
    let currentSessionId = null;

    container.innerHTML = `
        <div class="fin-chat-layout fade-in" style="display: grid; grid-template-columns: 280px 1fr; gap: 1.5rem; height: calc(100vh - 120px); max-height: calc(100vh - 120px); margin-bottom: 0;">
            
            <!-- Sidebar: Session List -->
            <div class="glass-card" style="display: flex; flex-direction: column; overflow: hidden; padding: 0;">
                <div style="padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <button id="new-chat-btn" class="btn-primary" style="margin-top: 0; display: flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; padding: 0.8rem;">
                        <i data-lucide="plus"></i> ${state.t('new_chat')}
                    </button>
                </div>
                <div id="session-list" class="ios-list" style="border: none; overflow-y: auto; flex: 1;">
                    <!-- Sessions loaded here -->
                    <div class="loading" style="font-size: 0.8rem; padding: 1rem;">Loading...</div>
                </div>
            </div>

            <!-- Chat Window -->
            <div class="glass-card" style="display: flex; flex-direction: column; overflow: hidden; position: relative; padding: 0;">
                
                <!-- Messages Area -->
                <div id="chat-messages" style="flex: 1; overflow-y: auto; padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                    <!-- Messages will appear here -->
                    <div style="text-align: center; margin-top: auto; margin-bottom: auto; opacity: 0.5;">
                        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, var(--c-violet-neon), var(--c-blue-neon)); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem auto; box-shadow: 0 0 20px rgba(var(--p-violet-neon), 0.4);">
                             <i data-lucide="brain-circuit" style="width: 30px; height: 30px; color: white;"></i>
                        </div>
                        <h3>Fin.AI Architect</h3>
                        <p style="font-size: 0.9rem; margin-top: 0.5rem;">${state.t('select_chat_prompt')}</p>
                    </div>
                </div>

                <!-- Input Area -->
                <div style="padding: 1.5rem; background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.05); flex-shrink: 0;">
                    <form id="chat-form" style="position: relative;">
                        <textarea id="chat-input" placeholder="${state.t('chat_placeholder')}" 
                            style="width: 100%; height: 50px; padding: 1rem; padding-right: 60px; border-radius: 25px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; resize: none; font-family: inherit; outline: none; transition: all 0.2s;"
                        ></textarea>
                        <button type="submit" style="position: absolute; right: 5px; bottom: 5px; background: var(--c-violet-neon); border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                            <i data-lucide="send" style="width: 18px; height: 18px; margin-left: 2px;"></i>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Elements
    const sessionListEl = document.getElementById('session-list');
    const messagesEl = document.getElementById('chat-messages');
    const chatTitleEl = document.getElementById('chat-title');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const newChatBtn = document.getElementById('new-chat-btn');

    // --- Helper: Render Markdown ---
    const renderMarkdown = (text) => {
        if (!window.marked) return text;
        return window.marked.parse(text);
    };

    // --- 1. Load Sessions ---
    const loadSessions = async () => {
        try {
            const sessions = await api('/chat/sessions');
            sessionListEl.innerHTML = sessions.map(item => `
                <div class="session-item ios-list-item ${item.id === currentSessionId ? 'active' : ''}" data-id="${item.id}" style="cursor: pointer; padding: 1rem; flex-direction: column; align-items: start; gap: 0.5rem; background: ${item.id === currentSessionId ? 'rgba(255,255,255,0.08)' : 'transparent'}; border-left: ${item.id === currentSessionId ? '3px solid var(--c-violet-neon)' : '3px solid transparent'};">
                    <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                        <span class="session-title" style="font-weight: 500; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;">${item.title}</span>
                        <div class="session-actions" style="opacity: ${item.id === currentSessionId ? 1 : 0}; transition: opacity 0.2s; display: flex; gap: 5px;">
                            <button class="icon-btn rename-btn" data-id="${item.id}" title="Rename" style="background: none; border: none; color: rgba(255,255,255,0.6); cursor: pointer;"><i data-lucide="edit-2" style="width: 14px;"></i></button>
                            <button class="icon-btn delete-btn" data-id="${item.id}" title="Delete" style="background: none; border: none; color: #ff6b6b; cursor: pointer;"><i data-lucide="trash" style="width: 14px;"></i></button>
                        </div>
                    </div>
                    <span style="font-size: 0.7rem; opacity: 0.4;">${new Date(item.updated_at).toLocaleDateString()}</span>
                </div>
            `).join('');

            // Hover logic for actions
            document.querySelectorAll('.session-item').forEach(el => {
                const actions = el.querySelector('.session-actions');
                el.addEventListener('mouseenter', () => actions.style.opacity = 1);
                el.addEventListener('mouseleave', () => {
                    if (el.dataset.id != currentSessionId) actions.style.opacity = 0;
                });

                el.onclick = (e) => {
                    if (!e.target.closest('.icon-btn')) {
                        loadChat(parseInt(el.dataset.id), el.querySelector('.session-title').textContent);
                    }
                };
            });

            // Action Listeners
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.onclick = async (e) => {
                    if (!confirm("Delete this chat?")) return;
                    await api(`/chat/sessions/${btn.dataset.id}`, 'DELETE');
                    if (currentSessionId == btn.dataset.id) {
                        currentSessionId = null;
                        messagesEl.innerHTML = '';
                    }
                    loadSessions();
                };
            });

            document.querySelectorAll('.rename-btn').forEach(btn => {
                btn.onclick = async (e) => {
                    const newTitle = prompt("New Chat Name:");
                    if (newTitle) {
                        await api(`/chat/sessions/${btn.dataset.id}`, 'PATCH', { title: newTitle });
                        loadSessions();
                    }
                };
            });

            if (window.lucide) window.lucide.createIcons();

        } catch (err) {
            console.error(err);
        }
    };

    // --- 2. Load Chat Messages ---
    const loadChat = async (sessionId, title) => {
        currentSessionId = sessionId;
        // chatTitleEl.textContent = title; // Header removed
        messagesEl.innerHTML = '<div class="loading">Loading history...</div>';
        loadSessions(); // Re-render to update active state

        try {
            const messages = await api(`/chat/sessions/${sessionId}/messages`);

            if (messages.length === 0) {
                messagesEl.innerHTML = `
                    <div style="text-align: center; margin-top: auto; margin-bottom: auto; opacity: 0.7;">
                        <p>This is the start of your encrypted session with Fin.</p>
                    </div>
                `;
            } else {
                renderMessages(messages);
            }
        } catch (err) {
            messagesEl.innerHTML = `<div class="error">Failed to load chat: ${err.message}</div>`;
        }
    };

    const renderMessages = (messages) => {
        messagesEl.innerHTML = messages.map(msg => `
            <div class="message fade-in" style="display: flex; gap: 0.8rem; align-items: flex-end; margin-bottom: 1rem; ${msg.role === 'user' ? 'flex-direction: row-reverse;' : ''}">
                <div style="width: 28px; height: 28px; border-radius: 50%; min-width: 28px; background: ${msg.role === 'user' ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, var(--c-violet-neon), var(--c-blue-neon))'}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                    <i data-lucide="${msg.role === 'user' ? 'user' : 'brain-circuit'}" style="width: 14px; height: 14px; color: white;"></i>
                </div>
                <div style="background: ${msg.role === 'user' ? 'var(--c-violet-neon)' : 'rgba(255,255,255,0.08)'}; padding: 0.8rem 1.2rem; border-radius: 18px; border-${msg.role === 'user' ? 'bottom-right' : 'bottom-left'}-radius: 4px; max-width: 75%; box-shadow: 0 2px 8px rgba(0,0,0,0.1); backdrop-filter: blur(10px);">
                    <div class="message-content" style="font-size: 0.95rem; line-height: 1.5; color: ${msg.role === 'user' ? 'white' : 'rgba(255,255,255,0.9)'};">
                        ${msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                    </div>
                    <div style="font-size: 0.65rem; opacity: 0.5; margin-top: 0.4rem; text-align: right;">${new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            </div>
        `).join('');

        messagesEl.scrollTop = messagesEl.scrollHeight;
        if (window.lucide) window.lucide.createIcons();
    };

    // --- 3. Send Message ---
    chatForm.onsubmit = async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        if (!currentSessionId) {
            // Create session first if none exists
            try {
                const session = await api('/chat/sessions', 'POST', { title: text.substring(0, 30) + "..." });
                currentSessionId = session.id;
                loadSessions(); // Reload list to show new session
            } catch (err) {
                alert("Failed to start chat: " + err.message);
                return;
            }
        }

        // Optimistic UI Update
        const tempMsg = {
            role: 'user',
            content: text,
            created_at: new Date().toISOString()
        };
        messagesEl.innerHTML += `
            <div class="message fade-in" style="display: flex; gap: 0.8rem; align-items: flex-end; margin-bottom: 1rem; flex-direction: row-reverse;">
                <div style="width: 28px; height: 28px; border-radius: 50%; min-width: 28px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                    <i data-lucide="user" style="width: 14px; height: 14px; color: white;"></i>
                </div>
                <div style="background: var(--c-violet-neon); padding: 0.8rem 1.2rem; border-radius: 18px; border-bottom-right-radius: 4px; max-width: 75%; box-shadow: 0 2px 8px rgba(0,0,0,0.1); backdrop-filter: blur(10px);">
                    <div class="message-content" style="font-size: 0.95rem; line-height: 1.5; color: white;">${text}</div>
                    <div style="font-size: 0.65rem; opacity: 0.5; margin-top: 0.4rem; text-align: right;">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            </div>
        `;

        // Add Loading Indicator
        const loadingId = 'loading-' + Date.now();
        messagesEl.innerHTML += `
             <div id="${loadingId}" class="message fade-in" style="display: flex; gap: 1rem; align-items: flex-start; margin-bottom: 1.5rem;">
                <div style="width: 32px; height: 32px; border-radius: 50%; min-width: 32px; background: var(--c-violet-neon); display: flex; align-items: center; justify-content: center;">
                     <i data-lucide="loader-2" class="spin" style="width: 16px; height: 16px; color: white; animation: spin 1s linear infinite;"></i>
                </div>
             </div>
             <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
        `;

        messagesEl.scrollTop = messagesEl.scrollHeight;
        if (window.lucide) window.lucide.createIcons();

        chatInput.value = '';

        try {
            await api(`/chat/sessions/${currentSessionId}/message`, 'POST', { message: text });
            // Reload full chat to get AI response and proper formatting
            loadChat(currentSessionId, document.querySelector(`.session-item[data-id="${currentSessionId}"] .session-title`).textContent);
        } catch (err) {
            document.getElementById(loadingId).innerHTML = `<div class="error">Error: ${err.message}</div>`;
        }
    };

    // New Chat Button
    newChatBtn.onclick = async () => {
        try {
            const session = await api('/chat/sessions', 'POST', { title: "New Chat" });
            loadSessions();
            loadChat(session.id, session.title);
        } catch (err) {
            alert(err.message);
        }
    };

    // Initial Load
    loadSessions();
}
