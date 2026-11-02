import {
  Award,
  CheckCircle2,
  Clock3,
  Hash,
  Sparkles,
  Trophy,
} from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import ProgressBar from "../components/common/ProgressBar";
import {
  EmptyState,
  ErrorMessage,
  Loader,
} from "../components/common/Feedback";
import { useElection } from "../context/ElectionContext";
import { formatDate } from "../utils/formatDate";

export default function Results() {
  const { status, results, busy, error, refreshAll } = useElection();
  if (busy && !results) return <Loader label="Loading election results" />;
  if (error && !results)
    return <ErrorMessage message={error} onRetry={refreshAll} />;
  const complete = results?.status === "COMPLETED" && results?.drawCompleted;
  const winnerEmails = new Set(
    (results?.winners || []).map((winner) => winner.email),
  );
  const otherParticipants = (results?.participants || []).filter(
    (person) => !winnerEmails.has(person.email),
  );
  return (
    <>
      <PageHeader
        eyebrow="OFFICIAL ELECTION OUTCOME"
        title="Results"
        description="The selection is conducted and recorded by the election server."
        action={
          <span
            className={`status-pill ${complete ? "status-complete" : "status-open"}`}
          >
            <span />
            {results?.status || "NO ELECTION"}
          </span>
        }
      />
      {error && <ErrorMessage message={error} onRetry={refreshAll} />}
      {!complete ? (
        <section className="surface pending-results">
          <div className="pending-results-icon">
            <Clock3 size={24} />
          </div>
          <span className="eyebrow">DRAW NOT COMPLETE</span>
          <h2>Results are on the way</h2>
          <p>
            Two class representatives will be selected automatically once all
            registered members have participated.
          </p>
          <div className="pending-progress">
            <ProgressBar
              value={status?.participationPercentage}
              label={`${status?.participantCount ?? 0} of ${status?.totalMembers ?? 0} members have participated`}
              caption={`${status?.pendingCount ?? 0} pending`}
            />
          </div>
          <div className="result-assurance">
            <ShieldLine /> The backend conducts and saves the final draw. This
            page never chooses winners.
          </div>
        </section>
      ) : (
        <>
          <section className="results-celebration">
            <span className="celebration-badge">
              <Sparkles size={15} /> DRAW COMPLETED
            </span>
            <h2>Congratulations to the selected representatives.</h2>
            <p>{results.title}</p>
            <span className="completion-time">
              <CheckCircle2 size={15} /> Completed{" "}
              {formatDate(results.completedAt)}
            </span>
          </section>
          <div className="winners-grid">
            {(results.winners || []).map((winner, index) => (
              <article
                className={`winner-card winner-${index + 1}`}
                key={winner.email}
              >
                <div className="winner-top">
                  <span className="winner-icon">
                    <Trophy size={20} />
                  </span>
                  <span>CLASS REPRESENTATIVE</span>
                  <span className="winner-place">0{index + 1}</span>
                </div>
                <div className="winner-email">{winner.email}</div>
                <div className="winner-number">
                  <Hash size={17} /> Assigned number{" "}
                  <strong>{winner.assignedNumber}</strong>
                </div>
                <div className="winner-bottom">
                  <Award size={16} /> Selected by the automatic random draw
                </div>
              </article>
            ))}
          </div>
          <section className="surface participant-results">
            <div className="section-heading">
              <div>
                <h3>Other participants</h3>
                <p>
                  All entries and assigned numbers are listed for transparency.
                </p>
              </div>
              <span className="count-badge">{otherParticipants.length}</span>
            </div>
            {otherParticipants.length ? (
              <div className="results-table-wrap">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Assigned number</th>
                      <th>Participation time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {otherParticipants.map((person) => (
                      <tr key={person.email}>
                        <td>{person.email}</td>
                        <td>
                          <span className="number-pill">
                            #{person.assignedNumber}
                          </span>
                        </td>
                        <td>{formatDate(person.participatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No other participants"
                description="All recorded participant entries are shown in the winner cards."
              />
            )}
          </section>
        </>
      )}
    </>
  );
}

function ShieldLine() {
  return (
    <span className="shield-line">
      <CheckCircle2 size={16} />
    </span>
  );
}
