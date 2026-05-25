import { useEffect, useState } from 'react';
import { scorecardService } from '../services/scorecardService';
import { Button } from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Spinner } from '../components/Spinner';
import { useToast } from '../components/Toast';

const defaultSections = [
  {
    name: 'Greeting',
    weight: 20,
    criteria: [{ label: 'Did agent greet warmly?', weight: 10, required: true }],
  },
];

const emptyForm = {
  name: '',
  description: '',
  callType: 'Compliance',
  isPublished: false,
  sectionsText: JSON.stringify(defaultSections, null, 2),
};

const listFromResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.scorecards)) return response.scorecards;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

export function ScorecardsPage() {
  const [scorecards, setScorecards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScorecard, setEditingScorecard] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const toast = useToast();

  useEffect(() => {
    fetchScorecards();
  }, []);

  const fetchScorecards = async () => {
    try {
      setIsLoading(true);
      const response = await scorecardService.getScorecards();
      setScorecards(listFromResponse(response));
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to load scorecards');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (scorecard = null) => {
    setEditingScorecard(scorecard);
    setFormData(scorecard ? {
      name: scorecard.name || '',
      description: scorecard.description || '',
      callType: scorecard.callType || 'Compliance',
      isPublished: Boolean(scorecard.isPublished),
      sectionsText: JSON.stringify(scorecard.sections?.length ? scorecard.sections : defaultSections, null, 2),
    } : emptyForm);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingScorecard(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.callType.trim()) {
      toast.error('Name and call type are required');
      return;
    }

    try {
      setIsSaving(true);
      const sections = JSON.parse(formData.sectionsText || '[]');
      const payload = {
        name: formData.name,
        callType: formData.callType,
        isPublished: formData.isPublished,
      };
      if (editingScorecard) {
        await scorecardService.updateScorecard(editingScorecard._id || editingScorecard.id, {
          ...payload,
          description: formData.description,
          sections,
        });
        toast.success('Scorecard updated');
      } else {
        await scorecardService.createScorecard(payload);
        toast.success('Scorecard created');
      }
      closeModal();
      fetchScorecards();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || error.message || 'Scorecard save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (scorecardId) => {
    if (!confirm('Delete this scorecard?')) return;
    try {
      await scorecardService.deleteScorecard(scorecardId);
      toast.success('Scorecard deleted');
      fetchScorecards();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Scorecard delete failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Scorecards</h2>
          <p className="mt-1 text-gray-600">Create and maintain workspace scorecards</p>
        </div>
        <Button onClick={() => openModal()}>Create Scorecard</Button>
      </div>

      {scorecards.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <p className="mb-4 text-lg text-gray-500">No scorecards found</p>
            <Button onClick={() => openModal()}>Create Scorecard</Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {scorecards.map((scorecard) => {
            const scorecardId = scorecard._id || scorecard.id;
            return (
              <Card key={scorecardId}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle>{scorecard.name}</CardTitle>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${scorecard.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                      {scorecard.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Call type</span>
                      <span className="font-medium text-gray-900">{scorecard.callType || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Version</span>
                      <span className="font-medium text-gray-900">v{scorecard.version || 1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Updated</span>
                      <span className="font-medium text-gray-900">
                        {scorecard.updatedAt ? new Date(scorecard.updatedAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-5 flex gap-2">
                    <Button size="sm" variant="outline" fullWidth onClick={() => openModal(scorecard)}>Edit</Button>
                    <Button size="sm" variant="danger" fullWidth onClick={() => handleDelete(scorecardId)}>Delete</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingScorecard ? 'Edit Scorecard' : 'Create Scorecard'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            placeholder="Compliance Check"
            required
            fullWidth
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(event) => setFormData({ ...formData, description: event.target.value })}
            placeholder="Scorecard for inbound appointment calls"
            fullWidth
          />
          <Input
            label="Call Type"
            value={formData.callType}
            onChange={(event) => setFormData({ ...formData, callType: event.target.value })}
            placeholder="Compliance"
            required
            fullWidth
          />
          <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
            <input
              type="checkbox"
              checked={formData.isPublished}
              onChange={(event) => setFormData({ ...formData, isPublished: event.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-800">Publish scorecard</span>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Sections JSON</span>
            <textarea
              value={formData.sectionsText}
              onChange={(event) => setFormData({ ...formData, sectionsText: event.target.value })}
              rows={8}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button type="submit" loading={isSaving}>{editingScorecard ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
