import { useCallback, useEffect, useState } from "react";
import {
  Archive,
  CheckCircle2,
  Clock3,
  Plus,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";
import ProgressBar from "../components/common/ProgressBar";
import MemberLists from "../components/common/MemberLists";
import ElectionRenewalModal from "../components/admin/ElectionRenewalModal";
import { ErrorMessage, Loader } from "../components/common/Feedback";
import { getAdminDashboard, archiveElection } from "../services/adminService";
import { messageFromError } from "../services/api";
import { formatDate } from "../utils/formatDate";
import { formatPercentage } from "../utils/formatPercentage";
import { useElection } from "../context/ElectionContext";

export default function AdminDashboard() {
  const { history: allHistory, refreshAll: refreshElection } = useElection();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [renewing, setRenewing] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const { data } = await getAdminDashboard();
      setDashboard(data);
    } catch (requestError) {
      setError(
        messageFromError(requestError, "Could not load admin information."),
      );
    } finally {
      setLoading(false);
    }
  }, []);
  const refreshAllData = async () => {
    await Promise.all([refresh(), refreshElection()]);
  };
  // oxlint-disable-next-line react/set-state-in-effect -- Load protected admin data when this page mounts.
  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const update = () => refresh();
    window.addEventListener("classrep:election-event", update);
    return () => window.removeEventListener("classrep:election-event", update);
  }, [refresh]);

  const archive = async () => {
    const election = dashboard?.currentElection;
    if (
      !election ||
      !window.confirm(
        `Archive “${election.title}”? Its participation and results will be preserved in history.`,
      )
    )
      return;
    setArchiving(true);
    try {
      await archiveElection(election.electionId);
      toast.success("Election archived.");
      await refreshAllData();
    } catch (requestError) {
      toast.error(
        messageFromError(requestError, "Unable to archive this election."),
      );
    } finally {
      setArchiving(false);
    }
  };

  if (loading) return <Loader label="Loading admin dashboard" />;
  if (error && !dashboard)
    return <ErrorMessage message={error} onRetry={refresh} />;
  const election = dashboard?.currentElection;
  const history = dashboard?.history || [];
  const completedCount = allHistory.filter(
    (cycle) => cycle.completedAt || cycle.winners?.length > 0,
  ).length;
  return (
    <>
      <PageHeader
        eyebrow="SUPER ADMINISTRATION"
        title="Election management"
        description="Monitor participation and manage election cycles. Lottery outcomes remain automatic and impartial."
        action={
          <button
            className="button button-primary"
            onClick={() => setRenewing(true)}
          >
            <Plus size={17} /> New election cycle
          </button>
        }
      />
      {error && <ErrorMessage message={error} onRetry={refresh} />}
      <div className="admin-notice">
        <ShieldCheck size={19} />
        <div>
          <strong>Administrative access is active</strong>
          <span>
            Your account remains an eligible voter. Administrative access does
            not affect lottery selection.
          </span>
        </div>
      </div>
      <div className="stats-grid">
        <StatCard
          label="Current election"
          value={election?.status || "—"}
          detail={election?.title || "No election available"}
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          label="Registered members"
          value={election?.totalMembers ?? "—"}
          detail="Active eligible members"
          icon={Users}
        />
        <StatCard
          label="Pending participation"
          value={election?.pendingCount ?? "—"}
          detail={`${election?.participantCount ?? 0} entries recorded`}
          icon={Clock3}
          tone="amber"
        />
        <StatCard
          label="Completed cycles"
          value={completedCount}
          detail="In recent election history"
          icon={Archive}
          tone="violet"
        />
      </div>
      {election ? (
        <>
          <section className="surface progress-card admin-progress">
            <div className="section-heading">
              <div>
                <span className="eyebrow">CURRENT CYCLE</span>
                <h3>{election.title}</h3>
                <p>Started {formatDate(election.startedAt)}</p>
              </div>
              <span
                className={`status-pill ${election.status === "COMPLETED" ? "status-complete" : election.status === "OPEN" ? "status-open" : "status-archived"}`}
              >
                <span />
                {election.status}
              </span>
            </div>
            <div className="admin-progress-meta">
              <ProgressBar
                value={election.participationPercentage}
                label={`${election.participantCount} of ${election.totalMembers} members participated`}
                caption={formatPercentage(election.participationPercentage)}
              />
              <button
                className="button button-secondary"
                onClick={refreshAllData}
                title="Refresh election data"
              >
                <RefreshCw size={16} /> Refresh
              </button>
            </div>
            {election.winners?.length > 0 && (
              <div className="admin-winners">
                <strong>Selected representatives</strong>
                {election.winners.map((winner) => (
                  <span key={winner.email}>
                    <CheckCircle2 size={15} />
                    {winner.email}
                    <b>#{winner.assignedNumber}</b>
                  </span>
                ))}
              </div>
            )}
            {election.status !== "ARCHIVED" && (
              <div className="admin-management-actions">
                <span>
                  Previous records are retained when a cycle is archived.
                </span>
                <button
                  className="button button-danger-soft"
                  onClick={archive}
                  disabled={archiving}
                >
                  {archiving ? (
                    "Archiving…"
                  ) : (
                    <>
                      <Archive size={16} /> Archive cycle
                    </>
                  )}
                </button>
              </div>
            )}
          </section>
          <MemberLists
            participants={election.participants || []}
            pending={election.pending || []}
          />
        </>
      ) : (
        <section className="surface empty-admin">
          <div>
            <h3>No election cycle found</h3>
            <p>Create a new cycle to begin participation.</p>
            <button
              className="button button-primary"
              onClick={() => setRenewing(true)}
            >
              <Plus size={17} /> Start election
            </button>
          </div>
        </section>
      )}
      <section className="surface admin-history">
        <div className="section-heading">
          <div>
            <h3>Recent election cycles</h3>
            <p>Historical records are read-only and preserved.</p>
          </div>
          <span className="count-badge">{history.length}</span>
        </div>
        {history.length ? (
          <div className="results-table-wrap">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Election</th>
                  <th>Status</th>
                  <th>Started</th>
                  <th>Participation</th>
                  <th>Representatives</th>
                </tr>
              </thead>
              <tbody>
                {history.map((cycle) => (
                  <tr key={cycle.electionId}>
                    <td>{cycle.title}</td>
                    <td>
                      <span
                        className={`status-pill ${cycle.status === "COMPLETED" ? "status-complete" : "status-archived"}`}
                      >
                        <span />
                        {cycle.status}
                      </span>
                    </td>
                    <td>{formatDate(cycle.startedAt)}</td>
                    <td>
                      {cycle.participantCount} / {cycle.totalMembers}
                    </td>
                    <td>
                      {cycle.winners?.length
                        ? cycle.winners.map((winner) => winner.email).join(", ")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted-empty">No historical cycles to display yet.</p>
        )}
      </section>
      {renewing && (
        <ElectionRenewalModal
          election={election}
          onClose={() => setRenewing(false)}
          onSuccess={refreshAllData}
        />
      )}
    </>
  );
}
