import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/dialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatTime, getStatusBadgeColor } from '../../lib/utils';
import { Users, Search, Eye, Trash2 } from 'lucide-react';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { success, error: showError } = useToast();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const res = await api.get('/admin/customers');
      setCustomers(res.data.customers);
    } catch {
      showError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const viewCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setDetailLoading(true);
    try {
      const res = await api.get(`/admin/customers/${customer.id}`);
      setCustomerDetail(res.data);
    } catch {
      showError('Failed to load customer details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAnonymize = async () => {
    try {
      await api.delete(`/admin/customers/${selectedCustomer.id}`);
      success('Customer data anonymized');
      setDeleteDialogOpen(false);
      setSelectedCustomer(null);
      setCustomerDetail(null);
      loadCustomers();
    } catch (err) {
      showError(err.message || 'Failed to anonymize customer');
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner text="Loading customers..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" /> Customers ({customers.length})
        </h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={customer.is_active ? 'default' : 'secondary'}>
                      {customer.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(customer.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => viewCustomer(customer)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Customer Detail Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => { setSelectedCustomer(null); setCustomerDetail(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <LoadingSpinner text="Loading details..." />
          ) : customerDetail ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-medium">{customerDetail.customer.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{customerDetail.customer.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium">{customerDetail.customer.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Joined</p>
                  <p className="font-medium">{new Date(customerDetail.customer.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Appointment History ({customerDetail.appointments.length})</h4>
                {customerDetail.appointments.length === 0 ? (
                  <p className="text-sm text-gray-500">No appointments</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {customerDetail.appointments.map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between p-2 rounded border text-sm">
                        <div>
                          <p>{apt.service?.name} — {formatDate(apt.date)}</p>
                          <p className="text-xs text-gray-500">{formatTime(apt.start_time)}</p>
                        </div>
                        <Badge className={getStatusBadgeColor(apt.status)}>{apt.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Anonymize Data
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anonymize Customer Data?</DialogTitle>
            <DialogDescription>
              This will replace the customer's name, email, and phone with anonymized data.
              Their appointment history will be preserved but linked to the anonymized record.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleAnonymize}>Yes, Anonymize</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
