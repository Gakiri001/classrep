import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { requestOtp } from "../services/authService";
import { messageFromError } from "../services/api";

export default function Login() {
  const { member } = useAuth();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();
  if (member) return <Navigate to="/dashboard" replace />;

  const submit = async (event) => {
    event.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized))
      return toast.error("Enter a valid email address.");
    setSending(true);
    try {
      await requestOtp(normalized);
      sessionStorage.setItem("pending_email", normalized);
      sessionStorage.setItem("otp_sent_at", String(Date.now()));
      toast.success("Verification code sent. Check your inbox.");
      navigate("/verify-otp", { state: { email: normalized } });
    } catch (error) {
      toast.error(
        messageFromError(error, "Unable to send a verification code."),
      );
    } finally {
      setSending(false);
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
            <span className="online-dot" /> STUDENT ELECTION PORTAL
          </span>
          <h1>
            A fair selection,
            <br />
            <span>built on trust.</span>
          </h1>
          <p>
            One secure entry for every eligible student. Two representatives
            chosen through a transparent random draw.
          </p>
          <div className="showcase-points">
            <span>
              <CheckCircle2 size={17} /> Secure student verification
            </span>
            <span>
              <CheckCircle2 size={17} /> Equal participation
            </span>
            <span>
              <CheckCircle2 size={17} /> Transparent results
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
          <span className="auth-step">
            SECURE SIGN IN <span>01 / 02</span>
          </span>
          <h2>Welcome back</h2>
          <p className="auth-subtitle">
            Enter your registered student email to securely access the election
            platform.
          </p>
          <form onSubmit={submit} className="auth-form">
            <label htmlFor="email" className="field-label">
              Student email
            </label>
            <div className="input-with-icon">
              <Mail size={18} />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="button button-primary auth-submit"
              disabled={sending}
            >
              {sending ? (
                "Sending code…"
              ) : (
                <>
                  Continue with email <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
          <div className="secure-note">
            <LockKeyhole size={16} />
            <span>
              Access is limited to registered members. We’ll email you a
              one-time code.
            </span>
          </div>
          <div className="auth-help">
            By continuing, you agree to participate fairly and only once in this
            election.
          </div>
        </div>
      </main>
    </div>
  );
}
