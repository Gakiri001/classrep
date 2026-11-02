import { useRef, useState } from "react";
import { Archive, ChevronDown, ChevronUp, Trophy } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "../components/common/PageHeader";
import {
  EmptyState,
  ErrorMessage,
  Loader,
} from "../components/common/Feedback";
import { useElection } from "../context/ElectionContext";
import { getElectionResults } from "../services/electionService";
import { formatDate } from "../utils/formatDate";

export default function ElectionHistory() {
  const { history, busy, error, refreshAll } = useElection();
  const [detailsId, setDetailsId] = useState("");
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const requestSequence = useRef(0);
  if (busy && !history.length)
    return <Loader label="Loading election history" />;
  const showDetails = async (election) => {
    const sequence = ++requestSequence.current;
    if (detailsId === election.electionId) {
      setDetailsId("");
      setDetails(null);
      setLoadingDetails(false);
      return;
    }
    setDetailsId(election.electionId);
    setDetails(null);
    setLoadingDetails(true);
    try {
      const { data } = await getElectionResults(election.electionId);
      if (requestSequence.current === sequence)
        setDetails({ ...data, winners: election.winners || [] });
    } catch {
      if (requestSequence.current === sequence) {
        toast.error("Unable to load this election record. Try again.");
        setDetailsId("");
      }
    } finally {
      if (requestSequence.current === sequence) setLoadingDetails(false);
    }
  };
  return (
    <>
      <PageHeader
        eyebrow="PAST CYCLES"
        title="Election history"
        description="Previous election cycles and their recorded outcomes remain available here."
      />
      {error && <ErrorMessage message={error} onRetry={refreshAll} />}
      {!history.length ? (
        <section className="surface">
          <EmptyState
            title="No previous elections yet"
            description="Completed or archived election cycles will appear here."
          />
        </section>
      ) : (
        <div className="history-grid">
          {history.map((election) => (
            <article className="surface history-card" key={election.electionId}>
              <div className="history-card-top">
                <span className="history-icon">
                  <Archive size={18} />
                </span>
                <span
                  className={`status-pill ${election.status === "COMPLETED" ? "status-complete" : "status-archived"}`}
                >
                  <span />
                  {election.status}
                </span>
              </div>
              <h3>{election.title}</h3>
              <div className="history-dates">
                <span>
                  Started <strong>{formatDate(election.startedAt)}</strong>
                </span>
                <span>
                  Completed <strong>{formatDate(election.completedAt)}</strong>
                </span>
              </div>
              <div className="history-participation">
                <span>Participation</span>
                <strong>
                  {election.participantCount} / {election.totalMembers}
                </strong>
              </div>
              {election.winners?.length > 0 && (
                <div className="history-winners">
                  <span className="history-winner-label">
                    <Trophy size={15} /> SELECTED REPRESENTATIVES
                  </span>
                  {election.winners.map((winner) => (
                    <div key={winner.email}>
                      <span>{winner.email}</span>
                      <span className="number-pill">
                        #{winner.assignedNumber}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="history-card-footer">
                <span>Election record preserved</span>
                <button
                  className="text-button history-detail-button"
                  onClick={() => showDetails(election)}
                >
                  {detailsId === election.electionId ? (
                    <>
                      Hide details <ChevronUp size={14} />
                    </>
                  ) : (
                    <>
                      Full results <ChevronDown size={14} />
                    </>
                  )}
                </button>
              </div>
              {detailsId === election.electionId && (
                <div className="history-detail">
                  {loadingDetails ? (
                    <Loader label="Loading cycle results" />
                  ) : (
                    details && (
                      <>
                        <strong>Participant entries</strong>
                        {details.participants?.length ? (
                          details.participants.map((person) => (
                            <div
                              className="history-participant-row"
                              key={person.email}
                            >
                              <span>{person.email}</span>
                              <span className="number-pill">
                                #{person.assignedNumber}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="muted-empty">
                            No participant entries were recorded.
                          </p>
                        )}
                      </>
                    )
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
