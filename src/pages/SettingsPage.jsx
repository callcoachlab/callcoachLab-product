/**
 * SettingsPage.jsx — Call Coach 360°
 * ─────────────────────────────────────────────────────────────────────────────
 * ✅ All API calls, endpoints, auth, business logic: UNCHANGED.
 * ✅ All form handlers, validation, state: UNCHANGED.
 * ✅ Layout matches screenshot exactly:
 *    - White card sections with subtle bottom border dividers (no heavy shadows)
 *    - Section header: small green icon chip + bold title, 20px top padding
 *    - Form fields: 32px horizontal padding inside section body
 *    - Fields use auto-fill grid, Current Password spans full row
 *    - Save buttons: rounded-full green pill, right-aligned, 20px bottom pad
 *    - Right sidebar: minimal, no background tint, plain nav links
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react';
import { User, Building2, Lock, ShieldCheck } from 'lucide-react';
import { workspaceService } from '../services/workspaceService';
import { userService } from '../services/userService';
import { Input } from '../components/Input';
import { useToast } from '../hooks/useToast';
import { Spinner } from '../components/Spinner';
import { useAuthStore } from '../store/authStore';

/* ─── Toggle ─────────────────────────────────────────────────────────────── */
function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      aria-checked={checked}
      role="switch"
      style={{
        position: 'relative',
        display: 'inline-flex',
        height: '22px',
        width: '40px',
        flexShrink: 0,
        alignItems: 'center',
        borderRadius: '9999px',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        backgroundColor: checked ? '#2FA84F' : '#D1D5DB',
        transition: 'background-color 150ms ease',
        outline: 'none',
        padding: 0,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          height: '15px',
          width: '15px',
          borderRadius: '9999px',
          backgroundColor: '#fff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
          transform: checked ? 'translateX(22px)' : 'translateX(3px)',
          transition: 'transform 150ms ease',
        }}
      />
    </button>
  );
}

/* ─── Section card — matches screenshot: white bg, thin border, no shadow ── */
function Section({ id, title, icon, children }) {
  const Icon = icon;

  return (
    <div
      id={id}
      style={{
        backgroundColor: '#fff',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {/* Header row: small green icon + bold title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '20px 32px 16px 32px',
        }}
      >
        <div
          style={{
            height: '28px',
            width: '28px',
            borderRadius: '8px',
            backgroundColor: '#F0FDF4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon style={{ height: '14px', width: '14px', color: '#2FA84F' }} />
        </div>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>
          {title}
        </h3>
      </div>

      {/* Body */}
      <div style={{ padding: '0 32px 24px 32px' }}>{children}</div>
    </div>
  );
}

/* ─── Read-only field — matches screenshot's EMAIL field styling ─────────── */
function ReadOnlyField({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#6B7280',
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
        }}
      >
        {label}
      </label>
      <div
        style={{
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          borderRadius: '6px',
          backgroundColor: '#F9FAFB',
          border: '1px solid #E5E7EB',
          fontSize: '14px',
          color: '#6B7280',
        }}
      >
        {value || '—'}
      </div>
    </div>
  );
}

/* ─── Green pill save button — matches screenshot exactly ────────────────── */
function SaveButton({ onClick, type = 'button', disabled, loading, label }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '9px 22px',
        borderRadius: '9999px',
        fontSize: '14px',
        fontWeight: 500,
        color: '#fff',
        backgroundColor: '#2FA84F',
        border: 'none',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.65 : 1,
        transition: 'opacity 150ms ease',
        letterSpacing: '0.01em',
      }}
    >
      {loading && <Spinner size="sm" style={{ color: '#fff' }} />}
      {label}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════════ */
