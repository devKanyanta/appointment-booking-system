import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatTime, getStatusBadgeColor } from '../../lib/utils';
import { Calendar, Plus, Clock, History } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/appointments/upcoming')
      .then((res) => setAppointments(res.data.data))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading your dashboard..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        <p className="text-gray-600 mt-1">Manage your upcoming appointments</p>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Link to="/dashboard/book">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Book Appointment</p>
                <p className="text-sm text-gray-500">Schedule a new visit</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/dashboard/history">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-3 bg-gray-100 rounded-lg">
                <History className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="font-semibold">View History</p>
                <p className="text-sm text-gray-500">Past appointments</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/services">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold">Browse Services</p>
                <p className="text-sm text-gray-500">Explore offerings</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No upcoming appointments</p>
              <Link to="/dashboard/book">
                <Button>Book Your First Appointment</Button>
              </Link>
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
