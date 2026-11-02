import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  LockKeyhole,
  MailCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { requestOtp, verifyOtp } from "../services/authService";
import { messageFromError } from "../services/api";

export default function VerifyOTP() {
  const { member, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const email =
    location.state?.email || sessionStorage.getItem("pending_email") || "";
  const [otp, setOtp] = useState("");
  const [remaining, setRemaining] = useState(300);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const timeLabel = useMemo(
    () =>
      `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`,
    [remaining],
  );

  useEffect(() => {
    const updateCountdown = () => {
      const issuedAt =
        Number(sessionStorage.getItem("otp_sent_at")) || Date.now();
      setRemaining(
        Math.max(0, Math.ceil((issuedAt + 300000 - Date.now()) / 1000)),
      );
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);
  if (member) return <Navigate to="/dashboard" replace />;
  if (!email) return <Navigate to="/login" replace />;

  const submit = async (event) => {
    event.preventDefault();
    const code = otp.replace(/\s/g, "");
    if (!/^\d{6}$/.test(code))
      return toast.error("Enter the six-digit code from your email.");
    setVerifying(true);
    try {
      const { data } = await verifyOtp(email, code);
      login(data.token, data.member);
      sessionStorage.removeItem("pending_email");
      sessionStorage.removeItem("otp_sent_at");
      toast.success("You’re signed in.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(messageFromError(error, "The code could not be verified."));
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      await requestOtp(email);
      sessionStorage.setItem("otp_sent_at", String(Date.now()));
      setRemaining(300);
      setOtp("");
      toast.success("A new code has been sent.");
    } catch (error) {
      toast.error(messageFromError(error, "Unable to resend the code."));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-showcase">
        <div className="auth-brand">
          <span className="brand-mark brand-mark-large">
            <BarChart3 size={25} />
          </span>
          <span>
            <strong>MSc Class Rep Selector</strong>
            <small>Transparent. Fair. Random.</small>
          </span>
        </div>
        <div className="showcase-content">
          <span className="showcase-kicker">
            <span className="online-dot" /> EMAIL VERIFICATION
          </span>
          <h1>
            Your voice.
            <br />
            <span>One fair draw.</span>
          </h1>
          <p>
            Every eligible member gets one entry. The platform keeps
            participation visible and the final selection impartial.
          </p>
          <div className="showcase-points">
            <span>
              <CheckCircle2 size={17} /> One-time sign-in code
            </span>
            <span>
              <CheckCircle2 size={17} /> Expires after five minutes
            </span>
            <span>
              <CheckCircle2 size={17} /> Never share your code
            </span>
          </div>
        </div>
        <div className="showcase-footer">
          <span>MSC COMPUTER SCIENCE</span>
          <span>CLASS REPRESENTATIVE ELECTION</span>
        </div>
      </div>
      <main className="auth-panel">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand">
            <span className="brand-mark">
              <BarChart3 size={20} />
            </span>
            <strong>MSc Class Rep Selector</strong>
          </div>
          <Link to="/login" className="back-link">
            <ArrowLeft size={16} /> Change email
          </Link>
          <span className="auth-step">
            SECURE SIGN IN <span>02 / 02</span>
          </span>
          <div className="mail-illustration">
            <MailCheck size={25} />
          </div>
          <h2>Check your email</h2>
          <p className="auth-subtitle">
            We sent a six-digit verification code to <strong>{email}</strong>.
          </p>
          <form onSubmit={submit} className="auth-form">
            <label htmlFor="otp" className="field-label">
              Verification code
            </label>
            <input
              id="otp"
              className="otp-input"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              required
            />
            <div className="otp-hint">
              <span>
                <LockKeyhole size={14} /> Code expires in {timeLabel}
              </span>
              <button
                type="button"
                className="text-button"
                onClick={resend}
                disabled={resending || remaining > 240}
              >
                {resending ? "Sending…" : "Resend code"}
              </button>
            </div>
            <button
              className="button button-primary auth-submit"
              disabled={verifying || otp.length !== 6}
            >
              {verifying ? (
                "Verifying…"
              ) : (
                <>
                  Verify and continue <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
          <div className="secure-note">
            <LockKeyhole size={16} />
            <span>For your security, never share this code with anyone.</span>
          </div>
        </div>
      </main>
    </div>
  );
}
