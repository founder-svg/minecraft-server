/**
 * Wixfox Game Control Centre - Main Application Engine
 * Implements full PRD specifications: Game Mode Switcher, Hardcore Settings,
 * Instant Kill, Moderation, File Manager, RCON Console, and RBAC.
 */

// ===================================================================
// 1. STATE & DATA STORE
// ===================================================================
const AppState = {
  currentRole: 'Owner / Super Admin', // 'Owner / Super Admin' | 'Admin' | 'Moderator' | 'Developer'
  activeTab: 'dashboard',
  server: {
    online: true,
    uptimeSeconds: 9240, // 2h 34m
    tps: 20.00,
    mspt: 45,
    playersOnline: 12,
    playersMax: 100,
    dbHealth: 98,
    cpuUsage: 32,
    memUsage: 64,
    diskUsage: 42,
    hardcoreEnabled: false
  },
  players: [
    { id: 'p-1', name: 'StevePro', platform: 'JAVA', uuid: 'e0d7c2a1-4567-4890-a1b2-c3d4e5f6a7b8', gameMode: 'Survival', status: 'Online', playtime: '2h 12m', ip: '192.168.1.45', health: 20, food: 20, rank: 'VIP' },
    { id: 'p-2', name: 'BuilderKing', platform: 'BEDROCK', uuid: '00000000-0000-0000-0009-01f234567890', gameMode: 'Creative', status: 'Online', playtime: '1h 48m', ip: '192.168.1.88', health: 20, food: 20, rank: 'Premium' },
    { id: 'p-3', name: 'FoxGamer', platform: 'JAVA', uuid: 'b1a2c3d4-e5f6-7890-1234-56789abcdef0', gameMode: 'Survival', status: 'Online', playtime: '1h 30m', ip: '10.0.0.15', health: 14, food: 18, rank: 'Member' },
    { id: 'p-4', name: 'Dreamer', platform: 'BEDROCK', uuid: '00000000-0000-0000-0009-02abcdef1234', gameMode: 'Adventure', status: 'Online', playtime: '1h 20m', ip: '172.16.0.4', health: 18, food: 15, rank: 'Member' },
    { id: 'p-5', name: 'MinecraftFan', platform: 'JAVA', uuid: 'a9b8c7d6-e5f4-3210-fedc-ba9876543210', gameMode: 'Survival', status: 'Online', playtime: '1h 10m', ip: '192.168.1.102', health: 20, food: 20, rank: 'Member' },
    { id: 'p-6', name: 'BadPlayer', platform: 'JAVA', uuid: 'fa112233-4455-6677-8899-aabbccddeeff', gameMode: 'Survival', status: 'Banned', playtime: '12m', ip: '203.0.113.19', health: 0, food: 0, rank: 'Member' }
  ],
  activities: [
    { id: 'act-1', text: 'Player StevePro joined the server', time: '2m ago', type: 'join' },
    { id: 'act-2', text: 'Player BadPlayer was banned', time: '5m ago', type: 'ban' },
    { id: 'act-3', text: 'Server backup completed', time: '12m ago', type: 'backup' },
    { id: 'act-4', text: 'New announcement posted', time: '15m ago', type: 'announcement' },
    { id: 'act-5', text: 'Player DragonLeft left the server', time: '18m ago', type: 'quit' }
  ],
  auditLogs: [
    { timestamp: '2026-11-16 00:35:12', actor: 'Admin', role: 'Owner', action: 'SERVER_BACKUP', target: 'world, postgres', result: 'SUCCESS' },
    { timestamp: '2026-11-16 00:30:05', actor: 'Admin', role: 'Admin', action: 'BAN_PLAYER', target: 'BadPlayer', result: 'BANNED (Cheating)' },
    { timestamp: '2026-11-16 00:25:40', actor: 'Admin', role: 'Admin', action: 'CHANGE_GAMEMODE', target: 'BuilderKing -> Creative', result: 'SUCCESS' }
  ],
  consoleLogs: [
    { level: 'INFO', time: '00:10:01', text: '[NetworkCore] PostgreSQL HikariPool healthy with 5 active connections.' },
    { level: 'INFO', time: '00:11:42', text: '[Geyser-Spigot] Player BuilderKing (Bedrock) joined the server.' },
    { level: 'INFO', time: '00:12:05', text: '[EconomyCore] Processed transfer of $250.00 Coins from StevePro to BuilderKing.' },
    { level: 'INFO', time: '00:14:19', text: '[Paper] Server TPS: 20.00, MSPT: 45ms. 12 players online.' }
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

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
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
  const entry = {
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    actor: 'Admin',
    role: AppState.currentRole,
    action,
    target,
    result
  };
  AppState.auditLogs.unshift(entry);

  // Also add to live activity
  AppState.activities.unshift({
    id: 'act-' + Date.now(),
    text: `${action}: ${target}`,
    time: 'Just now',
    type: action.toLowerCase().includes('ban') ? 'ban' : 'announcement'
  });

  renderRecentActivity();
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
  document.getElementById('currentRoleLabel').textContent = newRole;
  showToast(`Switched active staff role to: ${newRole}`, 'info');
  updateUIForRole();
}

function updateUIForRole() {
  const isMod = AppState.currentRole === 'Moderator';
  const isDev = AppState.currentRole === 'Developer';

  // Update button visibility or state
  const killBtns = document.querySelectorAll('.perm-kill');
  killBtns.forEach(btn => btn.style.display = hasPermission('canKill') ? '' : 'none');

  const uploadBtns = document.querySelectorAll('.perm-upload');
  uploadBtns.forEach(btn => btn.style.display = hasPermission('canUploadPlugins') ? '' : 'none');
}

// ===================================================================
// 4. TAB NAVIGATION
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
    // If specific subview not yet rendered, show dashboard
    document.getElementById('view-dashboard').style.display = 'flex';
  }

  showToast(`Viewing: ${tabId.replace('-', ' ').toUpperCase()}`, 'info');
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
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Shift data
    phase += 0.05;
    const currentPoints = points.map((p, i) => {
      return p + Math.sin(phase + i * 0.5) * 6;
    });

    // Create Gradient
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

    // Line stroke
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Fill under curve
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
// 6. PLAYER RENDERING & MANAGEMENT ACTIONS
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
// 7. MODALS (KILL, GAMEMODE, HARDCORE, BAN, FILE MANAGER)
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

