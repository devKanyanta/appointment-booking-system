import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatTime, getStatusBadgeColor } from '../../lib/utils';
import { History } from 'lucide-react';

export default function BookingHistory() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/appointments/history')
      .then((res) => setAppointments(res.data.data))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading history..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointment History</h1>
      <p className="text-gray-600 mb-8">View your past and cancelled appointments</p>

      <Card>
        <CardContent className="pt-6">
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No appointment history yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <Link
                  key={apt.id}
                  to={`/dashboard/appointments/${apt.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{apt.service?.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(apt.date)} • {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                    </p>
                  </div>
                  <Badge className={getStatusBadgeColor(apt.status)}>
                    {apt.status}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
