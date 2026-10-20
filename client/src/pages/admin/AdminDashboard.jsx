import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Users,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((res) => setStats(res.data.stats))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (!stats) return <p>Failed to load dashboard stats</p>;

  const statCards = [
    { label: 'Upcoming', value: stats.upcomingCount, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Completed', value: stats.completedCount, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Cancelled', value: stats.cancelledCount, icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
    { label: 'No-Shows', value: stats.noShowCount, icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Appointments</span>
              <span className="font-semibold">{stats.totalAppointments}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Weekly Bookings</span>
              <span className="font-semibold">{stats.weeklyBookings}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">No-Show Rate</span>
              <span className="font-semibold">{stats.noShowRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Popular Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.popularServices.length === 0 ? (
              <p className="text-gray-500 text-sm">No data yet</p>
            ) : (
              <div className="space-y-3">
                {stats.popularServices.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm">{item.service?.name || 'Unknown'}</span>
                    <span className="text-sm font-medium">{item.count ?? item.dataValues?.count ?? 0} bookings</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
