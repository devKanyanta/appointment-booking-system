import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Clock, Calendar, Shield, Smartphone, ArrowRight } from 'lucide-react';

export default function Home() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    api.get('/services')
      .then((res) => setServices(res.data.data.slice(0, 4)))
      .catch(() => setServices([]));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-white to-primary/10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Book Your <span className="text-primary">Beauty Appointment</span> Online
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Easy, fast, and convenient. Browse our services, pick a time that works for you, and
            book in seconds — no phone calls needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/services">
              <Button size="lg" className="text-base px-8">
                Browse Services <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg" className="text-base px-8">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Why Kairos Schedule?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Calendar, title: 'Easy Booking', desc: 'Select a service, pick a date, choose a time — done in seconds.' },
              { icon: Clock, title: 'Real-Time Availability', desc: 'See available slots instantly, no guessing or waiting.' },
              { icon: Smartphone, title: 'Works on Mobile', desc: 'Book from your phone, tablet, or computer — wherever you are.' },
            ].map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardContent className="pt-6">
                  <feature.icon className="h-12 w-12 mx-auto text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      {services.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Our Services</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service) => (
                <Card key={service.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">{service.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{service.description || 'Professional beauty service'}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">{service.duration} min</span>
                      <span className="font-semibold text-primary">K{parseFloat(service.price).toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/services">
                <Button variant="outline">View All Services</Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
