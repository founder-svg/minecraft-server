import React, { useState, useEffect } from 'react';
import {
  Server,
  Users,
  DollarSign,
  ShieldAlert,
  Database,
  Terminal,
  Activity,
  Cpu,
  RefreshCw,
  Search,
  UserX,
  VolumeX,
  CheckCircle,
  AlertTriangle,
  Play
} from 'lucide-react';

interface ServerStatus {
  server_name: string;
  is_online: boolean;
  online_players: number;
  max_players: number;
  tps: number;
  mspt: number;
}

interface PlayerRecord {
  id: string;
  username: string;
  platform: 'JAVA' | 'BEDROCK';
  balance: number;
  playtime_seconds: number;
  status: string;
}

interface TransactionRecord {
  id: string;
  sender_name?: string;
  receiver_name?: string;
  amount: number;
  transaction_type: string;
  created_at: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'server' | 'economy' | 'moderation' | 'backups'>('overview');
  const [status, setStatus] = useState<ServerStatus>({
    server_name: 'wixfox-smp',
    is_online: true,
    online_players: 7,
    max_players: 20,
    tps: 20.0,
    mspt: 14.2,
  });

  const [players, setPlayers] = useState<PlayerRecord[]>([
    { id: '1', username: 'AlexWix', platform: 'JAVA', balance: 4500.50, playtime_seconds: 43200, status: 'ACTIVE' },
    { id: '2', username: '.SteveMobile', platform: 'BEDROCK', balance: 1200.00, playtime_seconds: 18000, status: 'ACTIVE' },
    { id: '3', username: 'CryptoMiner', platform: 'JAVA', balance: 18900.00, playtime_seconds: 96000, status: 'ACTIVE' },
    { id: '4', username: '.BedrockPro', platform: 'BEDROCK', balance: 850.00, playtime_seconds: 7200, status: 'ACTIVE' },
  ]);

  const [transactions, setTransactions] = useState<TransactionRecord[]>([
    { id: 'tx-1', sender_name: 'AlexWix', receiver_name: '.SteveMobile', amount: 250.00, transaction_type: 'TRANSFER', created_at: '2026-11-16 00:15:20' },
    { id: 'tx-2', sender_name: undefined, receiver_name: 'CryptoMiner', amount: 500.00, transaction_type: 'DAILY_REWARD', created_at: '2026-11-16 00:10:00' },
  ]);

