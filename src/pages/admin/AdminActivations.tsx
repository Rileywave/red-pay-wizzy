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
import { Check, Copy, X, Eye } from 'lucide-react';

interface ActivationRequest {
  id: string;
  auth_user_id: string | null;
  user_id: string;
  user_name: string | null;
  email: string | null;
  phone: string | null;
  rpc_code_used: string | null;
  bank: string | null;
  account_number: string | null;
  amount: number;
  proof_image: string | null;
  status: string;
  admin_note: string | null;
  reviewed_at: string | null;
  created_at: string;
}

type ActionType = 'confirmed' | 'rejected';

const statusVariant = (status: string) =>
  status === 'confirmed' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary';

export default function AdminActivations() {
  const [requests, setRequests] = useState<ActivationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ActivationRequest | null>(null);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('activation_requests' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRequests((data || []) as any);
    } catch (error) {
      toast.error('Failed to load activation requests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const viewProof = async (path: string | null) => {
    if (!path) {
      toast.error('No proof uploaded for this request');
      return;
    }
    const { data, error } = await supabase.storage.from('payment-proofs').createSignedUrl(path, 300);
    if (error || !data) {
      toast.error('Could not open proof image');
      return;
    }
    window.open(data.signedUrl, '_blank');
  };

  const handleAction = async () => {
    if (!selected || !actionType) return;

    try {
      const adminId = (await supabase.auth.getUser()).data.user!.id;

      const { error } = await supabase
        .from('activation_requests' as any)
        .update({
          status: actionType,
          admin_note: note || null,
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
        } as any)
        .eq('id', selected.id);
      if (error) throw error;

      if (actionType === 'confirmed') {
        const { error: userErr } = await supabase
          .from('users')
          .update({ activated: true, activated_at: new Date().toISOString() } as any)
          .eq('user_id', selected.user_id);
        if (userErr) throw userErr;
      }

      await supabase.from('audit_logs').insert({
        admin_user_id: adminId,
        action_type: `activation_${actionType}`,
        details: {
          activation_id: selected.id,
          user_id: selected.user_id,
          amount: selected.amount,
          rpc_code_used: selected.rpc_code_used,
        },
      });

      toast.success(`Activation ${actionType}`);
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
        <h1 className="text-3xl font-bold">Activation Requests</h1>
        <p className="text-muted-foreground">Confirm ₦14,900 activation payments made after RPC confirmation</p>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Activation code used</TableHead>
              <TableHead>Payout account</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Proof</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  No activation requests yet
                </TableCell>
              </TableRow>
            )}
            {requests.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <div>{r.user_name || '—'}</div>
                  <div className="text-xs text-muted-foreground font-mono">{r.user_id}</div>
                </TableCell>
                <TableCell className="text-xs">
                  <div>{r.email}</div>
                  <div className="text-muted-foreground">{r.phone}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <code className="text-xs bg-muted px-2 py-1 rounded">{r.rpc_code_used || '—'}</code>
                    {r.rpc_code_used && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(r.rpc_code_used!);
                          toast.success('Code copied');
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-xs">
                  <div>{r.bank || '—'}</div>
                  <div className="text-muted-foreground font-mono">{r.account_number}</div>
                </TableCell>
                <TableCell className="font-medium">₦{Number(r.amount).toLocaleString()}</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" onClick={() => viewProof(r.proof_image)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(r.status) as any}>{r.status}</Badge>
                </TableCell>
                <TableCell className="text-xs">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  {r.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelected(r);
                          setActionType('confirmed');
                        }}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Confirm
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
                    </div>
                  )}
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
            <DialogTitle>{actionType === 'confirmed' ? 'Confirm activation' : 'Reject activation'}</DialogTitle>
            <DialogDescription>
              {selected && (
                <>
                  ₦{Number(selected.amount).toLocaleString()} activation for {selected.user_name} ({selected.user_id}).
                  Activation code used: {selected.rpc_code_used || '—'}.
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
