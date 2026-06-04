import { useState, useEffect } from 'react';
import { teamService } from '../services/teamService';
import { Button } from '../components/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { useToast } from '../components/Toast';
import { Spinner } from '../components/Spinner';
import { useAuthStore } from '../store/authStore';

export function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(1);
  
  const { user } = useAuthStore();
  const toast = useToast();

  const canManageTeams = !user || ['ADMIN', 'MANAGER'].includes(user?.role);

  useEffect(() => {
    fetchTeams();
  }, [page]);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const response = await teamService.getTeams({ page, limit: 20 });
      // Check if response is already the data array or has nested structure
      const teamsList = Array.isArray(response) ? response : (response.teams || response.data || []);
      // Normalize id to _id for consistency
      const normalizedTeams = teamsList.map(team => ({
        ...team,
        _id: team._id || team.id
      }));
      setTeams(normalizedTeams);
    } catch (error) {
      toast.error('Failed to load teams');
      console.error('Teams fetch error:', error); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (team = null) => {
    if (team) {
      setEditingTeam(team);
      setFormData({ name: team.name, description: team.description || '' });
    } else {
      setEditingTeam(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
    setErrors({});
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTeam(null);
    setFormData({ name: '', description: '' });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.name) {
      newErrors.name = 'Team name is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (editingTeam) {
        await teamService.updateTeam(editingTeam._id, formData);
        toast.success('Team updated successfully');
      } else {
        await teamService.createTeam(formData);
        toast.success('Team created successfully');
      }
      
      fetchTeams();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Operation failed');
    }
  };

  const handleDelete = async (teamId) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    try {
      await teamService.deleteTeam(teamId);
      toast.success('Team deleted successfully');
      fetchTeams();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Delete failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Teams ({teams.length})</h2>
          <p className="text-gray-600 mt-1">Manage your workspace teams</p>
        </div>
        {canManageTeams && (
          <Button onClick={() => handleOpenModal()}>
            + Create Team
          </Button>
        )}
      </div>

      {teams.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No teams yet</p>
            {canManageTeams && (
              <Button onClick={() => handleOpenModal()}>
                Create Your First Team
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card key={team._id}>
              <CardHeader>
                <CardTitle>{team.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Members:</span>
                    <span className="font-medium">{team.memberCount || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Manager:</span>
                    <span className="font-medium">{team.managerName || 'N/A'}</span>
                  </div>
                  {team.description && (
                    <p className="pt-2 text-sm text-gray-600">{team.description}</p>
                  )}
                </div>
                
                {canManageTeams && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenModal(team)}
                      fullWidth
                    >
                      Edit
                    </Button>
                    {user?.role === 'ADMIN' && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(team._id)}
                        fullWidth
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
          Previous
        </Button>
        <span className="flex items-center px-3 text-sm text-gray-600">Page {page}</span>
        <Button variant="outline" disabled={teams.length < 20} onClick={() => setPage((current) => current + 1)}>
          Next
        </Button>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTeam ? 'Edit Team' : 'Create Team'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Team Name"
            fullWidth
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            placeholder="Sales Team"
          />

          <Input
            label="Description"
            fullWidth
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="testing purpose"
          />

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingTeam ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
