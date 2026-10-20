import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatTime, formatCurrency } from '../../lib/utils';
import { Check, ArrowLeft, Clock } from 'lucide-react';

export default function BookAppointment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const rescheduleId = searchParams.get('reschedule');
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);

  // Load services
  useEffect(() => {
    api.get('/services')
      .then((res) => {
        setServices(res.data.data);
        const preselected = searchParams.get('service');
        if (preselected) {
          const svc = res.data.data.find((s) => s.id === parseInt(preselected, 10));
          if (svc) {
            setSelectedService(svc);
            setStep(2);
          }
        }
      })
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  // Load available slots when date is selected
  useEffect(() => {
    if (selectedDate && selectedService) {
      let cancelled = false;
      setAvailableSlots([]);
      setSelectedSlot(null);
      setLoadingSlots(true);
      api.get(`/availability?date=${selectedDate}&serviceId=${selectedService.id}`)
        .then((res) => {
          if (!cancelled) setAvailableSlots(res.data.data.map((slot) => ({ startTime: slot.start_time, endTime: slot.end_time })));
        })
        .catch(() => { if (!cancelled) setAvailableSlots([]); })
        .finally(() => { if (!cancelled) setLoadingSlots(false); });
      return () => { cancelled = true; };
    }
  }, [selectedDate, selectedService]);

  const handleSelectService = (service) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setStep(3);
  };

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setStep(4);
  };

  const handleConfirm = async () => {
    setBooking(true);
    try {
      if (rescheduleId) {
        await api.put(`/appointments/${rescheduleId}/reschedule`, {
          date: selectedDate,
          startTime: selectedSlot.startTime,
        });
      } else {
        await api.post('/appointments', {
          serviceId: selectedService.id,
          date: selectedDate,
          startTime: selectedSlot.startTime,
        });
      }
      success(rescheduleId ? 'Appointment rescheduled successfully!' : 'Appointment booked successfully!');
      navigate(rescheduleId ? `/dashboard/appointments/${rescheduleId}` : '/dashboard');
    } catch (err) {
      showError(err.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };  // Generate next 60 days
  const today = new Date();
  const maxDate = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
  const dates = [];
  let d = new Date(today);
  while (d <= maxDate) {
    dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }

  if (loading) return <LoadingSpinner text="Loading services..." />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step > s ? <Check className="h-4 w-4" /> : s}
            </div>
            {s < 4 && <div className={`w-12 h-0.5 ${step > s ? 'bg-primary' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <h1 className="text-2xl font-bold text-center mb-6">
        {step === 1 && 'Select a Service'}
        {step === 2 && 'Pick a Date'}
        {step === 3 && 'Choose a Time'}
        {step === 4 && 'Confirm Booking'}
      </h1>

      {/* Step 1: Select Service */}
      {step === 1 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {services.map((service) => (
            <Card
              key={service.id}
              className="cursor-pointer hover:shadow-md transition-shadow hover:border-primary"
              onClick={() => handleSelectService(service)}
            >
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg">{service.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                <div className="flex justify-between items-center mt-3">
                  <Badge variant="secondary">{service.duration} min</Badge>
                  <span className="font-bold text-primary">{formatCurrency(service.price)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {services.length === 0 && <p className="col-span-full text-center text-gray-500">No services are available right now.</p>}
        </div>
      )}

      {/* Step 2: Select Date */}
      {step === 2 && (
        <div>
          {rescheduleId ? (
            <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/appointments/${rescheduleId}`)} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to appointment
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" /> Change service
            </Button>
          )}
          <p className="text-sm text-gray-500 mb-4">
            Selected: <strong>{selectedService?.name}</strong> ({selectedService?.duration} min)
          </p>
          <div className="grid grid-cols-7 gap-2">
            {dates.map((date) => {
              const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
              const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
              const isToday = dateStr === todayStr;
              return (
                <button
                  key={dateStr}
                  disabled={dateStr < todayStr}
                  onClick={() => handleDateSelect(dateStr)}
                  className={`p-2 rounded-lg text-sm text-center transition-colors ${
                    selectedDate === dateStr
                      ? 'bg-primary text-white'
                      : 'bg-white border hover:bg-primary/5 hover:border-primary'
                  } ${isToday ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                >
                  <div className="text-xs text-gray-500">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="font-medium">{date.getDate()}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Select Time */}
      {step === 3 && (
        <div>
          <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Change date
          </Button>
          <p className="text-sm text-gray-500 mb-4">
            <strong>{selectedService?.name}</strong> on <strong>{formatDate(selectedDate)}</strong>
          </p>

          {loadingSlots ? (
            <LoadingSpinner text="Checking availability..." />
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No available slots for this date.</p>
              <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="mt-2">
                Try another date
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {availableSlots.map((slot) => (
                <button
                  key={slot.startTime}
                  onClick={() => handleSelectSlot(slot)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    selectedSlot?.startTime === slot.startTime
                      ? 'bg-primary text-white'
                      : 'bg-white hover:bg-primary/5 hover:border-primary'
                  }`}
                >
                  {formatTime(slot.startTime)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <div>
          <Button variant="ghost" size="sm" onClick={() => setStep(3)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Change time
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service</span>
                  <span className="font-medium">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium">{formatDate(selectedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time</span>
                  <span className="font-medium">
                    {formatTime(selectedSlot?.startTime)} - {formatTime(selectedSlot?.endTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{selectedService?.duration} minutes</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary">{formatCurrency(selectedService?.price)}</span>
                </div>
              </div>

              <Button
                onClick={handleConfirm}
                className="w-full"
                size="lg"
                disabled={booking}
              >
                {booking ? (rescheduleId ? 'Rescheduling...' : 'Booking...') : (rescheduleId ? 'Confirm Reschedule' : 'Confirm Booking')}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
