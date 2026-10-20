import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Clock, DollarSign } from 'lucide-react';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/services')
      .then((res) => setServices(res.data.data))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading services..." />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Our Services</h1>
        <p className="text-gray-600 mt-2">Browse our beauty services and book an appointment</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold">{service.name}</h3>
                <Badge variant="secondary">{service.duration} min</Badge>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                {service.description || 'Professional beauty service'}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-primary">
                  K{parseFloat(service.price).toFixed(2)}
                </span>
                <Link to={`/dashboard/book?service=${service.id}`}>
                  <Button size="sm">Book Now</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No services available at the moment.</p>
        </div>
      )}
    </div>
  );
}
