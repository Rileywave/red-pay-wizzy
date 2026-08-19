import { useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LiquidBackground from "@/components/LiquidBackground";
import Logo from "@/components/Logo";
import ProfileButton from "@/components/ProfileButton";
import LoadingSpinner from "@/components/LoadingSpinner";
import { DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// The valid RPC code is the one issued to this user once an admin confirms their payment.


const withdrawSchema = z.object({
  accountNumber: z.string().trim()
    .regex(/^[0-9]{10}$/, 'Account number must be 10 digits'),
  accountName: z.string().trim()
    .min(3, 'Name must be at least 3 characters').max(100, 'Name too long')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  bank: z.string().min(1, 'Please select a bank'),
  amount: z.string().trim()
    .regex(/^[0-9]+$/, 'Amount must be a number')
    .refine((val) => parseInt(val) >= 1000, 'Minimum withdrawal is ₦1,000')
    .refine((val) => parseInt(val) <= 10000000, 'Maximum withdrawal is ₦10,000,000'),
  accessCode: z.string().trim().min(1, 'Access code is required')
});

const Withdraw = () => {
  const navigate = useNavigate();
  const { profile, user, loading: authLoading, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    accountNumber: "",
    accountName: "",
    bank: "",
    amount: "",
    accessCode: "",
  });
  const [loading, setLoading] = useState(false);

  const banks = [
    "Access Bank", "GTBank", "First Bank", "UBA", "Zenith Bank",
    "Stanbic IBTC", "Fidelity Bank", "Union Bank", "Sterling Bank",
    "Wema Bank", "Moniepoint", "Opay", "Kuda", "Palmpay"
  ];

  const handleWithdraw = async () => {
    if (!profile) {
      toast.error("Please log in to continue");
      return;
    }

    // Withdrawal is only unlocked once an admin confirms the RPC payment
    if (!profile.rpc_purchased || !profile.rpc_code) {
      toast.error("Your RPC payment is not confirmed yet. Please buy and wait for admin confirmation.");
      navigate("/buyrpc");
      return;
    }

    // Validate form data with Zod
    const validation = withdrawSchema.safeParse(formData);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    // Validate access code against the code issued to this user
    if (formData.accessCode !== profile.rpc_code.toUpperCase()) {
      toast.error("Invalid RPC Code. Please enter the code issued after your payment was confirmed.");
      return;
    }


    const withdrawAmount = parseInt(formData.amount);

    // Check balance
    if (withdrawAmount > (profile.balance || 0)) {
      toast.error("Insufficient balance");
      return;
    }

    // Log the request so admins can process the payout manually
    setLoading(true);
    const { error } = await supabase.from("withdrawal_requests" as any).insert({
      user_id: user?.id,
      user_name: `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim(),
      email: profile.email,
      phone: profile.phone,
      bank: formData.bank,
      account_number: formData.accountNumber,
      account_name: formData.accountName,
      amount: withdrawAmount,
      rpc_code_used: profile.rpc_code,
    } as any);
    setLoading(false);

    if (error) {
      toast.error("Could not submit your withdrawal request. Please try again.");
      return;
    }

    // Debit the wallet and record the transaction
    const balanceBefore = profile.balance || 0;
    const balanceAfter = balanceBefore - withdrawAmount;

    await supabase.from("users").update({ balance: balanceAfter }).eq("user_id", profile.user_id);
    await supabase.from("transactions").insert({
      transaction_id: `WD-${Date.now()}`,
      user_id: profile.user_id,
      type: "debit",
      title: "Withdrawal Request",
      amount: withdrawAmount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      meta: { bank: formData.bank, account_number: formData.accountNumber },
    } as any);

    await refreshProfile();

    navigate(`/success?type=withdraw&amount=${withdrawAmount.toLocaleString()}`);
  };



  if (loading) {
    return (
      <div className="min-h-screen w-full relative flex items-center justify-center">
        <LiquidBackground />
        <div className="relative z-10">
          <LoadingSpinner message="Processing Withdrawal" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen w-full relative flex items-center justify-center px-4">
        <LiquidBackground />
        <div className="relative z-10 text-center space-y-4">
          {authLoading ? (
            <LoadingSpinner message="Loading your account" />
          ) : !user ? (
            <>
              <p className="text-foreground">Please log in to withdraw.</p>
              <Button onClick={() => navigate("/auth")}>Log in</Button>
            </>
          ) : (
            <>
              <p className="text-foreground">We couldn't load your profile.</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative">
      <LiquidBackground />

      <header className="relative z-10 px-3 py-2 flex items-center justify-between border-b border-border/20 bg-card/30 backdrop-blur-sm">
        <Logo />
        <ProfileButton />
      </header>

      <main className="relative z-10 px-3 py-4 max-w-4xl mx-auto space-y-4">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Withdraw Funds</h1>
          <p className="text-sm text-muted-foreground">Transfer money to your bank account</p>
        </div>

        <Card className="bg-card/60 backdrop-blur-sm border-border animate-fade-in float-element-slow">
          <CardContent className="p-4 space-y-4">
            {/* Balance Display */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Available Balance</p>
              <p className="text-2xl font-bold text-primary">₦{(profile?.balance || 0).toLocaleString()}</p>
            </div>

            {/* Issued RPC code — shown after admin approval */}
            {profile?.rpc_purchased && profile?.rpc_code && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Your RPC Code</p>
                  <p className="text-base font-bold font-mono text-primary tracking-wider">{profile.rpc_code}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setFormData({ ...formData, accessCode: profile.rpc_code!.toUpperCase() })}
                >
                  Use code
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {/* User ID (Fixed) */}
              <div className="space-y-1">
                <Label htmlFor="userId" className="text-xs">User ID</Label>
                <Input
                  id="userId"
                  value={profile?.user_id || ''}
                  disabled
                  className="h-9 bg-secondary/20"
                />
              </div>

              {/* Account Number */}
              <div className="space-y-1">
                <Label htmlFor="accountNumber" className="text-xs">Account Number</Label>
                <Input
                  id="accountNumber"
                  type="tel"
                  placeholder="1234567890"
                  maxLength={10}
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="h-9"
                />
              </div>

              {/* Account Name */}
              <div className="space-y-1">
                <Label htmlFor="accountName" className="text-xs">Account Name</Label>
                <Input
                  id="accountName"
                  placeholder="John Doe"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  className="h-9"
                />
              </div>

              {/* Bank Selection */}
              <div className="space-y-1">
                <Label htmlFor="bank" className="text-xs">Select Bank</Label>
                <Select value={formData.bank} onValueChange={(value) => setFormData({ ...formData, bank: value })}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Choose bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map((bank) => (
                      <SelectItem key={bank} value={bank}>
                        {bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <Label htmlFor="amount" className="text-xs">Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="5000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="h-9"
                />
                <p className="text-xs text-muted-foreground">Minimum: ₦1,000</p>
              </div>

              {/* Access Code */}
              <div className="space-y-1">
                <Label htmlFor="accessCode" className="text-xs">Enter RPC Code</Label>
                <Input
                  id="accessCode"
                  type="password"
                  placeholder="••••••••"
                  value={formData.accessCode}
                  onChange={(e) => setFormData({ ...formData, accessCode: e.target.value.toUpperCase() })}
                  className="h-9"
                />
                <p className="text-xs text-destructive">⚠️ Access code is required for withdrawal</p>
              </div>
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/10 p-3">
              <p className="text-xs text-muted-foreground">
                Activate account- Buy Rpc code to withdraw.
              </p>
            </div>

            <Button onClick={handleWithdraw} className="w-full" size="lg">
              <DollarSign className="w-4 h-4 mr-2" />
              Withdraw Funds
            </Button>

          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Withdraw;