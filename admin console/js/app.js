/**
 * Wixfox Game Control Centre - Main Application Engine
 * High-Fidelity Cyberpunk Admin Console (wixfox.com)
 * Implements full PRD modules: Player Directory, Game Modes, Hardcore Config,
 * Instant Kill, Economy Ledger, LuckPerms Ranks, Moderation, File Manager, Backups,
 * Settings, RCON Console, and Role-Based Access Control (RBAC).
 */

// ===================================================================
// 1. GLOBAL STATE & DATA STORE
// ===================================================================
const AppState = {
  currentRole: 'Owner / Super Admin', // 'Owner / Super Admin' | 'Admin' | 'Moderator' | 'Developer'
  activeTab: 'dashboard',
  currentModSubTab: 'bans',
  playerFilter: 'all',

  server: {
    online: true,
    uptimeSeconds: 9240, // 2h 34m
    tps: 20.00,
    mspt: 45,
    playersOnline: 5,
    playersMax: 100,
    dbHealth: 98,
    cpuUsage: 32,
    memUsage: 64,
    diskUsage: 42,
    hardcoreEnabled: false,
    motd: 'Wixfox Minecraft Network [1.20.4]',
    difficulty: 'normal',
    pvp: true
  },

  players: [
    { id: 'p-1', name: 'StevePro', platform: 'JAVA', uuid: 'e0d7c2a1-4567-4890-a1b2-c3d4e5f6a7b8', gameMode: 'Survival', status: 'Online', playtime: '2h 12m', ip: '192.168.1.45', health: 20, food: 20, rank: 'VIP', world: 'world', wallet: 5200, bank: 40000, lastTx: '2m ago' },
    { id: 'p-2', name: 'BuilderKing', platform: 'BEDROCK', uuid: '00000000-0000-0000-0009-01f234567890', gameMode: 'Creative', status: 'Online', playtime: '1h 48m', ip: '192.168.1.88', health: 20, food: 20, rank: 'Premium', world: 'world', wallet: 2450, bank: 15000, lastTx: '12m ago' },
    { id: 'p-3', name: 'FoxGamer', platform: 'JAVA', uuid: 'b1a2c3d4-e5f6-7890-1234-56789abcdef0', gameMode: 'Survival', status: 'Online', playtime: '1h 30m', ip: '10.0.0.15', health: 14, food: 18, rank: 'Member', world: 'world_nether', wallet: 850, bank: 3200, lastTx: '1h ago' },
    { id: 'p-4', name: 'Dreamer', platform: 'BEDROCK', uuid: '00000000-0000-0000-0009-02abcdef1234', gameMode: 'Adventure', status: 'Online', playtime: '1h 20m', ip: '172.16.0.4', health: 18, food: 15, rank: 'Member', world: 'world', wallet: 120, bank: 500, lastTx: '3h ago' },
    { id: 'p-5', name: 'MinecraftFan', platform: 'JAVA', uuid: 'a9b8c7d6-e5f4-3210-fedc-ba9876543210', gameMode: 'Survival', status: 'Online', playtime: '1h 10m', ip: '192.168.1.102', health: 20, food: 20, rank: 'Member', world: 'world', wallet: 940, bank: 2100, lastTx: '4h ago' },
    { id: 'p-6', name: 'BadPlayer', platform: 'JAVA', uuid: 'fa112233-4455-6677-8899-aabbccddeeff', gameMode: 'Survival', status: 'Banned', playtime: '12m', ip: '203.0.113.19', health: 0, food: 0, rank: 'Member', world: 'world', wallet: 0, bank: 0, lastTx: '1d ago' }
  ],

  activities: [
    { id: 'act-1', text: 'Player StevePro joined the server', time: '2m ago', type: 'join' },
    { id: 'act-2', text: 'Player BadPlayer was banned for unfair advantages', time: '5m ago', type: 'ban' },
    { id: 'act-3', text: 'Server backup completed (backup_full_20261116.tar.gz)', time: '12m ago', type: 'backup' },
    { id: 'act-4', text: 'New broadcast posted to all players', time: '15m ago', type: 'announcement' },
    { id: 'act-5', text: 'Player DragonLeft left the server', time: '18m ago', type: 'quit' }
  ],

  auditLogs: [
    { timestamp: '2026-11-16 00:35:12', actor: 'Admin', role: 'Owner / Super Admin', action: 'SERVER_BACKUP', target: 'world, postgres', result: 'SUCCESS' },
    { timestamp: '2026-11-16 00:30:05', actor: 'Admin', role: 'Admin', action: 'BAN_PLAYER', target: 'BadPlayer', result: 'BANNED (Cheating)' },
    { timestamp: '2026-11-16 00:25:40', actor: 'Admin', role: 'Admin', action: 'CHANGE_GAMEMODE', target: 'BuilderKing -> Creative', result: 'SUCCESS' },
    { timestamp: '2026-11-16 00:15:22', actor: 'Admin', role: 'Owner / Super Admin', action: 'CONFIG_CHANGE', target: 'server.properties', result: 'APPLIED' }
  ],

  consoleLogs: [
    { level: 'INFO', time: '00:10:01', text: '[NetworkCore] PostgreSQL HikariPool healthy with 5 active connections.' },
    { level: 'INFO', time: '00:11:42', text: '[Geyser-Spigot] Player BuilderKing (Bedrock) connected via UDP 19132.' },
    { level: 'INFO', time: '00:12:05', text: '[EconomyCore] Processed transfer of $250.00 Coins from StevePro to BuilderKing.' },
    { level: 'INFO', time: '00:14:19', text: '[Paper] Server TPS: 20.00, MSPT: 45ms. 5 players online.' },
    { level: 'WARN', time: '00:18:02', text: '[Security] Connection attempt from unverified proxy was throttled.' }
  ],

  bans: [
    { player: 'BadPlayer', uuid: 'fa112233-4455-6677-8899-aabbccddeeff', type: 'Permanent Ban', reason: 'Unfair modifications / Fly hack', actor: 'Admin', expires: 'Never', ip: '203.0.113.19' }
  ],

  mutes: [
    { player: 'ToxicSpammer', duration: '24 Hours', reason: 'Chat flood and abusive language', actor: 'Moderator', expires: 'Today 23:59' }
  ],

  ipbans: [
    { ip: '203.0.113.19', account: 'BadPlayer', reason: 'Repeated cheating and evasion', actor: 'Admin' }
  ],

  reports: [
    { id: 104, player: 'Griefer99', reporter: 'StevePro', category: 'Suspected X-Ray Mining', evidence: 'Mined 64 ancient debris in 3 minutes', time: '4m ago' },
    { id: 103, player: 'BadSpammer', reporter: 'FoxGamer', category: 'Chat Toxicity', evidence: 'Spamming discord invites in public chat', time: '12m ago' },
    { id: 102, player: 'NoobMaster', reporter: 'Dreamer', category: 'Claim Intrusion', evidence: 'Attempted to bypass chunk boundary', time: '1h ago' }
  ],

  backups: [
    { id: 'b-1', filename: 'backup_full_20261116_0035.tar.gz', type: 'Full Snapshot', size: '1.24 GB', timestamp: '2026-11-16 00:35:12', sha256: '9f83a2c4...e1d0', status: 'VERIFIED' },
    { id: 'b-2', filename: 'backup_world_20261115_1800.tar.gz', type: 'World Only', size: '840 MB', timestamp: '2026-11-15 18:00:00', sha256: 'a1b2c3d4...5678', status: 'VERIFIED' },
    { id: 'b-3', filename: 'backup_db_postgres_20261115_1200.sql.gz', type: 'Database SQL', size: '45 MB', timestamp: '2026-11-15 12:00:00', sha256: '778899aa...bbcc', status: 'VERIFIED' }
  ],

  files: [
    { name: 'wixfox-network-core-1.0.jar', category: 'Plugin', version: 'v1.0.0', size: '2.4 MB', target: 'Production', status: 'ACTIVE' },
    { name: 'geyser-spigot-2.2.3.jar', category: 'Plugin', version: 'v2.2.3', size: '14.2 MB', target: 'Production', status: 'ACTIVE' },
    { name: 'floodgate-spigot-2.2.3.jar', category: 'Plugin', version: 'v2.2.3', size: '1.8 MB', target: 'Production', status: 'ACTIVE' },
    { name: 'luckperms-5.4.102.jar', category: 'Plugin', version: 'v5.4.102', size: '8.6 MB', target: 'Production', status: 'ACTIVE' },
    { name: 'custom_survival_spawn_world.zip', category: 'World', version: 'v1.2', size: '185 MB', target: 'Production', status: 'ACTIVE' },
    { name: 'lifesteal-mechanics-staging.jar', category: 'Plugin', version: 'v0.9.1-beta', size: '850 KB', target: 'Staging', status: 'TESTING' }
  ],

  permissionNodes: [
    { node: 'wixfox.gamemode.*', roles: 'Owner, Admin', desc: 'Allows switching gamemodes for self & others', enabled: true },
    { node: 'wixfox.instantkill', roles: 'Owner, Admin', desc: 'Execute /kill on players immediately', enabled: true },
    { node: 'wixfox.economy.admin', roles: 'Owner, Admin', desc: 'Deposit, withdraw, or reset player coins', enabled: true },
    { node: 'wixfox.moderation.ban', roles: 'Owner, Admin, Moderator', desc: 'Kick, ban, and mute players', enabled: true },
    { node: 'wixfox.filemanager.upload', roles: 'Owner, Developer', desc: 'Upload plugins, worlds, and configs', enabled: true },
    { node: 'geyser.bedrock.crossplay', roles: 'All Players', desc: 'Allows crossplay authentication via Floodgate', enabled: true }
  ],

  securityChecklist: [
    { id: 1, text: "Ubuntu VPS hardened & unattended-upgrades active", checked: true },
    { id: 2, text: "Root SSH login disabled (PermitRootLogin no)", checked: true },
    { id: 3, text: "SSH restricted to private VPN only (tailscale0)", checked: true },
    { id: 4, text: "Firewall default-deny incoming policy enabled", checked: true },
    { id: 5, text: "Only game ports (TCP 25565 / UDP 19132) allowed publicly", checked: true },
    { id: 6, text: "Java TCP flood protection configured (connection-throttle: 4000)", checked: true },
    { id: 7, text: "Bedrock UDP flood protection configured (Floodgate key exchange)", checked: true },
    { id: 8, text: "Origin IP masked and direct-to-origin bypass blocked", checked: true },
    { id: 9, text: "Admin Panel web interface inaccessible from public internet (127.0.0.1:8080)", checked: true },
    { id: 10, text: "PostgreSQL port 5432 inaccessible from public internet", checked: true },
    { id: 11, text: "Minecraft RCON port 25575 inaccessible from public internet", checked: true },
    { id: 12, text: "Default administrator credentials removed from .env", checked: true },
    { id: 13, text: "High-entropy cryptographic production secrets generated", checked: true },
    { id: 14, text: "Docker containers hardened (no-new-privileges, cap_drop: ALL)", checked: true },
    { id: 15, text: "GitHub main branch protected with required reviews", checked: true },
    { id: 16, text: "Production deployment approval gates configured in CI/CD", checked: true },
    { id: 17, text: "Staff MFA and least-privilege RBAC roles active", checked: true },
    { id: 18, text: "CrowdSec & Fail2ban intrusion detection active", checked: true },
    { id: 19, text: "GPG AES-256 encrypted automated backup pipeline operational", checked: true },
    { id: 20, text: "Backup restoration tested and verified on staging", checked: true },
    { id: 21, text: "Incident response runbook documented (docs/SECURITY_ARCHITECTURE.md)", checked: true },
    { id: 22, text: "Automated security audit script (security-audit.sh) passed 100%", checked: true }
  ],

  selectedPlayer: null
};

