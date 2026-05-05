import { useState } from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import TopBar from '@/components/layout/TopBar'

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer flex-shrink-0"
      style={{ backgroundColor: checked ? '#0f4c81' : '#e2e8f0' }}
    >
      <span
        className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform"
        style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }}
      />
    </button>
  )
}

export default function Settings() {
  const [profile, setProfile] = useState({
    name: 'Dr. Sarah Chen', email: 'sarah.chen@sunrisecare.org',
    role: 'Attending Physician', facility: 'Sunrise Care Center',
  })

  const [alerts, setAlerts] = useState({
    criticalAlarms: true, highAlarms: true, mediumAlarms: false,
    sensorOffline: true, batteryLow: false,
  })

  const [delivery, setDelivery] = useState({
    emailNotifications: true, pushNotifications: true, smsAlerts: false,
  })

  const [display, setDisplay] = useState({
    compactMode: false, showVitalWarnings: true, autoRefresh: true,
  })

  const toggle = (group, setter) => key =>
    setter(prev => ({ ...prev, [key]: !prev[key] }))

  const Section = ({ title, children }) => (
    <Card>
      <CardHeader><h3 className="font-semibold text-slate-800">{title}</h3></CardHeader>
      <CardBody className="space-y-4">{children}</CardBody>
    </Card>
  )

  const ToggleRow = ({ label, desc, checked, onChange }) => (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-medium text-slate-700">{label}</div>
        {desc && <div className="text-xs text-slate-400 mt-0.5">{desc}</div>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )

  return (
    <div>
      <TopBar title="Settings" subtitle="Manage your account and preferences" />
      <div className="p-6 space-y-6 max-w-2xl">

        <Section title="Profile">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Full Name', key: 'name' },
              { label: 'Email', key: 'email' },
              { label: 'Role', key: 'role' },
              { label: 'Facility', key: 'facility' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-slate-500 mb-1">{f.label}</label>
                <input
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0f4c81] transition-colors"
                  value={profile[f.key]}
                  onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button size="sm">Save Profile</Button>
          </div>
        </Section>

        <Section title="Alert Preferences">
          <ToggleRow label="Critical Alarms" desc="Receive alerts for critical severity alarms"
            checked={alerts.criticalAlarms} onChange={v => setAlerts(p => ({ ...p, criticalAlarms: v }))} />
          <ToggleRow label="High Alarms" desc="Receive alerts for high severity alarms"
            checked={alerts.highAlarms} onChange={v => setAlerts(p => ({ ...p, highAlarms: v }))} />
          <ToggleRow label="Medium Alarms" desc="Receive alerts for medium severity alarms"
            checked={alerts.mediumAlarms} onChange={v => setAlerts(p => ({ ...p, mediumAlarms: v }))} />
          <ToggleRow label="Sensor Offline" desc="Alert when a sensor goes offline"
            checked={alerts.sensorOffline} onChange={v => setAlerts(p => ({ ...p, sensorOffline: v }))} />
          <ToggleRow label="Battery Low" desc="Alert when sensor battery drops below 20%"
            checked={alerts.batteryLow} onChange={v => setAlerts(p => ({ ...p, batteryLow: v }))} />
        </Section>

        <Section title="Delivery Channels">
          <ToggleRow label="Email Notifications" checked={delivery.emailNotifications}
            onChange={v => setDelivery(p => ({ ...p, emailNotifications: v }))} />
          <ToggleRow label="Push Notifications" checked={delivery.pushNotifications}
            onChange={v => setDelivery(p => ({ ...p, pushNotifications: v }))} />
          <ToggleRow label="SMS Alerts" desc="Critical alarms only"
            checked={delivery.smsAlerts} onChange={v => setDelivery(p => ({ ...p, smsAlerts: v }))} />
        </Section>

        <Section title="Display Preferences">
          <ToggleRow label="Compact Mode" desc="Reduce card padding and spacing"
            checked={display.compactMode} onChange={v => setDisplay(p => ({ ...p, compactMode: v }))} />
          <ToggleRow label="Vital Warnings" desc="Highlight abnormal vital signs in red"
            checked={display.showVitalWarnings} onChange={v => setDisplay(p => ({ ...p, showVitalWarnings: v }))} />
          <ToggleRow label="Auto Refresh" desc="Refresh alarm and sensor data every 30s"
            checked={display.autoRefresh} onChange={v => setDisplay(p => ({ ...p, autoRefresh: v }))} />
        </Section>

        <Section title="Security">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-700">Change Password</div>
              <div className="text-xs text-slate-400 mt-0.5">Last changed 90 days ago</div>
            </div>
            <Button variant="outline" size="sm">Change</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-700">Two-Factor Authentication</div>
              <div className="text-xs text-slate-400 mt-0.5">Add an extra layer of security</div>
            </div>
            <Button variant="outline" size="sm">Enable</Button>
          </div>
        </Section>

      </div>
    </div>
  )
}
