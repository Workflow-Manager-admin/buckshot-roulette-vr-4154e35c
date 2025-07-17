import React, { useState, useRef, useEffect } from "react";
import { getDarkThemeColors } from "./api";

// PUBLIC_INTERFACE
export function VRLobby({ lobbies, onJoin, onCreate, onSelect, selectedLobbyId }) {
  /**
   * VRLobby: Panel to list, join, and create lobbies, with a gritty VR look
   * Props: 
   *  lobbies: [{ lobby_id, host_id, players, max_players }]
   *  onJoin(lobby_id), onCreate(), onSelect(lobby_id)
   */
  const colors = getDarkThemeColors();
  return (
    <div className="vr-panel vr-lobby" style={{
      background: `linear-gradient(145deg, ${colors.primary} 60%, ${colors.secondary} 98%)`,
      color: colors.text,
      border: `2px solid ${colors.border}`,
      borderRadius: 14,
      padding: 18,
      minWidth: 340
    }}>
      <h2 style={{ color: colors.accent, textShadow: "0 2px 10px #600" }}>Buckshot Roulette Lobbies</h2>
      <ul className="vr-lobby-list">
        {lobbies.map(lobby => (
          <li key={lobby.lobby_id}
              style={{
                background: selectedLobbyId === lobby.lobby_id
                  ? colors.secondary
                  : colors.surface,
                borderRadius: 8,
                margin: "10px 0",
                boxShadow: selectedLobbyId === lobby.lobby_id
                  ? `0 0 12px ${colors.accent}`
                  : "",
                cursor: "pointer",
                color: selectedLobbyId === lobby.lobby_id
                  ? colors.primary
                  : colors.text
              }}
              onClick={() => onSelect(lobby.lobby_id)}
          >
            <strong>{lobby.lobby_id.slice(0, 6).toUpperCase()}</strong>
            {" "}Host: {lobby.host_id} | {lobby.players.length}/{lobby.max_players}
            <button
              className="vr-btn"
              style={{
                marginLeft: 14,
                background: colors.accent,
                color: "#fff",
                border: "none",
                borderRadius: 5
              }}
              disabled={lobby.players.length >= lobby.max_players}
              onClick={e => { e.stopPropagation(); onJoin(lobby.lobby_id); }}
            >Join</button>
          </li>
        ))}
      </ul>
      <button
        className="vr-btn"
        style={{
          marginTop: 18,
          background: colors.primary,
          color: colors.accent,
          border: `2px solid ${colors.accent}`,
          borderRadius: 7
        }}
        onClick={onCreate}
      >Create New Lobby</button>
    </div>
  );
}

// PUBLIC_INTERFACE
export function VRAuthPanel({ onLogin, onRegister, error }) {
  /**
   * VRAuthPanel: Handles login/register input fields and calls handlers
   */
  const colors = getDarkThemeColors();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="vr-panel vr-auth" style={{
      background: colors.surface,
      border: `2px solid ${colors.accent}`,
      borderRadius: 13,
      color: colors.textStrong,
      width: 340,
      margin: "40px auto",
      padding: 26
    }}>
      <h2 style={{ color: colors.accent, marginBottom: 16 }}>{mode === "login" ? "Log In" : "Register"}</h2>
      <form
        onSubmit={e => {
          e.preventDefault();
          (mode === "login"
            ? onLogin({ email, password })
            : onRegister({ email, username, password }));
        }}
        autoComplete="off"
      >
        <input
          style={inputStyle(colors)}
          type="email"
          placeholder="Email"
          required value={email}
          onChange={e => setEmail(e.target.value)}
        /><br />
        {mode === "register" && (
          <input
            style={inputStyle(colors)}
            type="text"
            placeholder="Username"
            minLength={3} maxLength={30}
            required value={username}
            onChange={e => setUsername(e.target.value)}
          />
        )}<br />
        <input
          style={inputStyle(colors)}
          type="password"
          placeholder="Password"
          minLength={6}
          required value={password}
          onChange={e => setPassword(e.target.value)}
        /><br />
        {error && <div style={{
          color: colors.accent,
          margin: "10px 0"
        }}>{error}</div>}
        <button
          type="submit"
          className="vr-btn"
          style={{
            background: colors.accent,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            width: "100%",
            marginTop: 14
          }}
        >
          {mode === "login" ? "Log In" : "Register"}
        </button>
      </form>
      <div style={{ marginTop: 14 }}>
        <button
          className="vr-btn"
          style={{
            background: "transparent",
            color: colors.secondary,
            border: "none",
            textDecoration: "underline"
          }}
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >Switch to {mode === "login" ? "Register" : "Log In"}</button>
      </div>
    </div>
  );
}