  const [consoleCommand, setConsoleCommand] = useState('');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '[00:10:01 INFO]: [NetworkCore] PostgreSQL HikariPool healthy with 5 active connections.',
    '[00:11:42 INFO]: [Geyser-Spigot] Player .SteveMobile (Bedrock) joined the game.',
    '[00:12:05 INFO]: [EconomyCore] Processed transfer of $250.00 Coins from AlexWix to .SteveMobile.',
    '[00:14:19 INFO]: [Paper] Server TPS: 20.0, MSPT: 14.2ms. Entity count: 184.',
  ]);

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consoleCommand.trim()) return;
    setConsoleLogs(prev => [...prev, `> ${consoleCommand}`, `[Console]: Command executed: ${consoleCommand}`]);
    setConsoleCommand('');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center font-bold text-black text-xl shadow-lg shadow-green-500/20">
            W
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Wixfox Network</h1>
            <p className="text-xs text-slate-400">Admin Control Panel</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'players', label: 'Players', icon: Users },
            { id: 'server', label: 'Server Console', icon: Terminal },
            { id: 'economy', label: 'Economy Ledger', icon: DollarSign },
            { id: 'moderation', label: 'Moderation', icon: ShieldAlert },
            { id: 'backups', label: 'Backups', icon: Database },
          ].map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center">
          <span>Capacity: 20 Players</span>
          <span className="flex items-center space-x-1 text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Online</span>
          </span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold capitalize">{activeTab} Dashboard</h2>
            <p className="text-sm text-slate-400">Minecraft Java & Bedrock crossplay cluster</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <div className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
              Paper 1.20.4 + Geyser
            </div>
          </div>
        </header>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex justify-between items-start">
                  <span className="text-xs text-slate-400 font-medium">Online Players</span>
                  <Users className="w-5 h-5 text-green-400" />
                </div>
                <div className="mt-4 flex items-baseline space-x-2">
                  <span className="text-3xl font-bold">{status.online_players}</span>
                  <span className="text-slate-500 text-sm">/ {status.max_players}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-green-500 h-full rounded-full transition-all"
                    style={{ width: `${(status.online_players / status.max_players) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex justify-between items-start">
                  <span className="text-xs text-slate-400 font-medium">Server Performance</span>
                  <Activity className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="mt-4 flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-emerald-400">{status.tps.toFixed(1)}</span>
                  <span className="text-slate-500 text-sm">TPS (Target: 20.0)</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">MSPT: {status.mspt} ms (Healthy &lt; 50ms)</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex justify-between items-start">
                  <span className="text-xs text-slate-400 font-medium">RAM Allocation</span>
                  <Cpu className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="mt-4 flex items-baseline space-x-2">
                  <span className="text-3xl font-bold">4.2</span>
                  <span className="text-slate-500 text-sm">/ 5.0 GB</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Aikar's G1GC Flags Active</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex justify-between items-start">
                  <span className="text-xs text-slate-400 font-medium">Database Cluster</span>
                  <Database className="w-5 h-5 text-blue-400" />
                </div>
                <div className="mt-4 flex items-center space-x-2">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span className="text-xl font-bold">PostgreSQL 16</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">17 Tables • ACID Ledger Active</p>
              </div>
            </div>

            {/* Quick Actions & Crossplay Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                  <Server className="w-5 h-5 text-green-400" />
                  <span>Crossplay Services Status</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50">
                    <div>
                      <p className="font-medium text-sm">Java Edition Port</p>
                      <p className="text-xs text-slate-400">TCP 25565 • Paper Engine</p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-green-500/10 text-green-400 border border-green-500/20">Operational</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50">
                    <div>
                      <p className="font-medium text-sm">Bedrock Protocol (GeyserMC)</p>
                      <p className="text-xs text-slate-400">UDP 19132 • Pocket Edition / Win10</p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-green-500/10 text-green-400 border border-green-500/20">Operational</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50">
                    <div>
                      <p className="font-medium text-sm">Floodgate Auth Bridge</p>
                      <p className="text-xs text-slate-400">Encrypted key exchange (key.pem)</p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-green-500/10 text-green-400 border border-green-500/20">Verified</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  <span>Active Custom Plugins (7 Modules)</span>
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['NetworkCore', 'PlayerManager', 'EconomyCore', 'RankManager', 'ModerationCore', 'LandProtection', 'LobbyCore'].map(name => (
                    <div key={name} className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                      <span className="font-medium">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Players */}
        {activeTab === 'players' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div className="relative w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search player by username or UUID..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-green-500"
                />
              </div>
              <div className="text-xs text-slate-400">Total Players in Network: 4</div>
            </div>

            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/50 text-slate-400 font-semibold text-xs border-b border-slate-800">
                <tr>
                  <th className="p-4">Player</th>
                  <th className="p-4">Platform</th>
                  <th className="p-4">Balance</th>
                  <th className="p-4">Playtime</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {players.map(p => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-4 font-medium flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300">
                        {p.username[0].toUpperCase()}
                      </div>
                      <span>{p.username}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        p.platform === 'BEDROCK' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {p.platform}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-green-400">${p.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="p-4 text-slate-400">{(p.playtime_seconds / 3600).toFixed(1)} hrs</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-500/10 text-green-400">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded text-slate-300">View</button>
                      <button className="px-2.5 py-1 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded">Mute</button>
                      <button className="px-2.5 py-1 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded">Ban</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Server Console */}
        {activeTab === 'server' && (
          <div className="space-y-4">
            <div className="bg-black/80 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 h-96 overflow-y-auto space-y-1">
              {consoleLogs.map((log, idx) => (
                <div key={idx} className={log.startsWith('>') ? 'text-green-400 font-bold' : ''}>
                  {log}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendCommand} className="flex space-x-3">
              <input
                type="text"
                value={consoleCommand}
                onChange={e => setConsoleCommand(e.target.value)}
                placeholder="Enter RCON command (e.g. tps, say Hello, kick, eco give)..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-green-500 font-mono"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 hover:bg-green-500 text-black font-semibold rounded-lg text-sm flex items-center space-x-2 transition"
              >
                <Play className="w-4 h-4" />
                <span>Execute</span>
              </button>
            </form>
          </div>
        )}

        {/* Tab 4: Economy */}
        {activeTab === 'economy' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h3 className="font-bold text-sm">Real-Time Financial Audit Ledger (ACID Validated)</h3>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/50 text-slate-400 font-semibold text-xs border-b border-slate-800">
                <tr>
                  <th className="p-4">Sender</th>
                  <th className="p-4">Receiver</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {transactions.map(tx => (
                  <tr key={tx.id}>
                    <td className="p-4 text-slate-300">{tx.sender_name || 'SYSTEM / CONSOLE'}</td>
                    <td className="p-4 text-green-400 font-bold">{tx.receiver_name}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300">
                        {tx.transaction_type}
                      </span>
                    </td>
                    <td className="p-4 text-yellow-400 font-bold">${tx.amount.toFixed(2)}</td>
                    <td className="p-4 text-slate-500">{tx.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 5: Moderation */}
        {activeTab === 'moderation' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-2">Network Moderation Engine</h3>
            <p className="text-sm text-slate-400 mb-6">Manage cross-platform bans, mutes, warnings, and IP lockouts.</p>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              No active bans or mutes currently impacting players. All systems clean.
            </div>
          </div>
        )}

        {/* Tab 6: Backups */}
        {activeTab === 'backups' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-lg">Automated World & Database Backups</h3>
                <p className="text-sm text-slate-400">Scheduled retention: 7 daily, 4 weekly, 3 monthly</p>
              </div>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-500 text-black font-semibold rounded-lg text-sm transition">
                Create Backup Now
              </button>
            </div>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-800/50 flex justify-between items-center">
                <span>backup_full_20261116_000000.tar.gz (PostgreSQL + Worlds)</span>
                <span className="text-green-400">142.8 MB • Verified</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
