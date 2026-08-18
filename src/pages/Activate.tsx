import { useEffect, useState } from "react";
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
import { Check, Clock, Copy, ShieldCheck, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const ACTIVATION_AMOUNT = 14900;
const ACCOUNT_NUMBER = "2043201022";
const ACCOUNT_NAME = "Uzombah Wisdom";
const BANK = "kuda";

const banks = [
  "Moniepoint MFB", "Opay", "PalmPay", "Kuda Bank", "Access Bank", "GTBank",
  "First Bank", "UBA", "Zenith Bank", "Fidelity Bank", "Union Bank",
  "Stanbic IBTC", "Sterling Bank", "Wema Bank", "Polaris Bank", "Ecobank",
  "FCMB", "Unity Bank", "Keystone Bank", "Jaiz Bank", "VFD MFB", "Sparkle", "Carbon",
];

type Step = "welcome" | "processing" | "form" | "payment" | "pending";

const Activate = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const [step, setStep] = useState<Step>("welcome");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [timeLeft, setTimeLeft] = useState(480);
  const [existing, setExisting] = useState<any>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    rpcCode: "",
    accountNumber: "",
    bank: "",
  });

  // Prefill from profile
  useEffect(() => {
    if (!profile) return;
    setFormData((prev) => ({
      ...prev,
      fullName: prev.fullName || `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim(),
      email: prev.email || profile.email || "",
      phone: prev.phone || profile.phone || "",
    }));
  }, [profile]);

  // Existing request?
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("activation_requests" as any)
        .select("*")
        .eq("auth_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
      const row = (data || [])[0];
      if (row) {
        setExisting(row);
        if ((row as any).status === "pending") setStep("pending");
      }
    })();
  }, [user]);

  // Processing step auto-advance
  useEffect(() => {
    if (step !== "processing") return;
    const t = setTimeout(() => setStep("form"), 3000);
    return () => clearTimeout(t);
  }, [step]);

  // Payment countdown
  useEffect(() => {
    if (step !== "payment") return;
    setTimeLeft(480);
    const i = setInterval(() => setTimeLeft((p) => (p <= 1 ? 0 : p - 1)), 1000);
    return () => clearInterval(i);
  }, [step]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPG, PNG, and WEBP images allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
      return;
    }
    setProof(file);
    toast.success("Proof uploaded");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { fullName, email, phone, rpcCode, accountNumber, bank } = formData;
    if (!fullName || !email || !phone || !rpcCode || !accountNumber || !bank) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!/^[0-9]{10}$/.test(accountNumber)) {
      toast.error("Account number must be 10 digits");
      return;
    }
    if (profile?.rpc_code && rpcCode.trim().toUpperCase() !== profile.rpc_code.toUpperCase()) {
      toast.error("Invalid RPC code. Enter the code issued after your payment was confirmed.");
      return;
    }
    setStep("payment");
  };

  const handleSubmitPayment = async () => {
    if (!proof) {
      toast.error("Please upload your payment proof");
      return;
    }
    if (!user || !profile) {
      toast.error("Please log in to continue");
      return;
    }

    setSubmitting(true);
    let proofPath: string | null = null;
    try {
      const ext = proof.name.split(".").pop();
      const path = `${user.id}/activation-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("payment-proofs").upload(path, proof);
      if (upErr) throw upErr;
      proofPath = path;
    } catch {
      // proof upload is best-effort; the request is still queued for the admin
    }

    const { error } = await supabase.from("activation_requests" as any).insert({
      auth_user_id: user.id,
      user_id: profile.user_id,
      user_name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      rpc_code_used: formData.rpcCode.trim().toUpperCase(),
      bank: formData.bank,
      account_number: formData.accountNumber,
      amount: ACTIVATION_AMOUNT,
      proof_image: proofPath,
    } as any);

    setSubmitting(false);

    if (error) {
      toast.error("Could not submit your activation request. Please try again.");
      return;
    }

    toast.success("Activation request submitted — awaiting admin confirmation.");
    setStep("pending");
  };

  const gateBlocked = profile && (!profile.rpc_purchased || !profile.rpc_code);

  if (submitting) {
    return (
      <div className="min-h-screen w-full relative flex items-center justify-center">
        <LiquidBackground />
        <div className="relative z-10">
          <LoadingSpinner message="Submitting Activation" />
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

      <main className="relative z-10 px-3 py-6 max-w-2xl mx-auto space-y-4">
        {gateBlocked ? (
          <Card className="bg-card/60 backdrop-blur-sm border-border">
            <CardContent className="p-6 text-center space-y-4">
              <h1 className="text-2xl font-bold text-foreground">RPC Confirmation Required</h1>
              <p className="text-sm text-muted-foreground">
                Buy your RPC code and wait for admin confirmation before activating your account.
              </p>
              <Button className="w-full" size="lg" onClick={() => navigate("/buyrpc")}>
                Buy RPC
              </Button>
            </CardContent>
          </Card>
        ) : profile?.activated ? (
          <Card className="bg-card/60 backdrop-blur-sm border-border">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8 text-success" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Account Activated</h1>
              <p className="text-sm text-muted-foreground">
                Your account is activated. You can now request a withdrawal.
              </p>
              <Button className="w-full" size="lg" onClick={() => navigate("/withdraw")}>
                Continue to Withdraw
              </Button>
            </CardContent>
          </Card>
        ) : step === "welcome" ? (
          <Card className="bg-card/60 backdrop-blur-sm border-border animate-fade-in">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-primary/15 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">RedPay Validation</h1>
                <p className="text-muted-foreground">
                  Activate your account to unlock withdrawals. Activation fee: ₦{ACTIVATION_AMOUNT.toLocaleString()}.
                </p>
              </div>
              <Button className="w-full h-14 text-lg" onClick={() => setStep("processing")}>
                Begin
              </Button>
            </CardContent>
          </Card>
        ) : step === "processing" ? (
          <div className="py-20">
            <LoadingSpinner message="Processing your information" />
          </div>
        ) : step === "form" ? (
          <Card className="bg-card/60 backdrop-blur-sm border-border animate-fade-in">
            <CardContent className="p-6">
              <div className="mb-6 text-center space-y-1">
                <h1 className="text-2xl font-bold text-foreground">RedPay Validation</h1>
                <p className="text-sm text-muted-foreground">
                  Activate your RedPay account to complete validation.
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="userId">User ID</Label>
                  <Input id="userId" value={profile?.user_id || ""} disabled className="font-mono bg-secondary/20" />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="rpcCode">RPC Code</Label>
                  <Input
                    id="rpcCode"
                    value={formData.rpcCode}
                    onChange={(e) => setFormData({ ...formData, rpcCode: e.target.value })}
                    placeholder="Enter your RPC code"
                    className="font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })
                    }
                    placeholder="Enter your account number"
                    className="font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="bank">Select Bank</Label>
                  <Select value={formData.bank} onValueChange={(v) => setFormData({ ...formData, bank: v })}>
                    <SelectTrigger id="bank">
                      <SelectValue placeholder="Choose your bank" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {banks.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" size="lg" className="w-full">
                  Continue
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : step === "payment" ? (
          <Card className="bg-card/60 backdrop-blur-sm border-border animate-fade-in">
            <CardContent className="p-6 space-y-4">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Activation Payment</h1>
                <p className="text-sm text-muted-foreground">Transfer the exact amount to the account below</p>
                <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-primary">{formatTime(timeLeft)}</span>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">Activation Fee</p>
                  <p className="text-3xl font-bold text-primary">₦{ACTIVATION_AMOUNT.toLocaleString()}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => copy(String(ACTIVATION_AMOUNT), "Amount")}>
                  {copied === "Amount" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-secondary/20 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Account Number</p>
                    <p className="font-mono text-lg font-bold">{ACCOUNT_NUMBER}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => copy(ACCOUNT_NUMBER, "Account Number")}>
                    {copied === "Account Number" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <p className="text-xs text-muted-foreground">Account Name</p>
                  <p className="font-semibold">{ACCOUNT_NAME}</p>
                </div>
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <p className="text-xs text-muted-foreground">Bank</p>
                  <p className="font-semibold">{BANK}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Upload Payment Proof</Label>
                <div className="relative border-2 border-dashed border-primary/30 rounded-lg p-6 bg-primary/5 hover:bg-primary/10 transition">
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFile}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2 pointer-events-none">
                    <Upload className="w-8 h-8 text-primary" />
                    <p className="text-sm font-medium">Click to upload payment proof</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                  </div>
                </div>
                {proof && (
                  <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                    <Check className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium">{proof.name}</p>
                  </div>
                )}
              </div>

              <Button size="lg" className="w-full" onClick={handleSubmitPayment} disabled={!proof}>
                I Have Made Payment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card/60 backdrop-blur-sm border-border animate-fade-in">
            <CardContent className="p-8 text-center space-y-5">
              <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center mx-auto">
                <Clock className="w-10 h-10 text-primary animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                {existing?.status === "rejected" ? "Activation Rejected" : "Activation Pending"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {existing?.status === "rejected"
                  ? existing?.admin_note || "Your activation payment could not be confirmed. Please contact support."
                  : "Your activation payment is under review. You'll be able to withdraw once an admin confirms it."}
              </p>
              <div className="space-y-3">
                <Button className="w-full" size="lg" onClick={() => navigate("/support")}>
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full" size="lg" onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Activate;