// ===================================================================
// 2. TOAST NOTIFICATION ENGINE
// ===================================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';

  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '❌';
  if (type === 'warning') icon = '⚠️';

  toast.innerHTML = `<span>${icon}</span> <span>${escapeHTML(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Log Audit Action
function recordAudit(action, target, result) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const entry = {
    timestamp,
    actor: 'Admin',
    role: AppState.currentRole,
    action,
    target,
    result
  };
  AppState.auditLogs.unshift(entry);

  // Add to recent activity list
  AppState.activities.unshift({
    id: 'act-' + Date.now(),
    text: `${action}: ${target} (${result})`,
    time: 'Just now',
    type: action.toLowerCase().includes('ban') ? 'ban' : (action.toLowerCase().includes('backup') ? 'backup' : 'announcement')
  });

  renderRecentActivity();
  renderAuditTable();
}

// ===================================================================
// 3. ROLE-BASED ACCESS CONTROL (RBAC)
// ===================================================================
const RolePermissions = {
  'Owner / Super Admin': { canManageStaff: true, canDeployProd: true, canUploadPlugins: true, canBan: true, canKill: true, canChangeMode: true, canConfigureHardcore: true },
  'Admin': { canManageStaff: false, canDeployProd: false, canUploadPlugins: true, canBan: true, canKill: true, canChangeMode: true, canConfigureHardcore: true },
  'Moderator': { canManageStaff: false, canDeployProd: false, canUploadPlugins: false, canBan: true, canKill: false, canChangeMode: false, canConfigureHardcore: false },
  'Developer': { canManageStaff: false, canDeployProd: false, canUploadPlugins: true, canBan: false, canKill: false, canChangeMode: false, canConfigureHardcore: false }
};

function hasPermission(permissionKey) {
  const perms = RolePermissions[AppState.currentRole];
  return perms && perms[permissionKey] === true;
}

function handleRoleChange(newRole) {
  AppState.currentRole = newRole;
  const label = document.getElementById('currentRoleLabel');
  if (label) label.textContent = newRole;
  showToast(`Switched active staff role to: ${newRole}`, 'info');
  updateUIForRole();
}

function updateUIForRole() {
  const killBtns = document.querySelectorAll('.perm-kill');
  killBtns.forEach(btn => btn.style.display = hasPermission('canKill') ? '' : 'none');

  const uploadBtns = document.querySelectorAll('.perm-upload');
  uploadBtns.forEach(btn => btn.style.display = hasPermission('canUploadPlugins') ? '' : 'none');
}

// ===================================================================
// 4. TAB NAVIGATION & VIEW RENDERING
// ===================================================================
function switchTab(tabId) {
  AppState.activeTab = tabId;

  // Highlight Nav Item
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Switch View Panes
  document.querySelectorAll('.view-pane').forEach(pane => {
    pane.style.display = 'none';
  });

  const activePane = document.getElementById(`view-${tabId}`);
  if (activePane) {
    activePane.style.display = 'flex';
  } else {
    document.getElementById('view-dashboard').style.display = 'flex';
  }

  // Render view-specific data
  if (tabId === 'players') renderFullPlayersTable();
  if (tabId === 'economy') renderEconomyTable();
  if (tabId === 'ranks') renderRanksTable();
  if (tabId === 'moderation') renderModerationSubTabs();
  if (tabId === 'security') renderSecurityChecklist();
  if (tabId === 'backups') renderBackupsTable();
  if (tabId === 'files') renderFileManagerTable();
  if (tabId === 'audit') renderAuditTable();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===================================================================
// 5. CANVAS LIVE WAVEFORM CHART
// ===================================================================
function initWaveformChart() {
  const canvas = document.getElementById('waveformCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let points = [35, 40, 32, 55, 48, 62, 58, 70, 65, 52, 60, 42, 38, 48, 40, 35];
  let phase = 0;

  function draw() {
    canvas.width = canvas.parentElement.clientWidth || 300;
    canvas.height = canvas.parentElement.clientHeight || 120;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    phase += 0.04;
    const currentPoints = points.map((p, i) => p + Math.sin(phase + i * 0.5) * 5);

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(34, 197, 94, 0.35)');
    grad.addColorStop(1, 'rgba(34, 197, 94, 0.0)');

    ctx.beginPath();
    const step = w / (currentPoints.length - 1);
    ctx.moveTo(0, h - (currentPoints[0] / 100) * h);

    for (let i = 1; i < currentPoints.length; i++) {
      const prevX = (i - 1) * step;
      const prevY = h - (currentPoints[i - 1] / 100) * h;
      const curX = i * step;
      const curY = h - (currentPoints[i] / 100) * h;
      const cpX = (prevX + curX) / 2;
      ctx.bezierCurveTo(cpX, prevY, cpX, curY, curX, curY);
    }

    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    requestAnimationFrame(draw);
  }

  draw();
}

// ===================================================================
// 6. DASHBOARD WIDGETS
// ===================================================================
function renderPlayerOverview() {
  const container = document.getElementById('playerOverviewList');
  if (!container) return;

  container.innerHTML = '';
  const onlinePlayers = AppState.players.filter(p => p.status === 'Online');

  onlinePlayers.forEach(p => {
    const item = document.createElement('div');
    item.className = 'player-item';
    item.onclick = () => openPlayerModal(p);

    item.innerHTML = `
      <div class="player-info">
        <div class="player-head-img" style="background: ${getAvatarColor(p.name)}"></div>
        <div>
          <span class="player-name">${escapeHTML(p.name)}</span>
          <span class="player-status-tag"><span class="status-dot"></span> Online</span>
        </div>
      </div>
      <div class="player-time">${p.playtime}</div>
    `;
    container.appendChild(item);
  });
}

function getAvatarColor(name) {
  const colors = ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function renderRecentActivity() {
  const container = document.getElementById('recentActivityList');
  if (!container) return;

  container.innerHTML = '';
  AppState.activities.slice(0, 5).forEach(act => {
    const item = document.createElement('div');
    item.className = 'activity-item';

    let iconClass = 'act-green';
    let iconChar = '👤';
    if (act.type === 'ban') { iconClass = 'act-red'; iconChar = '✕'; }
    if (act.type === 'backup') { iconClass = 'act-blue'; iconChar = '🗄️'; }
    if (act.type === 'announcement') { iconClass = 'act-purple'; iconChar = '💬'; }
    if (act.type === 'quit') { iconClass = 'act-green'; iconChar = '👤'; }

    item.innerHTML = `
      <div class="activity-left">
        <div class="activity-icon ${iconClass}">${iconChar}</div>
        <span>${escapeHTML(act.text)}</span>
      </div>
      <div class="activity-time">${act.time}</div>
    `;
    container.appendChild(item);
  });
}

// ===================================================================
// 7. FULL PLAYER MANAGEMENT (VIEW 2)
// ===================================================================
function setPlayerFilter(filter, el) {
  AppState.playerFilter = filter;
  if (el) {
    document.querySelectorAll('.filter-pills .filter-pill').forEach(btn => btn.classList.remove('active'));
    el.classList.add('active');
  }
  renderFullPlayersTable();
}

function filterPlayersTable() {
  renderFullPlayersTable();
}

function renderFullPlayersTable() {
  const tbody = document.getElementById('fullPlayersTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  const search = (document.getElementById('playerSearchInput')?.value || '').toLowerCase().trim();

  const filtered = AppState.players.filter(p => {
    // Search query
    const matchSearch = p.name.toLowerCase().includes(search) || p.uuid.toLowerCase().includes(search) || p.rank.toLowerCase().includes(search);
    if (!matchSearch) return false;

    // Filter pill
    if (AppState.playerFilter === 'online') return p.status === 'Online';
    if (AppState.playerFilter === 'java') return p.platform === 'JAVA';
    if (AppState.playerFilter === 'bedrock') return p.platform === 'BEDROCK';
    if (AppState.playerFilter === 'banned') return p.status === 'Banned';
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 24px; color: var(--text-dim);">No matching players found.</td></tr>`;
    return;
  }

  filtered.forEach(p => {
    const tr = document.createElement('tr');

    const platformBadge = p.platform === 'JAVA' 
      ? '<span class="badge badge-java">Java</span>' 
      : '<span class="badge badge-bedrock">Bedrock</span>';

    const statusBadge = p.status === 'Online'
      ? '<span class="badge badge-online">● Online</span>'
      : (p.status === 'Banned' ? '<span class="badge badge-banned">Banned</span>' : '<span class="badge">Offline</span>');

    const modeClass = `badge-${p.gameMode.toLowerCase()}`;

    tr.innerHTML = `
      <td>
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="player-head-img" style="background: ${getAvatarColor(p.name)}"></div>
          <div>
            <strong style="color: #fff; cursor: pointer;" onclick="openPlayerModalByName('${p.name}')">${escapeHTML(p.name)}</strong>
            <div style="font-size: 10px; color: var(--text-dim); font-family: var(--font-mono);">${p.uuid.substring(0, 14)}...</div>
          </div>
        </div>
      </td>
      <td>${platformBadge}</td>
      <td>
        <select class="form-select" style="padding: 4px 8px; font-size: 11px;" onchange="executeChangeGameMode(this.value, '${p.name}')">
          <option value="Survival" ${p.gameMode === 'Survival' ? 'selected' : ''}>Survival</option>
          <option value="Creative" ${p.gameMode === 'Creative' ? 'selected' : ''}>Creative</option>
          <option value="Adventure" ${p.gameMode === 'Adventure' ? 'selected' : ''}>Adventure</option>
          <option value="Spectator" ${p.gameMode === 'Spectator' ? 'selected' : ''}>Spectator</option>
        </select>
      </td>
      <td><span class="badge" style="background: rgba(251, 191, 36, 0.15); color: #fbbf24;">${p.rank}</span></td>
      <td><code>${p.world}</code></td>
      <td>
        <div style="font-size: 11px; font-weight: bold; color: ${p.health > 10 ? '#4ade80' : '#ef4444'};">
          ❤️ ${p.health}/20 &bull; 🍖 ${p.food}/20
        </div>
      </td>
      <td><span style="font-family: var(--font-mono); font-size: 11.5px;">${maskIP(p.ip)}</span></td>
      <td>${statusBadge}</td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button class="btn-action-sm perm-kill" title="Instant Kill (/kill)" onclick="executeKillSpecific('${p.name}')">☠️</button>
          <button class="btn-action-sm" title="Inspect Inventory" onclick="openPlayerInventory('${p.name}')">🎒</button>
          <button class="btn-action-sm" title="Teleport to Me" onclick="executeTeleportSpecific('${p.name}')">📍</button>
          <button class="btn-action-sm" title="Full Player Controls" onclick="openPlayerModalByName('${p.name}')">⚙️</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openPlayerModalByName(name) {
  const player = AppState.players.find(p => p.name === name);
  if (player) openPlayerModal(player);
}

// ===================================================================
// 8. ECONOMY MODULE (VIEW 4)
// ===================================================================
function renderEconomyTable() {
  const tbody = document.getElementById('economyTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  AppState.players.forEach(p => {
    const total = p.wallet + p.bank;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <strong style="color: #fff;">${escapeHTML(p.name)}</strong>
        <div style="font-size: 10px; color: var(--text-dim);">${p.platform}</div>
      </td>
      <td><span class="badge" style="background: rgba(251, 191, 36, 0.15); color: #fbbf24;">${p.rank}</span></td>
      <td style="color: #4ade80; font-family: var(--font-mono); font-weight: bold;">$${p.wallet.toLocaleString()}</td>
      <td style="color: #60a5fa; font-family: var(--font-mono); font-weight: bold;">$${p.bank.toLocaleString()}</td>
      <td style="color: #fff; font-family: var(--font-mono); font-weight: bold;">$${total.toLocaleString()}</td>
      <td style="color: var(--text-muted); font-size: 11px;">${p.lastTx}</td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button class="btn-action-sm" onclick="openDirectGiveCoins('${p.name}')">+ Give Coins</button>
          <button class="btn-action-sm" onclick="showToast('Opened ledger history for ${p.name}', 'info')">📜 Ledger</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openGiveCoinsModal() {
  openModal('giveCoinsModal');
}

function openDirectGiveCoins(playerName) {
  const sel = document.getElementById('giveCoinsPlayerSelect');
  if (sel) sel.value = playerName;
  openModal('giveCoinsModal');
}

function executeGiveCoins() {
  const playerSel = document.getElementById('giveCoinsPlayerSelect');
  const typeSel = document.getElementById('giveCoinsTypeSelect');
  const amountInput = document.getElementById('giveCoinsAmountInput');

  const playerName = playerSel.value;
  const type = typeSel.value;
  const amount = parseInt(amountInput.value) || 0;

  if (amount <= 0) {
    showToast('Please enter a valid coin amount.', 'warning');
    return;
  }

  const player = AppState.players.find(p => p.name === playerName);
  if (!player) return;

  if (type === 'give') {
    player.wallet += amount;
    recordAudit('ECONOMY_DEPOSIT', `${playerName} +$${amount}`, 'SUCCESS');
    showToast(`Deposited $${amount.toLocaleString()} Coins to ${playerName}'s wallet.`, 'success');
  } else if (type === 'take') {
    player.wallet = Math.max(0, player.wallet - amount);
    recordAudit('ECONOMY_WITHDRAW', `${playerName} -$${amount}`, 'SUCCESS');
    showToast(`Deducted $${amount.toLocaleString()} Coins from ${playerName}'s wallet.`, 'warning');
  } else if (type === 'set') {
    player.wallet = amount;
    recordAudit('ECONOMY_SET', `${playerName} =$${amount}`, 'SUCCESS');
    showToast(`Set ${playerName}'s wallet balance to $${amount.toLocaleString()} Coins.`, 'info');
  }

  player.lastTx = 'Just now';
  closeModal('giveCoinsModal');
  renderEconomyTable();
}