// Mask IP for sensitive data protection
function maskIP(ip) {
  if (!hasPermission('canBan')) {
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.*.*`;
  }
  return ip;
}

// ACTION: Instant Kill
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

  recordAudit('INSTANT_KILL', player.name, `Executed /kill ${player.name}`);
  showToast(`Executed: /kill ${player.name}. Target eliminated.`, 'success');
  closeModal('playerActionModal');
}

// ACTION: Change Game Mode
function executeChangeGameMode(newMode) {
  if (!hasPermission('canChangeMode')) {
    showToast('Permission Denied: Your staff role cannot change game modes.', 'error');
    return;
  }
  const player = AppState.selectedPlayer;
  if (!player) return;

  player.gameMode = newMode;
  recordAudit('CHANGE_GAMEMODE', `${player.name} -> ${newMode}`, `Executed /gamemode ${newMode.toLowerCase()} ${player.name}`);
  showToast(`Updated ${player.name}'s game mode to: ${newMode}`, 'success');
  renderPlayerOverview();
  closeModal('playerActionModal');
}

// ACTION: Kick Player
function executeKick() {
  const player = AppState.selectedPlayer;
  const reason = document.getElementById('kickReasonInput').value || 'Violation of server rules';
  if (!player) return;

  recordAudit('KICK_PLAYER', player.name, reason);
  player.status = 'Kicked';
  showToast(`Kicked ${player.name} from server. Reason: ${reason}`, 'warning');
  renderPlayerOverview();
  closeModal('kickModal');
  closeModal('playerActionModal');
}

// ACTION: Ban Player
function executeBan() {
  if (!hasPermission('canBan')) {
    showToast('Permission Denied: Your staff role cannot issue bans.', 'error');
    return;
  }
  const player = AppState.selectedPlayer;
  const reason = document.getElementById('banReasonInput').value || 'Banned by operator';
  const isIPBan = document.getElementById('banIPCheckbox').checked;
  if (!player) return;

  player.status = 'Banned';
  const actionType = isIPBan ? 'IP_BAN_PLAYER' : 'BAN_PLAYER';
  recordAudit(actionType, `${player.name} (${player.ip})`, reason);

  showToast(`${isIPBan ? 'IP-Banned' : 'Banned'} ${player.name}. Reason: ${reason}`, 'error');
  renderPlayerOverview();
  closeModal('banModal');
  closeModal('playerActionModal');
}

// ACTION: Hardcore World Toggle with Confirmation
function executeHardcoreToggle() {
  if (!hasPermission('canConfigureHardcore')) {
    showToast('Permission Denied: Only Owner or Admin can configure Hardcore.', 'error');
    return;
  }

  const newState = !AppState.server.hardcoreEnabled;
  AppState.server.hardcoreEnabled = newState;

  recordAudit('HARDCORE_CONFIG', `World: world`, `Hardcore set to ${newState ? 'ENABLED' : 'DISABLED'}`);
  showToast(`Hardcore gameplay mode has been ${newState ? 'ACTIVATED' : 'DEACTIVATED'} for world.`, newState ? 'warning' : 'info');
  document.getElementById('hardcoreStatusPill').textContent = newState ? 'HARDCORE ACTIVE' : 'Normal Survival';
  document.getElementById('hardcoreStatusPill').className = newState ? 'stat-badge pos' : 'stat-badge neg';

  closeModal('hardcoreModal');
}

// ACTION: RCON Command Execution
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

  // Command result simulation
  setTimeout(() => {
    const resEntry = document.createElement('div');
    resEntry.style.color = '#cbd5e1';
    resEntry.textContent = `[Server]: Executed '${command}' successfully.`;
    terminal.appendChild(resEntry);
    terminal.scrollTop = terminal.scrollHeight;
  }, 300);

  recordAudit('CONSOLE_CMD', command, 'EXECUTED');
  input.value = '';
}

// Quick action: Server Restart
function triggerServerRestart() {
  if (!hasPermission('canManageStaff') && AppState.currentRole !== 'Admin') {
    showToast('Permission Denied: Restart requires Admin or Owner role.', 'error');
    return;
  }
  recordAudit('SERVER_RESTART', 'wixfox-smp', 'Manual restart initiated');
  showToast('Server restart signal dispatched. Broadcast sent to online players.', 'warning');
}

// Quick action: Backup Now
function triggerBackupNow() {
  recordAudit('BACKUP_NOW', 'world + postgres', 'Automatic backup snapshot triggered');
  showToast('Creating full atomic backup archive (PostgreSQL + Worlds)...', 'success');
  setTimeout(() => {
    showToast('Backup completed! Snapshot saved: backup_full_20261116.tar.gz', 'success');
  }, 1200);
}

// Utility: Escape HTML
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

// ===================================================================
// 8. INITIALIZATION ON DOM READY
// ===================================================================
window.addEventListener('DOMContentLoaded', () => {
  initWaveformChart();
  renderPlayerOverview();
  renderRecentActivity();
  updateUIForRole();

  // Attach nav clicks
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
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

  showToast('Wixfox Game Control Centre v1.0 initialized.', 'success');
});
