'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const StatCard = ({ title, value, subtitle, color, icon }) => (
  <div style={{
    background: '#1a1a2e', borderRadius: '12px', padding: '24px',
    borderLeft: `4px solid ${color}`, flex: 1, minWidth: '160px'
  }}>
    <div style={{ fontSize: '28px', marginBottom: '4px' }}>{icon}</div>
    <div style={{ color: '#aaa', fontSize: '13px', marginBottom: '8px' }}>{title}</div>
    <div style={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}>{value}</div>
    {subtitle && <div style={{ color: color, fontSize: '12px', marginTop: '4px' }}>{subtitle}</div>}
  </div>
)

export default function Dashboard() {
  const [stats, setStats]     = useState({ sent: 0, opened: 0, bounced: 0, replied: 0, blocked: 0 })
  const [emails, setEmails]   = useState([])
  const [filter, setFilter]   = useState('all')
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState('')

  async function fetchData() {
    setLoading(true)

    // Stats
    const { data: allEmails } = await supabase
      .from('emails').select('status, sent_at, company, recipient_email, sent_from, tracking_id')
      .order('sent_at', { ascending: false })
      .limit(500)

    if (allEmails) {
      const sent    = allEmails.length
      const opened  = allEmails.filter(e => e.status === 'opened').length
      const bounced = allEmails.filter(e => e.status === 'bounced').length
      const replied = allEmails.filter(e => e.status === 'replied').length
      const blocked = allEmails.filter(e => e.status === 'blocked').length
      setStats({ sent, opened, bounced, replied, blocked })
      setEmails(allEmails)
    }

    setLastUpdated(new Date().toLocaleTimeString('bn-BD'))
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // 30s auto refresh
    return () => clearInterval(interval)
  }, [])

  const filtered = filter === 'all' ? emails : emails.filter(e => e.status === filter)
  const openRate = stats.sent > 0 ? ((stats.opened / stats.sent) * 100).toFixed(1) : 0

  const statusColor = {
    sent: '#3b82f6', opened: '#10b981', bounced: '#ef4444',
    replied: '#f59e0b', blocked: '#8b5cf6'
  }
  const statusIcon = {
    sent: '✉️', opened: '👁️', bounced: '❌', replied: '💬', blocked: '🚫'
  }

  return (
    <div style={{ background: '#0f0f1a', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#1a1a2e', padding: '20px 32px', borderBottom: '1px solid #2a2a4a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>📧 Email Bot Dashboard</h1>
          <p style={{ margin: '4px 0 0', color: '#888', fontSize: '13px' }}>Neaz Md. Morshed | Real-time tracking</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#888', fontSize: '12px' }}>Last updated: {lastUpdated}</div>
          <button onClick={fetchData} style={{ marginTop: '8px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 16px', cursor: 'pointer', fontSize: '13px' }}>
            🔄 Refresh
          </button>
        </div>
      </div>

      <div style={{ padding: '32px' }}>
        {/* Stats */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
          <StatCard title="মোট পাঠানো"   value={stats.sent}    icon="✉️"  color="#3b82f6" subtitle="Total sent" />
          <StatCard title="Open হয়েছে"   value={stats.opened}  icon="👁️"  color="#10b981" subtitle={`Open rate: ${openRate}%`} />
          <StatCard title="Bounce হয়েছে" value={stats.bounced} icon="❌"  color="#ef4444" subtitle={`${stats.sent > 0 ? ((stats.bounced/stats.sent)*100).toFixed(1) : 0}% bounce rate`} />
          <StatCard title="Reply এসেছে"  value={stats.replied} icon="💬"  color="#f59e0b" subtitle="Hot leads!" />
          <StatCard title="Block হয়েছে"  value={stats.blocked} icon="🚫"  color="#8b5cf6" subtitle="Blocked" />
        </div>

        {/* Open Rate Bar */}
        <div style={{ background: '#1a1a2e', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#aaa', fontSize: '14px' }}>Open Rate Progress</span>
            <span style={{ color: '#10b981', fontWeight: 'bold' }}>{openRate}%</span>
          </div>
          <div style={{ background: '#2a2a4a', borderRadius: '999px', height: '8px' }}>
            <div style={{ background: 'linear-gradient(90deg, #10b981, #3b82f6)', borderRadius: '999px', height: '8px', width: `${Math.min(openRate, 100)}%`, transition: 'width 0.5s' }} />
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {['all', 'sent', 'opened', 'bounced', 'replied', 'blocked'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: filter === f ? (statusColor[f] || '#3b82f6') : '#1a1a2e',
              color: '#fff', border: `1px solid ${statusColor[f] || '#3b82f6'}`,
              borderRadius: '8px', padding: '6px 16px', cursor: 'pointer', fontSize: '13px',
              textTransform: 'capitalize'
            }}>
              {statusIcon[f] || '📋'} {f === 'all' ? 'সব' : f}
              {f !== 'all' && <span style={{ marginLeft: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '999px', padding: '1px 6px', fontSize: '11px' }}>
                {emails.filter(e => e.status === f).length}
              </span>}
            </button>
          ))}
        </div>

        {/* Email Table */}
        <div style={{ background: '#1a1a2e', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#2a2a4a' }}>
                {['Company', 'Email', 'Sent From', 'Status', 'Sent At'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#aaa', fontSize: '13px', fontWeight: '600' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#888' }}>কোনো data নেই</td></tr>
              ) : filtered.map((email, i) => (
                <tr key={email.tracking_id} style={{ borderTop: '1px solid #2a2a4a', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>{email.company || '-'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#aaa' }}>{email.recipient_email}</td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#888' }}>{email.sent_from?.split('@')[0]}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      background: `${statusColor[email.status] || '#888'}22`,
                      color: statusColor[email.status] || '#888',
                      padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600'
                    }}>
                      {statusIcon[email.status]} {email.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#888' }}>
                    {email.sent_at ? new Date(email.sent_at).toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' }) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '16px', color: '#555', fontSize: '12px', textAlign: 'center' }}>
          Showing {filtered.length} of {emails.length} emails • Auto-refreshes every 30s
        </div>
      </div>
    </div>
  )
}