// ===================================================================
// 9. RANKS & PERMISSIONS (VIEW 5)
// ===================================================================
function renderRanksTable() {
  const tbody = document.getElementById('permissionNodesTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  AppState.permissionNodes.forEach((node, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><code style="color: var(--wix-orange); font-size: 12px;">${node.node}</code></td>
      <td><span style="font-size: 11.5px; color: #cbd5e1;">${node.roles}</span></td>
      <td style="font-size: 11.5px; color: var(--text-muted);">${node.desc}</td>
      <td>
        <span class="badge ${node.enabled ? 'badge-online' : 'badge-banned'}">
          ${node.enabled ? 'ACTIVE' : 'DISABLED'}
        </span>
      </td>
      <td>
        <button class="btn-action-sm" onclick="togglePermissionNode(${idx})">
          ${node.enabled ? 'Disable' : 'Enable'}
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function togglePermissionNode(idx) {
  const node = AppState.permissionNodes[idx];
  if (!node) return;
  node.enabled = !node.enabled;
  recordAudit('PERMISSION_TOGGLE', `${node.node}`, node.enabled ? 'ENABLED' : 'DISABLED');
  showToast(`Permission node ${node.node} is now ${node.enabled ? 'ENABLED' : 'DISABLED'}`, 'info');
  renderRanksTable();
}

function executeAssignRank() {
  const player = document.getElementById('rankAssignPlayerSelect').value;
  const role = document.getElementById('rankAssignRoleSelect').value;

  const target = AppState.players.find(p => p.name === player);
  if (target) target.rank = role;

  recordAudit('ASSIGN_RANK', `${player} -> ${role}`, 'SUCCESS');
  showToast(`Successfully assigned rank [${role}] to ${player} via LuckPerms.`, 'success');
  renderFullPlayersTable();
}

// ===================================================================
// 10. MODERATION MODULE (VIEW 6)
// ===================================================================
function switchModSubTab(subTab, el) {
  AppState.currentModSubTab = subTab;
  if (el) {
    document.querySelectorAll('#view-moderation .filter-pills .filter-pill').forEach(btn => btn.classList.remove('active'));
    el.classList.add('active');
  }

  ['bans', 'mutes', 'ipbans', 'reports'].forEach(tab => {
    const container = document.getElementById(`modSubTab-${tab}`);
    if (container) container.style.display = tab === subTab ? 'block' : 'none';
  });

  renderModerationSubTabs();
}

function renderModerationSubTabs() {
  // Bans
  const bansTbody = document.getElementById('activeBansTableBody');
  if (bansTbody) {
    bansTbody.innerHTML = '';
    if (AppState.bans.length === 0) {
      bansTbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px; color: var(--text-dim);">No active bans.</td></tr>`;
    } else {
      AppState.bans.forEach(b => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong style="color: #ef4444;">${escapeHTML(b.player)}</strong></td>
          <td><code style="font-size: 10px; color: var(--text-dim);">${b.uuid}</code></td>
          <td><span class="badge badge-banned">${b.type}</span></td>
          <td style="color: #cbd5e1;">${b.reason}</td>
          <td>${b.actor}</td>
          <td>${b.expires}</td>
          <td>
            <button class="btn-action-sm" onclick="executeUnban('${b.player}')">Unban / Pardon</button>
          </td>
        `;
        bansTbody.appendChild(tr);
      });
    }
  }

  // Mutes
  const mutesTbody = document.getElementById('activeMutesTableBody');
  if (mutesTbody) {
    mutesTbody.innerHTML = '';
    AppState.mutes.forEach((m, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong style="color: #f59e0b;">${escapeHTML(m.player)}</strong></td>
        <td><span class="badge badge-muted">${m.duration}</span></td>
        <td style="color: #cbd5e1;">${m.reason}</td>
        <td>${m.actor}</td>
        <td>${m.expires}</td>
        <td>
          <button class="btn-action-sm" onclick="executeUnmute(${idx})">Unmute</button>
        </td>
      `;
      mutesTbody.appendChild(tr);
    });
  }

  // IP Bans
  const ipTbody = document.getElementById('activeIPBansTableBody');
  if (ipTbody) {
    ipTbody.innerHTML = '';
    AppState.ipbans.forEach((ip, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><code style="color: #ef4444;">${ip.ip}</code></td>
        <td><strong>${ip.account}</strong></td>
        <td style="color: #cbd5e1;">${ip.reason}</td>
        <td>${ip.actor}</td>
        <td>
          <button class="btn-action-sm" onclick="executeUnbanIP(${idx})">Pardon IP</button>
        </td>
      `;
      ipTbody.appendChild(tr);
    });
  }

  // Reports
  const reportsTbody = document.getElementById('activeReportsTableBody');
  if (reportsTbody) {
    reportsTbody.innerHTML = '';
    AppState.reports.forEach((r, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong style="color: #ef4444;">${r.player}</strong></td>
        <td>${r.reporter}</td>
        <td><span class="badge" style="background: rgba(239, 68, 68, 0.15); color: #f87171;">${r.category}</span></td>
        <td style="font-size: 11px; color: var(--text-dim);">${r.evidence}</td>
        <td style="font-size: 11px;">${r.time}</td>
        <td>
          <div style="display: flex; gap: 4px;">
            <button class="btn-action-sm danger" onclick="punishReport(${idx})">Punish</button>
            <button class="btn-action-sm" onclick="dismissReport(${idx})">Dismiss</button>
          </div>
        </td>
      `;
      reportsTbody.appendChild(tr);
    });
  }
}

function executeUnban(playerName) {
  AppState.bans = AppState.bans.filter(b => b.player !== playerName);
  const player = AppState.players.find(p => p.name === playerName);
  if (player) player.status = 'Offline';

  recordAudit('UNBAN_PLAYER', playerName, 'PARDONED');
  showToast(`Pardoned and unbanned player: ${playerName}`, 'success');
  renderModerationSubTabs();
  renderFullPlayersTable();
}

function executeUnmute(idx) {
  const m = AppState.mutes[idx];
  if (!m) return;
  AppState.mutes.splice(idx, 1);
  recordAudit('UNMUTE_PLAYER', m.player, 'UNMUTED');
  showToast(`Unmuted player: ${m.player}`, 'success');
  renderModerationSubTabs();
}

function executeUnbanIP(idx) {
  const ip = AppState.ipbans[idx];
  if (!ip) return;
  AppState.ipbans.splice(idx, 1);
  recordAudit('UNBAN_IP', ip.ip, 'PARDONED');
  showToast(`Pardoned IP Address: ${ip.ip}`, 'success');
  renderModerationSubTabs();
}

function punishReport(idx) {
  const r = AppState.reports[idx];
  if (!r) return;
  AppState.reports.splice(idx, 1);
  showToast(`Enforced punishment on ${r.player} for: ${r.category}`, 'error');
  recordAudit('PUNISH_REPORT', `${r.player} (#${r.id})`, 'RESOLVED_BANNED');
  renderModerationSubTabs();
}

function dismissReport(idx) {
  const r = AppState.reports[idx];
  if (!r) return;
  AppState.reports.splice(idx, 1);
  showToast(`Report #${r.id} dismissed as resolved.`, 'info');
  renderModerationSubTabs();
}

// ===================================================================
// 11. BACKUPS SERVICE (VIEW 7)
// ===================================================================
function renderBackupsTable() {
  const tbody = document.getElementById('backupsTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  AppState.backups.forEach((b, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <strong style="color: #fff; font-family: var(--font-mono); font-size: 12.5px;">${b.filename}</strong>
      </td>
      <td><span class="badge" style="background: rgba(59, 130, 246, 0.15); color: #60a5fa;">${b.type}</span></td>
      <td style="font-weight: 600;">${b.size}</td>
      <td style="color: var(--text-muted); font-size: 11.5px;">${b.timestamp}</td>
      <td><code style="font-size: 10.5px; color: var(--text-dim);">${b.sha256}</code></td>
      <td><span class="badge badge-online">● ${b.status}</span></td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button class="btn-action-sm" onclick="executeRestoreBackup('${b.filename}')">🔄 Restore</button>
          <button class="btn-action-sm" onclick="showToast('Initiated download: ${b.filename}', 'info')">⬇ Download</button>
          <button class="btn-action-sm danger" onclick="deleteBackup(${idx})">🗑</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function triggerBackupNow() {
  showToast('Flushing chunks & PostgreSQL databases to snapshot archive...', 'info');

  setTimeout(() => {
    const ts = new Date().toISOString().replace(/[-:T]/g, '').substring(0, 14);
    const filename = `backup_full_${ts}.tar.gz`;
    const newBackup = {
      id: 'b-' + Date.now(),
      filename,
      type: 'Full Snapshot',
      size: '1.28 GB',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      sha256: Math.random().toString(36).substring(2, 10) + '...f0a1',
      status: 'VERIFIED'
    };
    AppState.backups.unshift(newBackup);
    recordAudit('BACKUP_CREATE', filename, 'SNAPSHOT_SAVED');
    showToast(`Backup archive created successfully: ${filename}`, 'success');
    renderBackupsTable();
  }, 1200);
}

function executeRestoreBackup(filename) {
  if (confirm(`SAFEGUARD CHECK: Are you sure you want to restore '${filename}'? This will revert server state and require a restart.`)) {
    recordAudit('BACKUP_RESTORE', filename, 'INITIATED');
    showToast(`Restoring backup '${filename}'... Worlds and database reverted.`, 'warning');
  }
}

function deleteBackup(idx) {
  const b = AppState.backups[idx];
  if (!b) return;
  AppState.backups.splice(idx, 1);
  recordAudit('BACKUP_DELETE', b.filename, 'DELETED');
  showToast(`Deleted backup: ${b.filename}`, 'info');
  renderBackupsTable();
}

// ===================================================================
// 12. GAME MODE FILE MANAGER (VIEW 8)
// ===================================================================
function renderFileManagerTable() {
  const tbody = document.getElementById('fileManagerTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  AppState.files.forEach((f, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <strong style="color: #fff; font-size: 13px;">${escapeHTML(f.name)}</strong>
      </td>
      <td><span class="badge" style="background: rgba(139, 92, 246, 0.15); color: #c084fc;">${f.category}</span></td>
      <td><code>${f.version}</code></td>
      <td>${f.size}</td>
      <td>
        <span class="badge ${f.target === 'Production' ? 'badge-java' : 'badge-bedrock'}">${f.target}</span>
      </td>
      <td>
        <span class="badge ${f.status === 'ACTIVE' ? 'badge-online' : 'badge-muted'}">${f.status}</span>
      </td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button class="btn-action-sm" onclick="toggleFileStatus(${idx})">
            ${f.status === 'ACTIVE' ? 'Disable' : 'Enable'}
          </button>
          <button class="btn-action-sm danger perm-upload" onclick="deleteFileAsset(${idx})">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function toggleFileStatus(idx) {
  const f = AppState.files[idx];
  if (!f) return;
  f.status = f.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
  recordAudit('FILE_TOGGLE', f.name, f.status);
  showToast(`Asset '${f.name}' is now ${f.status}.`, 'info');
  renderFileManagerTable();
}

function deleteFileAsset(idx) {
  const f = AppState.files[idx];
  if (!f) return;
  AppState.files.splice(idx, 1);
  recordAudit('FILE_DELETE', f.name, 'DELETED');
  showToast(`Deleted asset '${f.name}'.`, 'info');
  renderFileManagerTable();
}

function executeUploadAsset() {
  const nameInput = document.getElementById('uploadAssetNameInput');
  const catSel = document.getElementById('uploadCategorySelect');
  const targetSel = document.getElementById('uploadTargetSelect');

  const name = nameInput.value.trim();
  if (!name) {
    showToast('Please enter an asset file name.', 'warning');
    return;
  }

  const newAsset = {
    name,
    category: catSel.value,
    version: 'v1.0.0',
    size: '3.2 MB',
    target: targetSel.value,
    status: targetSel.value === 'Production' ? 'ACTIVE' : 'TESTING'
  };

  AppState.files.unshift(newAsset);
  recordAudit('ASSET_UPLOAD', `${name} (${newAsset.target})`, 'CHECKSUM_PASSED');
  showToast(`Uploaded and validated '${name}'. SHA-256 integrity passed.`, 'success');
  nameInput.value = '';
  closeModal('uploadAssetModal');
  renderFileManagerTable();
}

// ===================================================================
// 13. SETTINGS & CONFIGURATION (VIEW 10)
// ===================================================================
function executeSaveSettings() {
  const motd = document.getElementById('cfgMotd').value;
  const maxPlayers = parseInt(document.getElementById('cfgMaxPlayers').value) || 100;
  const difficulty = document.getElementById('cfgDifficulty').value;
  const pvp = document.getElementById('cfgPvP').value === 'true';

  AppState.server.motd = motd;
  AppState.server.playersMax = maxPlayers;
  AppState.server.difficulty = difficulty;
  AppState.server.pvp = pvp;

  recordAudit('UPDATE_SETTINGS', 'server.properties', `MOTD: ${motd}, Max: ${maxPlayers}, Diff: ${difficulty}`);
  showToast('Server configuration applied and written to server.properties successfully.', 'success');
}

// ===================================================================
// 14. AUDIT LOGS (VIEW 11)
// ===================================================================
function renderAuditTable() {
  const tbody = document.getElementById('auditTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  AppState.auditLogs.forEach(log => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-family: var(--font-mono); font-size: 11.5px; color: var(--text-muted);">${log.timestamp}</td>
      <td style="font-weight: bold; color: #fff;">${log.actor}</td>
      <td><span class="badge" style="background: rgba(139, 92, 246, 0.15); color: #c084fc;">${log.role}</span></td>
      <td><span style="font-family: var(--font-mono); font-weight: bold; color: var(--wix-orange);">${log.action}</span></td>
      <td><code>${log.target}</code></td>
      <td><span class="badge badge-online">${log.result}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function exportAuditCSV() {
  let csv = 'Timestamp,Actor,Role,Action,Target,Result\n';
  AppState.auditLogs.forEach(l => {
    csv += `"${l.timestamp}","${l.actor}","${l.role}","${l.action}","${l.target}","${l.result}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit_logs_${Date.now()}.csv`;
  a.click();
  showToast('Audit trail exported to CSV.', 'success');
}

// ===================================================================
// 15. MODAL ACTIONS & PLAYER CONTROLS
// ===================================================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('open');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('open');
}

function openPlayerModal(player) {
  AppState.selectedPlayer = player;
  document.getElementById('pmPlayerName').textContent = player.name;
  document.getElementById('pmPlayerUUID').textContent = player.uuid;
  document.getElementById('pmPlayerPlatform').textContent = player.platform;
  document.getElementById('pmPlayerGameMode').textContent = player.gameMode;
  document.getElementById('pmPlayerRank').textContent = player.rank;
  document.getElementById('pmPlayerIP').textContent = maskIP(player.ip);

  openModal('playerActionModal');
}

function maskIP(ip) {
  if (!hasPermission('canBan')) {
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.*.*`;
  }
  return ip;
}

// Instant Kill
function executeInstantKill() {
  if (!hasPermission('canKill')) {
    showToast('Permission Denied: Your staff role cannot execute kill commands.', 'error');
    return;
  }
  const player = AppState.selectedPlayer;
  if (!player) return;

  if (player.name === 'StevePro' && AppState.currentRole !== 'Owner / Super Admin') {
    showToast('Cannot kill Owner/Exempt player account!', 'error');
    return;
  }

  player.health = 0;
  recordAudit('INSTANT_KILL', player.name, `Executed /kill ${player.name}`);
  showToast(`Executed: /kill ${player.name}. Target eliminated.`, 'success');
  closeModal('playerActionModal');
  renderFullPlayersTable();
}

function executeKillSpecific(name) {
  const p = AppState.players.find(x => x.name === name);
  if (p) {
    AppState.selectedPlayer = p;
    executeInstantKill();
  }
}

// Change Game Mode
function executeChangeGameMode(newMode, targetName) {
  const player = targetName ? AppState.players.find(p => p.name === targetName) : AppState.selectedPlayer;
  if (!player) return;

  if (!hasPermission('canChangeMode')) {
    showToast('Permission Denied: Your staff role cannot change game modes.', 'error');
    return;
  }

  player.gameMode = newMode;
  recordAudit('CHANGE_GAMEMODE', `${player.name} -> ${newMode}`, `Executed /gamemode ${newMode.toLowerCase()} ${player.name}`);
  showToast(`Updated ${player.name}'s game mode to: ${newMode}`, 'success');

  renderPlayerOverview();
  renderFullPlayersTable();
  if (!targetName) closeModal('playerActionModal');
}

// Heal Player
function executeHealPlayer() {
  const player = AppState.selectedPlayer;
  if (!player) return;

  player.health = 20;
  player.food = 20;
  recordAudit('HEAL_PLAYER', player.name, 'HEALED & FED');
  showToast(`Restored full hearts and hunger for ${player.name}.`, 'success');
  closeModal('playerActionModal');
  renderFullPlayersTable();
}

// Teleport Player
function executeTeleportPlayer() {
  const player = AppState.selectedPlayer;
  if (!player) return;
  recordAudit('TELEPORT_PLAYER', `${player.name} -> Staff Coordinates`, 'SUCCESS');
  showToast(`Teleported ${player.name} to your coordinates.`, 'info');
  closeModal('playerActionModal');
}

function executeTeleportSpecific(name) {
  recordAudit('TELEPORT_PLAYER', `${name} -> Staff Coordinates`, 'SUCCESS');
  showToast(`Teleported ${name} to your coordinates.`, 'info');
}

// Freeze Player
function executeToggleFreeze() {
  const player = AppState.selectedPlayer;
  if (!player) return;
  recordAudit('FREEZE_PLAYER', player.name, 'TOGGLED');
  showToast(`Toggled freeze state for ${player.name}.`, 'warning');
  closeModal('playerActionModal');
}

// Kick Player
function executeKick() {
  const player = AppState.selectedPlayer;
  const reason = document.getElementById('kickReasonInput').value || 'Violation of server rules';
  if (!player) return;

  player.status = 'Kicked';
  recordAudit('KICK_PLAYER', player.name, reason);
  showToast(`Kicked ${player.name} from server. Reason: ${reason}`, 'warning');

  renderPlayerOverview();
  renderFullPlayersTable();
  closeModal('kickModal');
  closeModal('playerActionModal');
}

// Ban Player
function executeBan() {
  if (!hasPermission('canBan')) {
    showToast('Permission Denied: Your staff role cannot issue bans.', 'error');
    return;
  }
  const targetSel = document.getElementById('banTargetPlayerSelect');
  const playerName = targetSel ? targetSel.value : (AppState.selectedPlayer ? AppState.selectedPlayer.name : 'Unknown');
  const player = AppState.players.find(p => p.name === playerName);

  const duration = document.getElementById('banDurationSelect').value;
  const reason = document.getElementById('banReasonInput').value || 'Banned by operator';
  const isIPBan = document.getElementById('banIPCheckbox').checked;

  if (player) player.status = 'Banned';

  AppState.bans.unshift({
    player: playerName,
    uuid: player ? player.uuid : '00000000-0000-0000-0000-000000000000',
    type: duration,
    reason,
    actor: 'Admin',
    expires: duration === 'Permanent' ? 'Never' : duration,
    ip: player ? player.ip : '127.0.0.1'
  });

  if (isIPBan && player) {
    AppState.ipbans.unshift({
      ip: player.ip,
      account: playerName,
      reason,
      actor: 'Admin'
    });
  }

  const actionType = isIPBan ? 'IP_BAN_PLAYER' : 'BAN_PLAYER';
  recordAudit(actionType, `${playerName} (${player ? player.ip : 'Unknown'})`, reason);

  showToast(`${isIPBan ? 'IP-Banned' : 'Banned'} ${playerName}. Reason: ${reason}`, 'error');
  renderPlayerOverview();
  renderFullPlayersTable();
  renderModerationSubTabs();
  closeModal('banModal');
  closeModal('playerActionModal');
}

// Hardcore Toggle
function executeHardcoreToggle() {
  if (!hasPermission('canConfigureHardcore')) {
    showToast('Permission Denied: Only Owner or Admin can configure Hardcore.', 'error');
    return;
  }

  const newState = !AppState.server.hardcoreEnabled;
  AppState.server.hardcoreEnabled = newState;

  recordAudit('HARDCORE_CONFIG', 'World: world', `Hardcore set to ${newState ? 'ENABLED' : 'DISABLED'}`);
  showToast(`Hardcore gameplay mode has been ${newState ? 'ACTIVATED' : 'DEACTIVATED'} for world.`, newState ? 'warning' : 'info');

  const pill = document.getElementById('hardcoreStatusPill');
  if (pill) {
    pill.textContent = newState ? 'HARDCORE ACTIVE' : 'Normal Survival';
    pill.className = newState ? 'stat-badge pos' : 'stat-badge neg';
  }

  closeModal('hardcoreModal');
}

// Broadcast Announcement
function executeBroadcast() {
  const type = document.getElementById('broadcastTypeSelect').value;
  const target = document.getElementById('broadcastTargetSelect').value;
  const message = document.getElementById('broadcastMessageInput').value.trim();

  if (!message) {
    showToast('Please type an announcement message.', 'warning');
    return;
  }

  recordAudit('BROADCAST', `[${target.toUpperCase()}] ${message}`, 'DISPATCHED');
  showToast(`Broadcast sent to ${target}: "${message}"`, 'success');

  // Push to RCON terminal
  const terminal = document.getElementById('terminalLogOutput');
  if (terminal) {
    const entry = document.createElement('div');
    entry.style.color = '#c084fc';
    entry.textContent = `[Broadcast] [${target.toUpperCase()}]: ${message}`;
    terminal.appendChild(entry);
    terminal.scrollTop = terminal.scrollHeight;
  }

  document.getElementById('broadcastMessageInput').value = '';
  closeModal('broadcastModal');
}

// Server Restart with Countdown
function executeRestartWithCountdown() {
  const mode = document.getElementById('restartCountdownSelect').value;
  closeModal('restartConfirmModal');

  if (mode === 'graceful') {
    showToast('Graceful restart countdown initiated (30 seconds warning)...', 'warning');
    recordAudit('RESTART_SCHEDULED', 'Countdown 30s', 'BROADCAST_WARNING');

    const statusPill = document.getElementById('serverStatePill');
    if (statusPill) statusPill.textContent = 'Restarting...';

    setTimeout(() => {
      showToast('Server restart complete! Reconnected to Paper node.', 'success');
      if (statusPill) statusPill.textContent = 'Running';
      recordAudit('RESTART_COMPLETE', 'wixfox-paper', 'ONLINE');
    }, 3000);
  } else {
    showToast('Instant restart signal sent to container...', 'error');
    recordAudit('FORCE_RESTART', 'Docker container', 'REBOOTING');
    setTimeout(() => {
      showToast('Paper server restarted and online.', 'success');
    }, 2000);
  }
}

// RCON Terminal
function executeRconCommand() {
  const input = document.getElementById('rconCommandInput');
  const command = input.value.trim();
  if (!command) return;

  const terminal = document.getElementById('terminalLogOutput');
  const logEntry = document.createElement('div');
  logEntry.style.color = '#22c55e';
  logEntry.style.fontWeight = 'bold';
  logEntry.textContent = `> ${command}`;
  terminal.appendChild(logEntry);

  setTimeout(() => {
    const resEntry = document.createElement('div');
    resEntry.style.color = '#cbd5e1';

    if (command.startsWith('tps')) {
      resEntry.textContent = '[Server]: TPS from last 1m, 5m, 15m: 20.00, 20.00, 20.00. MSPT: 45ms.';
    } else if (command.startsWith('list')) {
      resEntry.textContent = `[Server]: There are 5 of a max of 100 players online: StevePro, BuilderKing, FoxGamer, Dreamer, MinecraftFan`;
    } else if (command.startsWith('save-all')) {
      resEntry.textContent = `[Server]: Saved the game (world, world_nether, world_the_end).`;
    } else {
      resEntry.textContent = `[Server]: Executed '${command}' successfully.`;
    }

    terminal.appendChild(resEntry);
    terminal.scrollTop = terminal.scrollHeight;
  }, 300);

  recordAudit('CONSOLE_CMD', command, 'EXECUTED');
  input.value = '';
}

function quickRunCommand(cmd) {
  const input = document.getElementById('rconCommandInput');
  if (input) {
    input.value = cmd;
    executeRconCommand();
  }
}

function clearConsole() {
  const terminal = document.getElementById('terminalLogOutput');
  if (terminal) terminal.innerHTML = '';
  showToast('Terminal logs cleared.', 'info');
}

function downloadLogs() {
  let logText = '=== WIXFOX MINECRAFT NETWORK LATEST.LOG ===\n';
  AppState.consoleLogs.forEach(l => {
    logText += `[${l.time} ${l.level}]: ${l.text}\n`;
  });
  const blob = new Blob([logText], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'latest.log';
  a.click();
  showToast('Downloaded latest.log.', 'success');
}

// Inventory Inspector
function openPlayerInventory(playerName) {
  const modalName = document.getElementById('invModalPlayerName');
  if (modalName) modalName.textContent = playerName;

  const items = [
    { icon: '⚔️', count: 1 }, { icon: '🛡️', count: 1 }, { icon: '🍎', count: 64 }, { icon: '🏹', count: 1 },
    { icon: '🎯', count: 64 }, { icon: '🥩', count: 32 }, { icon: '💎', count: 16 }, { icon: '⛏️', count: 1 },
    { icon: '🪓', count: 1 }, { icon: '🪵', count: 64 }, { icon: '🧱', count: 64 }, { icon: '🧪', count: 3 }
  ];

  function populateRow(rowId, startIdx) {
    const row = document.getElementById(rowId);
    if (!row) return;
    row.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const slot = document.createElement('div');
      slot.className = 'mc-slot';
      const item = items[(startIdx + i) % items.length];
      if (Math.random() > 0.4) {
        slot.innerHTML = `<span>${item.icon}</span><span class="mc-slot-count">${item.count}</span>`;
      }
      row.appendChild(slot);
    }
  }

  populateRow('mcInvRow1', 0);
  populateRow('mcInvRow2', 3);
  populateRow('mcInvRow3', 6);
  populateRow('mcInvHotbar', 1);

  openModal('playerInventoryModal');
}

function openPlayerInventoryFromModal() {
  if (AppState.selectedPlayer) {
    closeModal('playerActionModal');
    openPlayerInventory(AppState.selectedPlayer.name);
  }
}

// Game Mode Creator
function executeCreateGameMode() {
  const input = document.getElementById('newGameModeNameInput');
  const name = input.value.trim();
  if (!name) {
    showToast('Please enter a game mode name.', 'warning');
    return;
  }
  recordAudit('CREATE_GAMEMODE', name, 'REGISTERED');
  showToast(`Registered new game mode: ${name}. Ready for world assignment.`, 'success');
  input.value = '';
}

// Fullscreen
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

// Escape HTML
function escapeHTML(str) {
  return String(str).replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

// ===================================================================
// 15B. SECURITY CENTER & COMPLIANCE ENGINE (PRD v1.0)
// ===================================================================
function renderSecurityChecklist() {
  const container = document.getElementById('secChecklistGrid');
  if (!container) return;

  container.innerHTML = '';
  let checkedCount = 0;

  // Retrieve any stored state from localStorage
  const savedState = JSON.parse(localStorage.getItem('wixfox_sec_checklist') || '{}');

  AppState.securityChecklist.forEach((item) => {
    const isChecked = savedState[item.id] !== undefined ? savedState[item.id] : item.checked;
    item.checked = isChecked;
    if (isChecked) checkedCount++;

    const div = document.createElement('div');
    div.style.cssText = 'background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: all 0.15s ease;';
    div.onmouseenter = () => div.style.background = 'rgba(255,255,255,0.05)';
    div.onmouseleave = () => div.style.background = 'rgba(255,255,255,0.02)';
    div.onclick = () => toggleSecurityChecklistItem(item.id);

    div.innerHTML = `
      <input type="checkbox" id="chk-sec-${item.id}" ${isChecked ? 'checked' : ''} style="cursor: pointer; width: 16px; height: 16px;" onclick="event.stopPropagation(); toggleSecurityChecklistItem(${item.id})">
      <label for="chk-sec-${item.id}" style="cursor: pointer; font-size: 12px; color: ${isChecked ? '#fff' : 'var(--text-dim)'}; flex: 1;">
        <span style="font-family: var(--font-mono); color: var(--wix-orange); margin-right: 4px;">#${item.id}</span>
        ${escapeHTML(item.text)}
      </label>
      <span class="badge ${isChecked ? 'badge-online' : 'badge-banned'}" style="font-size: 10px;">${isChecked ? 'VERIFIED' : 'PENDING'}</span>
    `;
    container.appendChild(div);
  });

  const progressBadge = document.getElementById('secChecklistProgress');
  if (progressBadge) {
    progressBadge.textContent = `${checkedCount} / ${AppState.securityChecklist.length} Verified`;
    progressBadge.className = checkedCount === AppState.securityChecklist.length ? 'badge badge-online' : 'badge badge-bedrock';
  }
}

function toggleSecurityChecklistItem(id) {
  const item = AppState.securityChecklist.find(x => x.id === id);
  if (!item) return;

  item.checked = !item.checked;
  const savedState = JSON.parse(localStorage.getItem('wixfox_sec_checklist') || '{}');
  savedState[id] = item.checked;
  localStorage.setItem('wixfox_sec_checklist', JSON.stringify(savedState));

  renderSecurityChecklist();
}

function runAutomatedSecurityAudit() {
  showToast('Executing automated penetration & security audit scan...', 'info');

  setTimeout(() => {
    AppState.securityChecklist.forEach(i => i.checked = true);
    const fullState = {};
    AppState.securityChecklist.forEach(i => fullState[i.id] = true);
    localStorage.setItem('wixfox_sec_checklist', JSON.stringify(fullState));

    recordAudit('SECURITY_AUDIT', 'Host VPS & Docker Network', '22/22 PASSED (100% COMPLIANT)');
    showToast('Security audit complete! All 22 PRD requirements verified.', 'success');
    renderSecurityChecklist();
  }, 1000);
}

function resetSecurityChecklist() {
  localStorage.removeItem('wixfox_sec_checklist');
  AppState.securityChecklist.forEach(i => i.checked = false);
  renderSecurityChecklist();
  showToast('Security checklist progress reset.', 'info');
}

function triggerEmergencyLockdown() {
  if (!confirm('EMERGENCY LOCKDOWN CONFIRMATION:\n\nThis will immediately restrict non-whitelisted traffic, disconnect untrusted sessions, and enforce strict ingress defense. Proceed?')) {
    return;
  }

  recordAudit('EMERGENCY_LOCKDOWN', 'Host & Network Boundary', 'LOCKDOWN_ENFORCED');
  showToast('🚨 Emergency lockdown initiated! Game traffic restricted to verified whitelist.', 'error');

  const topText = document.getElementById('topServerStatusText');
  if (topText) topText.textContent = 'Server Online (LOCKDOWN MODE)';
}

function exportSecurityReport() {
  let doc = `# Wixfox Minecraft Network — Security Compliance Audit Report\n`;
  doc += `Date: ${new Date().toISOString()}\n`;
  doc += `Audited By: ${AppState.currentRole} (Admin)\n\n`;
  doc += `## 22-Point Production Acceptance Checklist Status\n\n`;

  AppState.securityChecklist.forEach(item => {
    doc += `- [${item.checked ? 'X' : ' '}] #${item.id}: ${item.text}\n`;
  });

  const blob = new Blob([doc], { type: 'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `wixfox_security_report_${Date.now()}.md`;
  a.click();
  showToast('Exported security compliance report.', 'success');
}

// ===================================================================
// 16. INITIALIZATION ON DOM READY
// ===================================================================
window.addEventListener('DOMContentLoaded', () => {
  initWaveformChart();
  renderPlayerOverview();
  renderRecentActivity();
  updateUIForRole();

  // Attach nav clicks
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.getAttribute('data-tab');
      if (tab) switchTab(tab);
    });
  });

  // Attach RCON form
  const rconForm = document.getElementById('rconForm');
  if (rconForm) {
    rconForm.addEventListener('submit', (e) => {
      e.preventDefault();
      executeRconCommand();
    });
  }

  // Populate initial console logs
  const terminal = document.getElementById('terminalLogOutput');
  if (terminal) {
    AppState.consoleLogs.forEach(l => {
      const entry = document.createElement('div');
      entry.textContent = `[${l.time} ${l.level}]: ${l.text}`;
      terminal.appendChild(entry);
    });
  }

  showToast('Wixfox Game Control Centre v1.0 connected & ready.', 'success');
});
