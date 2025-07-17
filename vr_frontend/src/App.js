import React, { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";
import {
  VRAuthPanel,
  VRProfilePanel,
  VRLobby,
  VRLeaderboard,
  VRChatPanel,
  VRContextPanels,
  VRAnimatedRouletteTable,
  VRAvatar,
} from "./components";
import {
  apiRegisterUser,
  apiLoginUser,
  apiGetProfile,
  apiCreateLobby,
  apiJoinLobby,
  apiStartGame,
  apiLobbyState,
  apiLeaderboard,
  createGameWebSocket,
  createChatWebSocket,
  getDarkThemeColors,
} from "./api";

// PUBLIC_INTERFACE
function App() {
  // Theme effect: force dark+gritty style
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    document.body.style.background = "#161618";
  }, []);

  // --- State Management
  const [user, setUser] = useState(null); // {user_id, email, username}
  const [profileError, setProfileError] = useState(null);

  const [lobbies, setLobbies] = useState([]);
  const [selectedLobby, setSelectedLobby] = useState(null);
  const [joinedLobby, setJoinedLobby] = useState(null);

  const [leaderboard, setLeaderboard] = useState([]);
  const [showPanel, setShowPanel] = useState(null); // "lobby", "leaderboard", "chat", "profile"
  const [gameState, setGameState] = useState(null); // { ...from backend }
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [tableAnimationSeed, setTableAnimationSeed] = useState(0);

  const [chatMessages, setChatMessages] = useState([]);
  const gameWSRef = useRef(null);
  const chatWSRef = useRef(null);

  // --- Effect: Fetch lobby and leaderboard (simulate polling)
  useEffect(() => {
    let interval = null;
    if (!joinedLobby) {
      const refresh = () => {
        // Simulate "list all" via backend (workaround: get 30 random lobbies)
        Promise.all([apiLeaderboard()]).then(([leaders]) => {
          setLeaderboard(leaders || []);
        });
      };
      refresh();
      interval = setInterval(refresh, 7000);
    }
    return () => interval && clearInterval(interval);
  }, [joinedLobby]);

  // --- Effect: WebSocket connection for GAME state, reconnect on lobby join
  useEffect(() => {
    if (!joinedLobby?.lobby_id || !user) return;
    if (gameWSRef.current) {
      gameWSRef.current.close();
    }
    setGameState(null);
    setIsPlayerTurn(false);

    gameWSRef.current = createGameWebSocket({
      lobby_id: joinedLobby.lobby_id,
      onOpen: () => {},
      onClose: () => {},
      onError: () => { setGameState({ error: "Connection lost." }); },
      onMessage: (msg) => {
        // Game state update from backend
        setGameState(msg);
        setIsPlayerTurn(msg.currentPlayerId === user.user_id);
        setTableAnimationSeed(Math.random());
      },
    });
    return () => gameWSRef.current && gameWSRef.current.close();
  }, [joinedLobby, user]);

  // --- Effect: WebSocket connection for CHAT, reconnect on lobby join
  useEffect(() => {
    if (!joinedLobby?.lobby_id || !user) return;
    if (chatWSRef.current) {
      chatWSRef.current.close();
    }
    setChatMessages([]);
    chatWSRef.current = createChatWebSocket({
      lobby_id: joinedLobby.lobby_id,
      onOpen: () => {},
      onClose: () => {},
      onError: () => {},
      onMessage: (msg) => {
        setChatMessages((prev) => [...prev, msg]);
      },
    });
    return () => chatWSRef.current && chatWSRef.current.close();
  }, [joinedLobby, user]);

  // --- App Flows ---

  // Auth
  const handleLogin = async ({ email, password }) => {
    try {
      const u = await apiLoginUser({ email, password });
      setUser(u);
      setProfileError(null);
    } catch (e) {
      setProfileError("Invalid login, try again.");
    }
  };
  const handleRegister = async ({ email, username, password }) => {
    try {
      const u = await apiRegisterUser({ email, username, password });
      setUser(u);
      setProfileError(null);
    } catch (e) {
      setProfileError("Registration failed, try another email/username.");
    }
  };
  const handleLogout = () => {
    setUser(null);
    setJoinedLobby(null);
    setGameState(null);
    setSelectedLobby(null);
  };

  // Lobby
  const handleCreateLobby = async () => {
    try {
      const lobby = await apiCreateLobby({ host_id: user.user_id, max_players: 6 });
      setJoinedLobby(lobby);
      setSelectedLobby(lobby.lobby_id);
    } catch (e) {
      // error
    }
  };
  const handleJoinLobby = async (lobby_id) => {
    try {
      const lobby = await apiJoinLobby({ lobby_id, user_id: user.user_id });
      setJoinedLobby(lobby);
    } catch (e) {
      // error
    }
  };

  // Game
  const handleSpin = async () => {
    if (!joinedLobby) return;
    await apiStartGame({ lobby_id: joinedLobby.lobby_id });
  };

  // Chat
  const handleSendChat = (msg) => {
    if (chatWSRef.current && chatWSRef.current.readyState === 1) {
      chatWSRef.current.send(JSON.stringify({
        user_id: user.user_id,
        username: user.username,
        time: Date.now(),
        text: msg,
      }));
    }
  };

  // Panels
  const openPanel = (panel) => setShowPanel(panel);
  const closePanel = () => setShowPanel(null);

  // App Render

  const colors = getDarkThemeColors();

  // If not logged in, show VRAuthPanel centered
  if (!user)
    return (
      <div className="App" style={{
        minHeight: "100vh",
        background: `linear-gradient(100deg, ${colors.primary} 80%, #120b0b 100%)`
      }}>
        <VRAuthPanel onLogin={handleLogin} onRegister={handleRegister} error={profileError} />
      </div>
    );

  // Inside a lobby/game: show 3D VR table, chat, sidebar
  if (joinedLobby)
    return (
      <div className="App" style={{
        height: "100vh", width: "100vw", background: "#131619" }}>
        {/* VR room FX */}
        <div style={{
          zIndex: 1, position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: `linear-gradient(130deg, ${colors.primary} 70%, #110f0f 100%)`
        }}/>
        {/* Main 3D Table */}
        <VRAnimatedRouletteTable
          tableState={gameState}
          onSpin={handleSpin}
          isPlayerTurn={isPlayerTurn}
          animationTrigger={tableAnimationSeed}
        />

        {/* Avatars Around Table */}
        <div style={{
          position: "absolute", bottom: 42, left: 0, right: 0, textAlign: "center"
        }}>
          {joinedLobby.players.map((p, idx) =>
            <span key={p}>
              <VRAvatar username={p} highlight={user.user_id === p}/>
            </span>
          )}
        </div>

        {/* Context-dependent Panels: Chat, Profile, Leaderboard */}
        <VRContextPanels
          activePanel={showPanel}
          onClosePanel={closePanel}
        >
          {{
            chat: <VRChatPanel
              messages={chatMessages}
              onSend={handleSendChat}
              user_id={user.user_id}
            />,
            leaderboard: <VRLeaderboard leaderboard={leaderboard} />,
            profile: <VRProfilePanel user={user} onLogout={handleLogout} />
          }}
        </VRContextPanels>

        {/* VR Controls */}
        <div style={{
          position: "fixed",
          top: 9, left: 9, right: 0,
          zIndex: 55, display: "flex"
        }}>
          <button
            className="vr-btn"
            style={{
              background: "transparent",
              color: colors.secondary,
              border: "2px solid " + colors.accent,
              marginRight: 11,
              borderRadius: 8
            }}
            onClick={()=>openPanel("profile")}
          >Profile</button>
          <button
            className="vr-btn"
            style={{
              background: "transparent",
              color: colors.secondary,
              border: "2px solid " + colors.accent,
              marginRight: 11,
              borderRadius: 8
            }}
            onClick={()=>openPanel("leaderboard")}
          >Leaderboard</button>
          <button
            className="vr-btn"
            style={{
              background: "transparent",
              color: colors.secondary,
              border: "2px solid " + colors.accent,
              borderRadius: 8
            }}
            onClick={()=>openPanel("chat")}
          >Chat</button>
        </div>
      </div>
    );

  // Not in a lobby/game: Show Lobby, Leaderboard, + Profile button
  return (
    <div className="App" style={{
      minHeight:"100vh",
      background: `linear-gradient(115deg, ${colors.primary} 90%, #120b0b 100%)`
    }}>
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        marginTop: 42,
        gap: 38,
      }}>
        <VRLobby
          lobbies={lobbies}
          onJoin={handleJoinLobby}
          onCreate={handleCreateLobby}
          onSelect={setSelectedLobby}
          selectedLobbyId={selectedLobby}
        />
        <VRLeaderboard leaderboard={leaderboard} />
      </div>
      <div style={{ position: "fixed", top: 19, right: 51, zIndex: 55, }}>
        <button
          className="vr-btn"
          style={{
            background: "transparent",
            color: colors.secondary,
            border: `2px solid ${colors.accent}`,
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 15,
            padding: "8px 17px",
          }}
          onClick={() => setShowPanel("profile")}
        >Profile</button>
      </div>
      <VRContextPanels activePanel={showPanel} onClosePanel={closePanel}>
        {{ profile: <VRProfilePanel user={user} onLogout={handleLogout}/>,
           leaderboard: <VRLeaderboard leaderboard={leaderboard}/> }}
      </VRContextPanels>
    </div>
  );
}

export default App;
