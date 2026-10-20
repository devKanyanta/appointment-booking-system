import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../lib/utils';
import { Clock, Ban, Plus, Trash2, Save } from 'lucide-react';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AdminAvailability() {
  const [workingHours, setWorkingHours] = useState([]);
  const [blockedPeriods, setBlockedPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newBlock, setNewBlock] = useState({ date: '', startTime: '', endTime: '', reason: '' });
  const { success, error: showError } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [hoursRes, blocksRes] = await Promise.all([
        api.get('/admin/availability/working-hours'),
        api.get('/admin/availability/blocked-periods'),
      ]);
      setWorkingHours(hoursRes.data.workingHours);
      setBlockedPeriods(blocksRes.data.blockedPeriods);
    } catch {
      showError('Failed to load availability data');
    } finally {
      setLoading(false);
    }
  };

  const handleHoursChange = (dayOfWeek, field, value) => {
    setWorkingHours((prev) =>
      prev.map((h) =>
        h.day_of_week === dayOfWeek ? { ...h, [field]: value } : h
      )
    );
  };

  const handleSaveHours = async () => {
    setSaving(true);
    try {
      const hours = workingHours.map((h) => ({
        day_of_week: h.day_of_week,
        open_time: h.open_time,
        close_time: h.close_time,
        is_active: h.is_active,
      }));
      const res = await api.put('/admin/availability/working-hours', { workingHours: hours });
      setWorkingHours(res.data.data);
      success('Working hours updated');
    } catch (err) {
      showError(err.message || 'Failed to save working hours');
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlock = async () => {
    if (!newBlock.date) return showError('Date is required');
    try {
      await api.post('/admin/availability/blocked-periods', {
        date: newBlock.date,
        startTime: newBlock.startTime || null,
        endTime: newBlock.endTime || null,
        reason: newBlock.reason || null,
      });
      success('Period blocked');
      setNewBlock({ date: '', startTime: '', endTime: '', reason: '' });
      await loadData();
    } catch (err) {
      showError(err.message || 'Failed to block period');
    }
  };

  const handleDeleteBlock = async (id) => {
    try {
      await api.delete(`/admin/availability/blocked-periods/${id}`);
      success('Blocked period removed');
      await loadData();
    } catch (err) {
      showError(err.message || 'Failed to remove blocked period');
    }
  };

  if (loading) return <LoadingSpinner text="Loading availability..." />;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="hours">
        <TabsList>
          <TabsTrigger value="hours" className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> Working Hours
          </TabsTrigger>
          <TabsTrigger value="blocked" className="flex items-center gap-2">
            <Ban className="h-4 w-4" /> Blocked Periods
          </TabsTrigger>
        </TabsList>

        {/* Working Hours */}
        <TabsContent value="hours">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Working Hours</CardTitle>
              <Button onClick={handleSaveHours} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workingHours.map((hours) => (
                  <div key={hours.day_of_week} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="w-28">
                      <p className="font-medium text-sm">{DAY_NAMES[hours.day_of_week]}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hours.is_active}
                        onChange={(e) => handleHoursChange(hours.day_of_week, 'is_active', e.target.checked)}
                        className="h-4 w-4 rounded"
                      />
                      <Label className="text-sm">Open</Label>
                    </div>
                    {hours.is_active && (
                      <>
                        <div className="space-y-1">
                          <Label className="text-xs">Open Time</Label>
                          <Input
                            type="time"
                            value={hours.open_time.slice(0, 5)}
                            onChange={(e) => handleHoursChange(hours.day_of_week, 'open_time', e.target.value + ':00')}
                            className="w-32"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Close Time</Label>
                          <Input
                            type="time"
                            value={hours.close_time.slice(0, 5)}
                            onChange={(e) => handleHoursChange(hours.day_of_week, 'close_time', e.target.value + ':00')}
                            className="w-32"
                          />
                        </div>
                      </>
                    )}
                    {!hours.is_active && (
                      <span className="text-sm text-gray-400">Closed</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blocked Periods */}
        <TabsContent value="blocked">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Add Block Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" /> Block a Period
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={newBlock.date}
                    onChange={(e) => setNewBlock({ ...newBlock, date: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time (optional)</Label>
                    <Input
                      type="time"
                      value={newBlock.startTime}
                      onChange={(e) => setNewBlock({ ...newBlock, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time (optional)</Label>
                    <Input
                      type="time"
                      value={newBlock.endTime}
                      onChange={(e) => setNewBlock({ ...newBlock, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Reason (optional)</Label>
                  <Textarea
                    value={newBlock.reason}
                    onChange={(e) => setNewBlock({ ...newBlock, reason: e.target.value })}
                    placeholder="e.g. Holiday, maintenance"
                  />
                </div>
                <Button onClick={handleAddBlock} className="w-full">Block Period</Button>
              </CardContent>
            </Card>

            {/* Blocked Periods List */}
            <Card>
              <CardHeader>
                <CardTitle>Blocked Periods</CardTitle>
              </CardHeader>
              <CardContent>
                {blockedPeriods.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No blocked periods</p>
                ) : (
                  <div className="space-y-2">
                    {blockedPeriods.map((block) => (
                      <div key={block.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium text-sm">{formatDate(block.date)}</p>
                          <p className="text-xs text-gray-500">
                            {block.start_time && block.end_time
                              ? `${block.start_time.slice(0, 5)} - ${block.end_time.slice(0, 5)}`
                              : 'All day'}
                            {block.reason && ` — ${block.reason}`}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteBlock(block.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
