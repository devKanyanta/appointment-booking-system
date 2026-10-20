import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatTime, getStatusBadgeColor } from '../../lib/utils';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const { success, error: showError } = useToast();

  useEffect(() => {
    loadAppointments();
  }, [statusFilter]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await api.get(`/admin/appointments${params}`);
      setAppointments(res.data.data);
    } catch {
      showError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    try {
      await api.put(`/admin/appointments/${selectedAppointment.id}/status`, {
        status: newStatus,
      });
      success('Status updated');
      setStatusDialogOpen(false);
      loadAppointments();
    } catch (err) {
      showError(err.message || 'Failed to update status');
    }
  };

  const calendarEvents = appointments.map((apt) => ({
    id: apt.id,
    title: `${apt.customer?.name || 'Unknown'} - ${apt.service?.name || 'Service'}`,
    start: `${apt.date}T${apt.start_time}`,
    end: `${apt.date}T${apt.end_time}`,
    backgroundColor: apt.status === 'booked' ? '#4f46e5'
      : apt.status === 'completed' ? '#059669'
      : apt.status === 'cancelled' ? '#dc2626'
      : '#ca8a04',
  }));

  return (
    <div className="space-y-6">
      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar">
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <LoadingSpinner />
              ) : (
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                  }}
                  events={calendarEvents}
                  height="auto"
                  eventClick={(info) => {
                    const apt = appointments.find((a) => a.id === parseInt(info.event.id));
                    if (apt) {
                      setSelectedAppointment(apt);
                      setNewStatus(apt.status);
                      setStatusDialogOpen(true);
                    }
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Appointments</CardTitle>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No-Show</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {loading ? (
                <LoadingSpinner />
              ) : appointments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No appointments found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((apt) => (
                      <TableRow key={apt.id}>
                        <TableCell>{apt.customer?.name || 'Unknown'}</TableCell>
                        <TableCell>{apt.service?.name || 'Unknown'}</TableCell>
                        <TableCell>{formatDate(apt.date)}</TableCell>
                        <TableCell>{formatTime(apt.start_time)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(apt.status)}>
                            {apt.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setNewStatus(apt.status);
                              setStatusDialogOpen(true);
                            }}
                          >
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Appointment Status</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="text-sm">
                <p><strong>Customer:</strong> {selectedAppointment.customer?.name}</p>
                <p><strong>Service:</strong> {selectedAppointment.service?.name}</p>
                <p><strong>Date:</strong> {formatDate(selectedAppointment.date)}</p>
                <p><strong>Time:</strong> {formatTime(selectedAppointment.start_time)}</p>
              </div>
              <div>
                <label className="text-sm font-medium">New Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="booked">Booked</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no-show">No-Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusChange}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
