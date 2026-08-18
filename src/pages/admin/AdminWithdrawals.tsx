import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Check, Banknote, X } from 'lucide-react';

interface WithdrawalRequest {
  id: string;
  user_id: string;
  user_name: string | null;
  email: string | null;
  phone: string | null;
  bank: string;
  account_number: string;
  account_name: string;
  amount: number;
  rpc_code_used: string | null;
  status: string;
  admin_note: string | null;
  reviewed_at: string | null;
  created_at: string;
}

type ActionType = 'approved' | 'paid' | 'rejected';

const statusVariant = (status: string) =>
  status === 'paid' ? 'default' : status === 'approved' ? 'outline' : status === 'rejected' ? 'destructive' : 'secondary';

export default function AdminWithdrawals() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<WithdrawalRequest | null>(null);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data || []) as any);
    } catch (error: any) {
      toast.error('Failed to load withdrawal requests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selected || !actionType) return;

    try {
      const adminId = (await supabase.auth.getUser()).data.user!.id;

      const { error } = await supabase
        .from('withdrawal_requests' as any)
        .update({
          status: actionType,
          admin_note: note || null,
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
        } as any)
        .eq('id', selected.id);

      if (error) throw error;

      await supabase.from('audit_logs').insert({
        admin_user_id: adminId,
        action_type: `withdrawal_${actionType}`,
        details: {
          withdrawal_id: selected.id,
          amount: selected.amount,
          rpc_code_used: selected.rpc_code_used,
        },
      });

      toast.success(`Withdrawal marked as ${actionType}`);
      setSelected(null);
      setActionType(null);
      setNote('');
      fetchRequests();
    } catch (error: any) {
      toast.error(error.message || 'Action failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Withdrawal Requests</h1>
        <p className="text-muted-foreground">Review manual payout requests and mark them as paid</p>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Bank details</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Activation code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No withdrawal requests yet
                </TableCell>
              </TableRow>
            )}
            {requests.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.user_name || '—'}</TableCell>
                <TableCell className="text-xs">
                  <div>{r.email}</div>
                  <div className="text-muted-foreground">{r.phone}</div>
                </TableCell>
                <TableCell className="text-xs">
                  <div>{r.bank}</div>
                  <div className="text-muted-foreground">
                    {r.account_number} — {r.account_name}
                  </div>
                </TableCell>
                <TableCell className="font-medium">₦{Number(r.amount).toLocaleString()}</TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{r.rpc_code_used || '—'}</code>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(r.status) as any}>{r.status}</Badge>
                </TableCell>
                <TableCell className="text-xs">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {r.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelected(r);
                            setActionType('approved');
                          }}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelected(r);
                            setActionType('rejected');
                          }}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    {r.status === 'approved' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelected(r);
                          setActionType('paid');
                        }}
                      >
                        <Banknote className="h-4 w-4 mr-1" />
                        Mark paid
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!selected}
        onOpenChange={() => {
          setSelected(null);
          setNote('');
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'paid'
                ? 'Mark as paid'
                : actionType === 'approved'
                  ? 'Approve withdrawal'
                  : 'Reject withdrawal'}
            </DialogTitle>
            <DialogDescription>
              {selected && (
                <>
                  ₦{Number(selected.amount).toLocaleString()} to {selected.account_name} ({selected.bank} ·{' '}
                  {selected.account_number}). Activation code used: {selected.rpc_code_used || '—'}.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="note">Admin note (optional)</Label>
            <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reference or reason" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            <Button variant={actionType === 'rejected' ? 'destructive' : 'default'} onClick={handleAction}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
