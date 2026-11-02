import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Trophy,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useElection } from "../../context/ElectionContext";

const voterLinks = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/participate", label: "Participation", icon: CheckCircle2 },
  { to: "/results", label: "Results", icon: Trophy },
  { to: "/election-history", label: "Election history", icon: ClipboardList },
];

export default function AppLayout() {
  const { member, logout } = useAuth();
  const { socketConnected } = useElection();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const links =
    member?.role === "SUPER_ADMIN"
      ? [
          ...voterLinks,
          { to: "/admin", label: "Admin management", icon: ShieldCheck },
        ]
      : voterLinks;
  const leave = () => {
    logout();
    navigate("/login", { replace: true });
  };
  const close = () => setMenuOpen(false);

  return (
    <div className="app-shell min-h-screen">
      {menuOpen && (
        <button
          className="mobile-scrim"
          aria-label="Close navigation"
          onClick={close}
        />
      )}
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand-lockup">
          <span className="brand-mark">
            <BarChart3 size={21} />
          </span>
          <span>
            <strong>MSc Class Rep</strong>
            <small>Transparent. Fair. Random.</small>
          </span>
          <button
            className="icon-button mobile-close"
            onClick={close}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>
        <div className="nav-caption">WORKSPACE</div>
        <nav className="side-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={close}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link-active" : ""}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="member-chip">
            <div className="avatar">
              {member?.email?.[0]?.toUpperCase() || "M"}
            </div>
            <div className="member-chip-text">
              <strong>{member?.email}</strong>
              <span>
                {member?.role === "SUPER_ADMIN"
                  ? "Super Admin · Voter"
                  : "Registered voter"}
              </span>
            </div>
          </div>
          <button className="logout-link" onClick={leave}>
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>
      <div className="main-column flex min-h-screen flex-col">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="Open navigation"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={21} />
          </button>
          <div className="breadcrumb">
            <span>Class rep selector</span>
            <span className="breadcrumb-dot">/</span>
            <span className="breadcrumb-current">Election workspace</span>
          </div>
          <div className="topbar-profile">
            <span
              className={`online-dot ${socketConnected ? "" : "offline-dot"}`}
            />{" "}
            {socketConnected ? "Live updates on" : "Reconnecting"}{" "}
            <span className="topbar-divider" />
            <span className="topbar-email">{member?.email}</span>
          </div>
        </header>
        <main className="page-content mx-auto w-full">
          <Outlet />
        </main>
        <footer className="site-footer">
          <span>MSc Class Rep Selector</span>
          <span>Transparent. Fair. Random.</span>
        </footer>
      </div>
    </div>
  );
}
