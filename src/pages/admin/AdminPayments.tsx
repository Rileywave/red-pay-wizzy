import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Check, X, ExternalLink } from 'lucide-react';

interface Payment {
  id: string;
  user_id: string;
  user_name: string;
  email: string;
  phone: string;
  proof_image: string | null;
  verified: boolean;
  status: string | null;
  rpc_code_issued: string | null;
  created_at: string;
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [proofLoading, setProofLoading] = useState(false);

  const openProof = async (payment: Payment) => {
    const raw = payment.proof_image;
    if (!raw) return;
    if (raw.startsWith('http')) {
      setProofUrl(raw);
      return;
    }
    setProofLoading(true);
    const { data, error } = await supabase.storage
      .from('payment-proofs')
      .createSignedUrl(raw, 600);
    setProofLoading(false);
    if (error || !data?.signedUrl) {
      toast.error(error?.message || 'Could not open proof');
      return;
    }
    setProofUrl(data.signedUrl);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('rpc_purchases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments((data || []) as any);
    } catch (error: any) {
      toast.error('Failed to load payments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedPayment || !actionType || submitting) return;
    setSubmitting(true);

    try {
      if (actionType === 'approve') {
        // Generate a unique RPC code for this user
        const rpcCode = `RPC${Math.floor(1000000 + Math.random() * 9000000)}`;

        // Update payment
        const { data: updated, error: updateError } = await supabase
          .from('rpc_purchases')
          .update({
            verified: true,
            status: 'approved',
            rpc_code_issued: rpcCode,
          } as any)
          .eq('id', selectedPayment.id)
          .select('id');

        if (updateError) throw updateError;
        if (!updated?.length) throw new Error('Update blocked — admin permissions missing');


        // Update user's rpc_purchased status
        const { error: userError } = await supabase
          .from('users')
          .update({ 
            rpc_purchased: true,
            rpc_code: rpcCode
          })
          .eq('user_id', selectedPayment.user_id);

        if (userError) throw userError;

        // Check if this user was referred and trigger referral confirmation
        const { data: referralData } = await supabase
          .from('referrals')
          .select('*')
          .eq('new_user_id', selectedPayment.user_id)
          .eq('status', 'pending')
          .maybeSingle();

        if (referralData) {
          await supabase.rpc('confirm_referral', {
            _new_user_id: selectedPayment.user_id,
            _amount: referralData.amount_given ?? 5000,
          });
        }

        // Log action
        await supabase
          .from('audit_logs')
          .insert({
            admin_user_id: (await supabase.auth.getUser()).data.user!.id,
            action_type: 'payment_approved',
            details: { payment_id: selectedPayment.id, rpc_code: rpcCode },
          });

        toast.success('Payment approved successfully');
      } else {
        // Reject payment
        const { data: rejected, error } = await supabase
          .from('rpc_purchases')
          .update({ verified: false, status: 'rejected' } as any)
          .eq('id', selectedPayment.id)
          .select('id');

        if (error) throw error;
        if (!rejected?.length) throw new Error('Update blocked — admin permissions missing');


        await supabase
          .from('audit_logs')
          .insert({
            admin_user_id: (await supabase.auth.getUser()).data.user!.id,
            action_type: 'payment_rejected',
            details: { payment_id: selectedPayment.id },
          });

        toast.success('Payment rejected');
      }

      setSelectedPayment(null);
      setActionType(null);
      fetchPayments();
    } catch (error: any) {
      toast.error(error.message || 'Action failed');
    } finally {
      setSubmitting(false);
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
        <h1 className="text-3xl font-bold">Payment Verification</h1>
        <p className="text-muted-foreground">Review and approve RPC purchases</p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Activation code</TableHead>
              <TableHead>Proof</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.user_name}</TableCell>
                <TableCell>{payment.email}</TableCell>
                <TableCell>{payment.phone}</TableCell>
                <TableCell>
                  {(() => {
                    const status = payment.status ?? (payment.verified ? 'approved' : 'pending');
                    return (
                      <Badge
                        variant={
                          status === 'approved' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary'
                        }
                      >
                        {status === 'approved' ? 'Verified' : status === 'rejected' ? 'Rejected' : 'Pending'}
                      </Badge>
                    );
                  })()}
                </TableCell>
                <TableCell>
                  {payment.rpc_code_issued ? (
                    <button
                      type="button"
                      className="text-xs bg-muted px-2 py-1 rounded font-mono hover:bg-muted/70"
                      title="Click to copy"
                      onClick={() => {
                        navigator.clipboard.writeText(payment.rpc_code_issued!);
                        toast.success('Activation code copied');
                      }}
                    >
                      {payment.rpc_code_issued}
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {payment.proof_image ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={proofLoading}
                      onClick={() => openProof(payment)}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">No proof</span>
                  )}
                </TableCell>

                <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  {(payment.status ?? (payment.verified ? 'approved' : 'pending')) === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setActionType('approve');
                        }}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setActionType('reject');
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

      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Payment' : 'Reject Payment'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? `Approve payment from ${selectedPayment?.user_name}? This will generate an RPC code and trigger referral bonus if applicable.`
                : `Reject payment from ${selectedPayment?.user_name}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPayment(null)}>Cancel</Button>
            <Button 
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              onClick={handleAction}
              disabled={submitting}
            >
              {submitting ? 'Working…' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!proofUrl} onOpenChange={(open) => !open && setProofUrl(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Proof</DialogTitle>
            <DialogDescription>Screenshot uploaded by the user.</DialogDescription>
          </DialogHeader>
          {proofUrl && (
            <img src={proofUrl} alt="Payment proof" className="w-full rounded-lg" />
          )}
          <DialogFooter>
            {proofUrl && (
              <a href={proofUrl} target="_blank" rel="noreferrer" className="text-sm underline">
                Open full size
              </a>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