function inputStyle(colors) {
  return {
    width: "89%",
    padding: 8,
    borderRadius: 6,
    border: `1.5px solid ${colors.secondary}`,
    margin: "8px 0",
    background: "#23272B",
    color: "#FFF",
    fontSize: 16,
    letterSpacing: 1
  };
}

// PUBLIC_INTERFACE
export function VRAvatar({ username, highlight }) {
  /**
   * VRAvatar: Simple stylized VR avatar
   */
  const colors = getDarkThemeColors();
  return (
    <div style={{
      display: "inline-block",
      borderRadius: "50%",
      width: 38, height: 38,
      background: highlight
        ? `radial-gradient(circle at 70% 30%, ${colors.accent} 60%, ${colors.secondary} 100%)`
        : colors.secondary,
      border: `2px solid ${highlight ? colors.accent : colors.secondary}`,
      margin: 2,
      color: "#19192F",
      fontWeight: 800,
      fontSize: 18,
      boxShadow: highlight ? `0 0 10px ${colors.accent}` : "none",
      verticalAlign: "middle",
      textAlign: "center",
      lineHeight: "38px"
    }}>
      {username?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

// PUBLIC_INTERFACE
export function VRProfilePanel({ user, onLogout }) {
  /**
   * VRProfilePanel: Displays user info, user_id, and logout
   */
  const colors = getDarkThemeColors();
  return (
    <div className="vr-panel vr-profile" style={{
      background: colors.surface,
      border: `2px solid ${colors.primary}`,
      borderRadius: 11,
      color: colors.textStrong,
      minWidth: 250,
      padding: 15
    }}>
      <VRAvatar username={user.username} highlight />
      <div><strong>{user.username}</strong></div>
      <div style={{ fontSize: 13, opacity: 0.8 }}>ID: <code>{user.user_id.slice(0, 6).toUpperCase()}</code></div>
      <div style={{ fontSize: 12, color: colors.textDisabled, marginTop: 5 }}>{user.email}</div>
      <button className="vr-btn" style={{
        marginTop: 8,
        background: colors.accent,
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: "6px 22px"
      }} onClick={onLogout}>Logout</button>
    </div>
  );
}

// PUBLIC_INTERFACE
export function VRLeaderboard({ leaderboard }) {
  /**
   * VRLeaderboard: Shows leaderboard, player rankings, scores
   * leaderboard: [{ username, score }]
   */
  const colors = getDarkThemeColors();
  return (
    <div className="vr-panel vr-leaderboard" style={{
      background: colors.primary,
      border: `2.5px solid ${colors.secondary}`,
      borderRadius: 11,
      padding: 18,
      color: colors.secondary,
      minWidth: 280
    }}>
      <h3 style={{
        color: colors.accent,
        textShadow: "0 2px 12px #411"
      }}>LEADERBOARD</h3>
      <table style={{
        width: "100%", borderCollapse: "collapse", fontSize: 15
      }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${colors.secondary}`}}>
            <th style={{ textAlign: "left", color: colors.secondary }}>#</th>
            <th style={{ textAlign: "left", color: colors.secondary }}>Player</th>
            <th style={{ textAlign: "right", color: colors.secondary }}>Score</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry, idx) =>
            <tr key={entry.username}>
              <td style={{ fontWeight: 700 }}>{idx+1}</td>
              <td>
                <VRAvatar username={entry.username} />
                <span style={{ marginLeft: 5 }}>{entry.username}</span>
              </td>
              <td style={{ textAlign: "right", color: colors.text }}>{entry.score}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// PUBLIC_INTERFACE
export function VRChatPanel({ messages, onSend, user_id }) {
  /**
   * VRChatPanel: Gritty chat panel, handles message rendering and send box
   */
  const colors = getDarkThemeColors();
  const [msg, setMsg] = useState("");
  const endRef = useRef();
  useEffect(()=>{
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return (
    <div className="vr-panel vr-chat" style={{
      background: colors.primary,
      border: `2.5px solid ${colors.accent}`,
      borderRadius: 10,
      minWidth: 250,
      maxHeight: 300,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }}>
      <div style={{
        flex: "1 1 auto",
        overflowY: "auto",
        padding: 10,
        fontSize: 14,
        color: colors.text
      }}>
        {messages.map((m, idx) => (
          <div key={idx} style={{
            marginBottom: 8,
            textAlign: m.user_id === user_id ? "right" : "left"
          }}>
            <VRAvatar username={m.username} highlight={m.user_id === user_id} />{" "}
            <span style={{
              fontWeight: m.user_id === user_id ? 700 : 600,
              color: m.user_id === user_id ? colors.accent : colors.secondary
            }}>{m.username}</span>
            <span style={{
              marginLeft: 7, fontSize: 12, color: colors.textDisabled
            }}>{new Date(m.time).toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"})}</span>
            <div style={{
              color: "#FFF",
              background: m.user_id === user_id ? colors.accent : colors.surface,
              borderRadius: 7,
              display: "inline-block",
              padding: "5px 13px",
              marginLeft: m.user_id === user_id ? 14 : 6,
              marginRight: m.user_id === user_id ? 6 : 14
            }}>{m.text}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={e=>{e.preventDefault(); if(msg.trim()) { onSend(msg); setMsg(""); }}}>
        <input
          type="text"
          value={msg}
          onChange={e=>setMsg(e.target.value)}
          placeholder="Type a message..."
          style={{
            width: "78%",
            padding: 6,
            border: "none",
            borderRadius: 7,
            margin: "0 5px 10px 8px"
          }}
        />
        <button type="submit" className="vr-btn" style={{
          width: "18%", borderRadius: 7, marginBottom: 9, background: colors.accent, color: "#FFF"
        }}>Send</button>
      </form>
    </div>
  );
}

// PUBLIC_INTERFACE
export function VRContextPanels({ children, activePanel, onClosePanel }) {
  /**
   * VRContextPanels: Panel manager showing only the currently active context-dependent panel
   * Props: children: e.g. { lobby: <LobbyPanel/>, chat: <ChatPanel/>, ...}
   * activePanel: string or null
   */
  return (<>
    {Object.entries(children).map(([name, panel]) =>
      name === activePanel && (
        <div key={name}
             style={{
               position: "absolute",
               top: 30, left: 0, right: 0,
               margin: "auto",
               zIndex: 50,
               display: "flex",
               justifyContent: "center"
             }}>
           <div style={{
             position: "relative"
           }}>
            {panel}
            <button style={{
              position: "absolute",
              top: 3, right: 3,
              background: "#19191aB0", color: "#FFF", border: "none", borderRadius: "40%",
              fontWeight: 700, fontSize: 21, width: 30, height: 30, cursor: "pointer"
            }} onClick={onClosePanel}>✕</button>
           </div>
         </div>
      )
    )}
  </>);
}

// PUBLIC_INTERFACE
export function VRAnimatedRouletteTable({ tableState, onSpin, isPlayerTurn, animationTrigger }) {
  /**
   * VRAnimatedRouletteTable: 3D effect, animated, grim roulette table & gun; passes user interaction up.
   * tableState: state descriptor from backend (chamber, players, etc.)
   * animationTrigger: use state to trigger animation
   * onSpin: called when handle/spin is activated
   * isPlayerTurn: bool, display appropriately
   */
  const refSpin = useRef();
  const colors = getDarkThemeColors();
  // Animate "spin" when animationTrigger changes
  useEffect(() => {
    if (refSpin.current) {
      refSpin.current.classList.remove("vr-spin-animation");
      void refSpin.current.offsetWidth; // Trigger DOM reflow
      refSpin.current.classList.add("vr-spin-animation");
    }
  }, [animationTrigger]);
  return (
    <div className="vr-panel vr-table" style={{
      width: 470,
      background: `radial-gradient(circle at 40% 35%, #39220f 75%, ${colors.primary} 100%)`,
      border: `4.5px solid ${colors.accent}`,
      borderRadius: 41,
      margin: "30px auto 0 auto",
      padding: 38,
      boxShadow: `0 0 28px 7px #131111BF, 0 12px 20px #0a090a`
    }}>
      <div ref={refSpin} style={{
        width: 198,
        height: 198,
        margin: "0 auto",
        borderRadius: "50%",
        border: `6px double ${colors.secondary}`,
        boxShadow: `0 0 0 12px ${colors.primary}`,
        background: "linear-gradient(120deg, #282014 80%, #ba9040 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        animation: isPlayerTurn ? "vr-pulse 1.5s infinite alternate" : "none",
        filter: isPlayerTurn ? `drop-shadow(0 0 16px ${colors.accent})` : "none"
      }}>
        <div style={{
          width: 67, height: 67, borderRadius: "50%",
          background: "#201c0e", border: `6px solid ${colors.accent}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: colors.text, fontSize: 29, fontWeight: 800,
          boxShadow: `0 0 21px 3px #282014`
        }}>
          {tableState?.chamber ?? "?"}
        </div>
        {/* Visual spinning chamber effect using simple pseudo 3D */}
        {[...Array(6)].map((_, idx) => (
          <div key={idx} style={{
            position: "absolute",
            top: 88 + 60 * Math.sin((idx/6) * 2 * Math.PI),
            left: 88 + 60 * Math.cos((idx/6) * 2 * Math.PI),
            width: 31, height: 31,
            borderRadius: "50%",
            background: idx === (tableState?.loadedSlot ?? -1)
              ? colors.accent
              : "#2d2321",
            border: `2.5px solid ${colors.secondary}`,
            boxShadow: `0 0 9px #472c19BF`
          }} />
        ))}
      </div>
      {/* Gun + Rest of Table */}
      <div style={{
        marginTop: 41,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{
          background: "linear-gradient(110deg, #bfa764 47%, #13110c 100%)",
          borderRadius: "23px 23px 99px 99px",
          width: 65, height: 25,
          marginRight: 24,
          boxShadow: "0 2px 14px #352510"
        }}/>
        <div style={{
          background: "#A97E44",
          width: 18, height: 54,
          borderRadius: "9px 7px 24px 14px",
          marginRight: 6,
          boxShadow: "0 2px 14px #6a410f"
        }}/>
        {/* Spin trigger: */}
        <button
          className="vr-btn"
          disabled={!isPlayerTurn}
          style={{
            background: isPlayerTurn ? colors.accent : colors.secondary,
            color: isPlayerTurn ? "#FFF" : "#23272B",
            fontWeight: 700, fontSize: 19,
            border: "none", borderRadius: 13, padding: "12px 31px",
            transform: isPlayerTurn ? "scale(1.09)" : "",
            boxShadow: isPlayerTurn ?
              `0 0 16px ${colors.accent}` : undefined,
            marginLeft: 18,
            cursor: isPlayerTurn ? "pointer" : "not-allowed"
          }}
          onClick={onSpin}
        >Spin / Shoot</button>
      </div>
    </div>
  );
}
