import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Clock, DollarSign, ArrowLeft } from 'lucide-react';

export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/services/${id}`)
      .then((res) => setService(res.data.data))
      .catch(() => setService(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!service) return <div className="text-center py-12">Service not found</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/services" className="inline-flex items-center text-sm text-gray-600 hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Services
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{service.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600">{service.description || 'Professional beauty service'}</p>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-400" />
              <span>{service.duration} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <span className="text-xl font-bold text-primary">K{parseFloat(service.price).toFixed(2)}</span>
            </div>
          </div>

          <Link to={`/dashboard/book?service=${service.id}`}>
            <Button size="lg" className="w-full">Book This Service</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
