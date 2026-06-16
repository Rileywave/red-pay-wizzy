import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const SIX_HOURS = 6 * 60 * 60; // seconds

const PendingPage = () => {
  const [timeLeft, setTimeLeft] = useState(SIX_HOURS);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="text-center max-w-md w-full bg-card border border-border rounded-xl p-8 shadow-sm space-y-5">
        <h1 className="text-4xl font-bold text-foreground">Transaction Pending</h1>

        <p className="text-muted-foreground text-base">
          Your transaction is currently being processed.
          This usually takes a short time, but may take up to <b>6 hours</b>.
        </p>

        <div className="bg-primary/10 border border-primary/20 rounded-lg py-4">
          <p className="text-sm text-muted-foreground">Time remaining</p>
          <p className="text-2xl font-bold text-primary">
            {formatTime(timeLeft)}
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          If this takes longer than expected, please contact support.
        </p>

        <div className="flex flex-col gap-3">
          <a
            href="https://t.me/Redpaywebsupport"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full rounded-md bg-primary px-4 py-2 text-white font-medium hover:bg-primary/90"
          >
            Contact Telegram Support
          </a>

          <Link
            to="/dashboard"
            className="inline-block w-full rounded-md border border-border px-4 py-2 text-foreground hover:bg-muted"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PendingPage;