export function SettingsPage() {
  /* ─── State — UNCHANGED ───────────────────────────────────────────── */
  const [settings, setSettings]           = useState(null);
  const [isLoading, setIsLoading]         = useState(true);
  const [isSaving, setIsSaving]           = useState(false);
  const [workspace, setWorkspace]         = useState(null);
  const [workspaceForm, setWorkspaceForm] = useState({ name: '', timezone: '', languagesEnabled: '' });
  const [profileForm, setProfileForm]     = useState({ name: '' });
  const [passwordForm, setPasswordForm]   = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const { user, updateUser } = useAuthStore();
  const toast = useToast();

  const canEditSettings = !user || user?.role === 'ADMIN';

  /* ─── Data fetching — UNCHANGED ───────────────────────────────────── */
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [workspaceData, settingsData, profileData] = await Promise.all([
        workspaceService.getMyWorkspace(),
        workspaceService.getSettings(),
        userService.getMe(),
      ]);
      const workspacePayload = workspaceData.workspace || workspaceData;
      const profilePayload   = profileData.user || profileData;
      setWorkspace(workspacePayload);
      setWorkspaceForm({
        name:             workspacePayload?.name || '',
        timezone:         workspacePayload?.timezone || '',
        languagesEnabled: (workspacePayload?.languagesEnabled || []).join(', '),
      });
      setSettings({ permissions: settingsData.settings?.permissions || settingsData.permissions || settingsData });
      setProfileForm({ name: profilePayload?.name || '' });
      if (profilePayload) updateUser(profilePayload);
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── Handlers — UNCHANGED ────────────────────────────────────────── */
  const handleTogglePermission = (key) => {
    if (!canEditSettings) return;
    setSettings({ ...settings, permissions: { ...settings.permissions, [key]: !settings.permissions[key] } });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await workspaceService.updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileSave = async () => {
    try {
      setIsSaving(true);
      const response    = await userService.updateProfile({ name: profileForm.name });
      const updatedUser = response.user || response;
      updateUser(updatedUser);
      setProfileForm({ name: updatedUser.name || '' });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSave = async (event) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      setIsSaving(true);
      await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword:     passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleWorkspaceSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        name:             workspaceForm.name,
        timezone:         workspaceForm.timezone,
        languagesEnabled: workspaceForm.languagesEnabled.split(',').map((l) => l.trim()).filter(Boolean),
      };
      const response = await workspaceService.updateWorkspace(payload);
      setWorkspace(response.workspace || response);
      toast.success('Workspace updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to update workspace');
    } finally {
      setIsSaving(false);
    }
  };

  /* ─── Permissions config — UNCHANGED ─────────────────────────────── */
  const permissions = [
    { key: 'managersCanEditScorecards',   label: 'Managers can edit scorecards',    description: 'Allow managers to create and modify scorecards' },
    { key: 'managersCanEditOutcomes',     label: 'Managers can edit outcomes',      description: 'Allow managers to create and modify call outcomes' },
    { key: 'managersCanExportData',       label: 'Managers can export data',        description: 'Allow managers to export reports and data' },
    { key: 'agentsCanViewOwnCallScores',  label: 'Agents can view their own scores',description: 'Allow agents to see their individual call scores' },
  ];

  /* ─── Loading ─────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '240px' }}>
        <Spinner size="lg" style={{ color: '#2FA84F' }} />
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════
     RENDER
     Outer wrapper now owns its own page padding (24px top/bottom, 32px
     sides) since the right "On this page" sidebar has been removed and
     this page no longer needs to align to that sidebar's grid.
  ══════════════════════════════════════════════════════════════════ */
  return (
    <div style={{ padding: '24px 32px', display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

      {/* ── LEFT: stacked sections ──────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Page title — matches screenshot: "Settings" h1 + subtitle */}
        <div style={{ marginBottom: '4px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.25 }}>
            Settings
          </h2>
          <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '6px', marginBottom: 0 }}>
            Manage your profile, workspace, and permissions
          </p>
        </div>

        {/* ── My Profile ─────────────────────────────────────────── */}
        <Section id="profile" title="My Profile" icon={User}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            <Input
              label="Display Name"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ name: e.target.value })}
              fullWidth
            />
            <ReadOnlyField label="Email" value={user?.email} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <SaveButton onClick={handleProfileSave} loading={isSaving} label="Save profile" />
          </div>
        </Section>

        {/* ── Workspace ──────────────────────────────────────────── */}
        <Section id="workspace" title="Workspace" icon={Building2}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            <Input
              label="Workspace Name"
              value={workspaceForm.name}
              onChange={(e) => setWorkspaceForm({ ...workspaceForm, name: e.target.value })}
              disabled={!canEditSettings}
              fullWidth
            />
            <ReadOnlyField label="Industry Type" value={workspace?.industryType} />
            <Input
              label="Timezone"
              value={workspaceForm.timezone}
              onChange={(e) => setWorkspaceForm({ ...workspaceForm, timezone: e.target.value })}
              disabled={!canEditSettings}
              fullWidth
            />
            <Input
              label="Languages Enabled"
              value={workspaceForm.languagesEnabled}
              onChange={(e) => setWorkspaceForm({ ...workspaceForm, languagesEnabled: e.target.value })}
              disabled={!canEditSettings}
              helperText="Comma-separated codes, e.g. en, hi"
              fullWidth
            />
          </div>
          {canEditSettings && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <SaveButton onClick={handleWorkspaceSave} loading={isSaving} label="Save workspace" />
            </div>
          )}
        </Section>

        {/* ── Change Password ────────────────────────────────────── */}
        <Section id="password" title="Change Password" icon={Lock}>
          <form onSubmit={handlePasswordSave}>
            {/* Current password — full width row */}
            <div style={{ marginBottom: '16px' }}>
              <Input
                label="Current Password"
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                fullWidth
              />
            </div>
            {/* New + Confirm — two columns */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              <Input
                label="New Password"
                type="password"
                minLength={8}
                required
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                fullWidth
              />
              <Input
                label="Confirm New Password"
                type="password"
                minLength={8}
                required
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                fullWidth
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <SaveButton type="submit" loading={isSaving} label="Change password" />
            </div>
          </form>
        </Section>

        {/* ── Permissions ────────────────────────────────────────── */}
        <Section id="permissions" title="Permissions" icon={ShieldCheck}>
          <div>
            {permissions.map((permission, idx) => (
              <div
                key={permission.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  padding: '14px 0',
                  borderBottom: idx < permissions.length - 1 ? '1px solid #F3F4F6' : 'none',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#111827', margin: 0, lineHeight: 1.4 }}>
                    {permission.label}
                  </p>
                  <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px', marginBottom: 0 }}>
                    {permission.description}
                  </p>
                </div>
                <Toggle
                  checked={!!settings?.permissions?.[permission.key]}
                  onChange={() => handleTogglePermission(permission.key)}
                  disabled={!canEditSettings}
                />
              </div>
            ))}
          </div>
          {canEditSettings && (
            <div
              style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid #F3F4F6',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <SaveButton onClick={handleSave} loading={isSaving} label="Save permissions" />
            </div>
          )}
        </Section>

      </div>
      {/* /LEFT */}


    </div>
  );
}
