import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatTime, getStatusBadgeColor } from '../../lib/utils';
import { ArrowLeft, Clock, Calendar, X } from 'lucide-react';

export default function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    loadAppointment();
  }, [id]);

  const loadAppointment = async () => {
    try {
      const res = await api.get(`/appointments/upcoming`);
      const apt = res.data.data.find((a) => a.id === parseInt(id));
      if (!apt) {
        // Try from history
        const histRes = await api.get(`/appointments/history`);
        const histApt = histRes.data.data.find((a) => a.id === parseInt(id));
        setAppointment(histApt || null);
      } else {
        setAppointment(apt);
      }
    } catch {
      setAppointment(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      await api.put(`/appointments/${id}/cancel`);
      success('Appointment cancelled');
      setCancelDialogOpen(false);
      navigate('/dashboard');
    } catch (err) {
      showError(err.message || 'Cancellation failed');
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!appointment) return <div className="text-center py-12">Appointment not found</div>;

  const canCancel = appointment.status === 'booked';
  const appointmentDate = new Date(`${appointment.date}T${appointment.start_time}`);
  const hoursUntil = (appointmentDate - new Date()) / (1000 * 60 * 60);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Appointment Details</CardTitle>
            <Badge className={getStatusBadgeColor(appointment.status)}>
              {appointment.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{formatDate(appointment.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium">
                  {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Service</p>
              <p className="font-medium">{appointment.service?.name}</p>
            </div>
          </div>

          {canCancel && hoursUntil >= 6 && (
            <div className="flex gap-3">
              <Button
                variant="destructive"
                onClick={() => setCancelDialogOpen(true)}
              >
                Cancel Appointment
              </Button>
              <Link to={`/dashboard/book?service=${appointment.service_id}&reschedule=${appointment.id}`}>
                <Button variant="outline">Reschedule</Button>
              </Link>
            </div>
          )}

          {canCancel && hoursUntil < 6 && (
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              This appointment cannot be cancelled — it is less than 6 hours away.
            </p>
          )}
          {appointment.status === 'booked' && hoursUntil < 6 && hoursUntil >= 0 && (
            <Link to={`/dashboard/book?service=${appointment.service_id}&reschedule=${appointment.id}`}>
              <Button variant="outline">Reschedule</Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment?</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your {appointment.service?.name} appointment on{' '}
              {formatDate(appointment.date)}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Appointment
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelLoading}>
              {cancelLoading ? 'Cancelling...' : 'Yes, Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
