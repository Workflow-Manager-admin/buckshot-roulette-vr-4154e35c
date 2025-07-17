//
// API: Handles REST requests and WebSocket logic to backend
//
// The URL for the backend API should be updated as appropriate per deployment
//
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";
const WS_BASE = process.env.REACT_APP_WS_URL || "ws://localhost:8000";

export async function apiRegisterUser({ email, username, password }) {
  // PUBLIC_INTERFACE
  // Registers a user
  const resp = await fetch(`${API_BASE}/user/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username, password }),
  });
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}

export async function apiLoginUser({ email, password }) {
  // PUBLIC_INTERFACE
  // Logs in a user
  const resp = await fetch(`${API_BASE}/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}

export async function apiGetProfile(user_id) {
  // PUBLIC_INTERFACE
  // Gets user profile
  const resp = await fetch(`${API_BASE}/user/profile/${user_id}`);
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}

export async function apiCreateLobby({ host_id, max_players }) {
  // PUBLIC_INTERFACE
  // Creates a lobby
  const resp = await fetch(`${API_BASE}/game/lobby/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ host_id, max_players }),
  });
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}

export async function apiJoinLobby({ lobby_id, user_id }) {
  // PUBLIC_INTERFACE
  // Joins a lobby
  const resp = await fetch(`${API_BASE}/game/lobby/${lobby_id}/join?user_id=${encodeURIComponent(user_id)}`, {
    method: "POST"
  });
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}

export async function apiStartGame({ lobby_id }) {
  // PUBLIC_INTERFACE
  // Starts a game in lobby
  const resp = await fetch(`${API_BASE}/game/lobby/${lobby_id}/start`, {
    method: "POST"
  });
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}

export async function apiLobbyState(lobby_id) {
  // PUBLIC_INTERFACE
  // Gets lobby state
  const resp = await fetch(`${API_BASE}/game/lobby/${lobby_id}`);
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}

export async function apiLeaderboard() {
  // PUBLIC_INTERFACE
  // Gets leaderboard
  const resp = await fetch(`${API_BASE}/leaderboard/`);
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}

// PUBLIC_INTERFACE
export function createGameWebSocket({ lobby_id, onMessage, onOpen, onClose, onError }) {
  // Connects to backend game WebSocket for the specified lobby
  const ws = new window.WebSocket(`${WS_BASE}/ws/game/${lobby_id}`);
  ws.onopen = onOpen;
  ws.onclose = onClose;
  ws.onerror = onError;
  ws.onmessage = (e) => {
    if (onMessage) {
      let data;
      try { data = JSON.parse(e.data); } catch { data = e.data; }
      onMessage(data);
    }
  };
  return ws;
}

// PUBLIC_INTERFACE
export function createChatWebSocket({ lobby_id, onMessage, onOpen, onClose, onError }) {
  // Connects to backend chat WebSocket for the specified lobby
  const ws = new window.WebSocket(`${WS_BASE}/ws/chat/${lobby_id}`);
  ws.onopen = onOpen;
  ws.onclose = onClose;
  ws.onerror = onError;
  ws.onmessage = (e) => {
    if (onMessage) {
      let data;
      try { data = JSON.parse(e.data); } catch { data = e.data; }
      onMessage(data);
    }
  };
  return ws;
}

// PUBLIC_INTERFACE
export function getDarkThemeColors() {
  // Returns the color palette recommended for the Buckshot Roulette VR dark style
  return {
    accent: "#C8381D", // deep violent red
    primary: "#23272B", // char/graphite
    secondary: "#BFA764", // brass/gold
    surface: "#18191B", // dark
    border: "#332D26", // dark brass
    textStrong: "#F5F5F5",
    text: "#EEEDEB",
    textDisabled: "#8C8574"
  };
}
