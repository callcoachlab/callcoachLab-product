import { useState, useEffect } from 'react';
import { workspaceService } from '../services/workspaceService';
import { userService } from '../services/userService';
import { Button } from '../components/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import { useToast } from '../components/Toast';
import { Spinner } from '../components/Spinner';
import { useAuthStore } from '../store/authStore';

export function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [workspace, setWorkspace] = useState(null);
  const [workspaceForm, setWorkspaceForm] = useState({ name: '', timezone: '', languagesEnabled: '' });
  const [profileForm, setProfileForm] = useState({ name: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  
  const { user, updateUser } = useAuthStore();
  const toast = useToast();

  const canEditSettings = !user || user?.role === 'ADMIN';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [workspaceData, settingsData, profileData] = await Promise.all([
        workspaceService.getMyWorkspace(),
        workspaceService.getSettings(),
        userService.getMe(),
      ]);
      const workspacePayload = workspaceData.workspace || workspaceData;
      const profilePayload = profileData.user || profileData;
      setWorkspace(workspacePayload);
      setWorkspaceForm({
        name: workspacePayload?.name || '',
        timezone: workspacePayload?.timezone || '',
        languagesEnabled: (workspacePayload?.languagesEnabled || []).join(', '),
      });
      setSettings({ permissions: settingsData.settings?.permissions || settingsData.permissions || settingsData });
      setProfileForm({ name: profilePayload?.name || '' });
      if (profilePayload) {
        updateUser(profilePayload);
      }
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePermission = (key) => {
    if (!canEditSettings) return;
    
    setSettings({
      ...settings,
      permissions: {
        ...settings.permissions,
        [key]: !settings.permissions[key],
      },
    });
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
      const response = await userService.updateProfile({ name: profileForm.name });
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
        newPassword: passwordForm.newPassword,
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
        name: workspaceForm.name,
        timezone: workspaceForm.timezone,
        languagesEnabled: workspaceForm.languagesEnabled
          .split(',')
          .map((language) => language.trim())
          .filter(Boolean),
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  const permissions = [
    { key: 'managersCanEditScorecards', label: 'Managers can edit scorecards', description: 'Allow managers to create and modify scorecards' },
    { key: 'managersCanEditOutcomes', label: 'Managers can edit outcomes', description: 'Allow managers to create and modify call outcomes' },
    { key: 'managersCanExportData', label: 'Managers can export data', description: 'Allow managers to export reports and data' },
    { key: 'agentsCanViewOwnCallScores', label: 'Agents can view their own scores', description: 'Allow agents to see their individual call scores' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600 mt-1">Manage workspace settings and permissions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              label="Display Name"
              value={profileForm.name}
              onChange={(event) => setProfileForm({ name: event.target.value })}
              fullWidth
            />
            <Input label="Email" value={user?.email || ''} disabled fullWidth />
            <Button onClick={handleProfileSave} loading={isSaving} disabled={isSaving}>
              Save Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Workspace Info */}
      <Card>
        <CardHeader>
          <CardTitle>Workspace Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              label="Workspace Name"
              value={workspaceForm.name}
              onChange={(event) => setWorkspaceForm({ ...workspaceForm, name: event.target.value })}
              disabled={!canEditSettings}
              fullWidth
            />
            <Input
              label="Industry Type"
              value={workspace?.industryType || ''}
              disabled
              fullWidth
            />
            <Input
              label="Timezone"
              value={workspaceForm.timezone}
              onChange={(event) => setWorkspaceForm({ ...workspaceForm, timezone: event.target.value })}
              disabled={!canEditSettings}
              fullWidth
            />
            <Input
              label="Languages Enabled"
              value={workspaceForm.languagesEnabled}
              onChange={(event) => setWorkspaceForm({ ...workspaceForm, languagesEnabled: event.target.value })}
              disabled={!canEditSettings}
              helperText="Comma-separated language codes, for example en, hi"
              fullWidth
            />
            {canEditSettings && (
              <Button onClick={handleWorkspaceSave} loading={isSaving} disabled={isSaving}>
                Save Workspace
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              required
              value={passwordForm.currentPassword}
              onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
              fullWidth
            />
            <Input
              label="New Password"
              type="password"
              minLength={8}
              required
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
              fullWidth
            />
            <Input
              label="Confirm New Password"
              type="password"
              minLength={8}
              required
              value={passwordForm.confirmPassword}
              onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })}
              fullWidth
            />
            <Button type="submit" loading={isSaving} disabled={isSaving}>Change Password</Button>
          </form>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {permissions.map((permission) => (
              <div key={permission.key} className="flex items-start justify-between py-3 border-b last:border-b-0">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{permission.label}</h4>
                  <p className="text-sm text-gray-500 mt-1">{permission.description}</p>
                </div>
                <button
                  onClick={() => handleTogglePermission(permission.key)}
                  disabled={!canEditSettings}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    settings?.permissions?.[permission.key] ? 'bg-blue-600' : 'bg-gray-200'
                  } ${!canEditSettings ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings?.permissions?.[permission.key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          {canEditSettings && (
            <div className="mt-6">
              <Button onClick={handleSave} loading={isSaving} disabled={isSaving}>
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
