import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import LiquidBackground from "@/components/LiquidBackground";
import Logo from "@/components/Logo";
import ProfileButton from "@/components/ProfileButton";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Copy, Check, Upload, Clock } from "lucide-react";
import { toast } from "sonner";

// 6 minutes
const SIX_MINUTES = 6 * 60;

const PaymentInstructions = () => {
  const navigate = useNavigate();

  const [copied, setCopied] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SIX_MINUTES);

  const amount = "6,700";
  const accountNumber = "0051857178";
  const bankName = "PAGA";
  const accountName = "NNANNA JOSEPH";

  // generate reference once
  const [referenceId] = useState(() => `REF${Date.now()}`);

  // reset timer when pending starts
  useEffect(() => {
    if (showPending) {
      setTimeLeft(SIX_MINUTES);
    }
  }, [showPending]);

  // countdown
  useEffect(() => {
    if (!showPending) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showPending]);

  // auto-redirect when timer finishes
  useEffect(() => {
    if (!showPending) return;

    if (timeLeft === 0) {
      navigate("/support");
    }
  }, [timeLeft, showPending, navigate]);

  const formatTime = (seconds: number) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success(`${field} copied!`);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024;

    if (!allowed.includes(file.type)) {
      toast.error("Only JPG, PNG, and WEBP images allowed");
      return;
    }

    if (file.size > maxSize) {
      toast.error("File must be under 5MB");
      return;
    }

    setScreenshot(file);
    toast.success("Screenshot uploaded");
  };

  const handlePaymentConfirm = async () => {
    if (!screenshot) {
      toast.error("Please upload payment screenshot");
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    setShowPending(true);
  };

  /* =======================
     PENDING SCREEN
  ======================== */
  if (showPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#120505] to-black px-4">
        <div className="w-full max-w-md rounded-2xl bg-black/70 backdrop-blur-md border border-red-500/20 shadow-2xl p-8 text-center space-y-6">

          <div className="mx-auto w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
            <Clock className="w-10 h-10 text-red-500 animate-pulse" />
          </div>

          <h1 className="text-3xl font-bold text-red-500">
            Transaction Pending
          </h1>

          <p className="text-sm text-gray-400 leading-relaxed">
            Your transaction is currently under verification.
            This process usually takes a few minutes.
          </p>

          <div className="rounded-xl border border-red-500/30 bg-red-500/10 py-4">
            <p className="text-xs text-gray-400 mb-1">Time remaining</p>
            <p className="text-2xl font-bold text-red-500">
              {formatTime(timeLeft)}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <p className="text-sm text-yellow-400 font-medium">
              For faster confirmation, contact support
            </p>

            <Button
              onClick={() => navigate("/support")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              ✈️ Contact Support
            </Button>

            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Go to Dashboard
            </Button>
          </div>

        </div>
      </div>
    );
  }

  /* =======================
     LOADING
  ======================== */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <LiquidBackground />
        <div className="relative z-10">
          <LoadingSpinner message="Verifying Payment" />
        </div>
      </div>
    );
  }

  /* =======================
     PAYMENT INSTRUCTIONS
  ======================== */
  return (
    <div className="min-h-screen relative">
      <LiquidBackground />

      <header className="relative z-10 px-3 py-2 flex items-center justify-between border-b border-border/20 bg-card/30 backdrop-blur-sm">
        <Logo />
        <ProfileButton />
      </header>

      <main className="relative z-10 px-3 py-4 max-w-4xl mx-auto space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Payment Instructions</h1>
          <p className="text-sm text-muted-foreground">
            Transfer to the account below
          </p>
        </div>

        <Card className="bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 space-y-4">

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="text-xs text-muted-foreground">Amount to Pay</p>
                <p className="text-3xl font-bold text-primary">₦{amount}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  copyToClipboard(amount.replace(",", ""), "Amount")
                }
              >
                {copied === "Amount"
                  ? <Check className="w-4 h-4" />
                  : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-secondary/20 rounded-lg">
                <p className="text-xs text-muted-foreground">Bank Name</p>
                <p className="font-semibold">{bankName}</p>
              </div>

              <div className="p-3 bg-secondary/20 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">Account Number</p>
                  <p className="font-mono text-lg font-bold">{accountNumber}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(accountNumber, "Account Number")
                  }
                >
                  {copied === "Account Number"
                    ? <Check className="w-4 h-4" />
                    : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              <div className="p-3 bg-secondary/20 rounded-lg">
                <p className="text-xs text-muted-foreground">Account Name</p>
                <p className="font-semibold">{accountName}</p>
              </div>

              <div className="p-3 bg-secondary/20 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">Reference ID</p>
                  <p className="font-mono text-sm">{referenceId}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(referenceId, "Reference")
                  }
                >
                  {copied === "Reference"
                    ? <Check className="w-4 h-4" />
                    : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Upload Payment Screenshot</Label>

              <div className="relative border-2 border-dashed border-primary/30 rounded-lg p-6 bg-primary/5 hover:bg-primary/10 transition">
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2 pointer-events-none">
                  <Upload className="w-8 h-8 text-primary" />
                  <p className="text-sm font-medium">
                    Click to upload payment proof
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              </div>

              {screenshot && (
                <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                  <Check className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium">{screenshot.name}</p>
                </div>
              )}
            </div>

            <Button
              onClick={handlePaymentConfirm}
              disabled={!screenshot || loading}
              size="lg"
              className="w-full"
            >
              I Have Made Payment
            </Button>

          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PaymentInstructions;
