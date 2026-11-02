import { ArrowRight, CheckCircle2, Clock3, Percent, Users, UserRoundCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import ProgressBar from '../components/common/ProgressBar';
import MemberLists from '../components/common/MemberLists';
import { ErrorMessage, Loader } from '../components/common/Feedback';
import { useAuth } from '../context/AuthContext';
import { useElection } from '../context/ElectionContext';
import { formatDate } from '../utils/formatDate';
import { formatPercentage } from '../utils/formatPercentage';

export default function Dashboard() {
  const { member } = useAuth();
  const { status, results, busy, error, refreshAll } = useElection();
  if (busy && !status) return <Loader label="Loading election overview" />;
  if (error && !status) return <ErrorMessage message={error} onRetry={refreshAll} />;
  const participants = status?.participants || [];
  const pending = status?.pending || [];
  const didParticipate = participants.some((item) => item.email === member?.email);
  const assigned = participants.find((item) => item.email === member?.email)?.assignedNumber;
  const completed = status?.status === 'COMPLETED';

  return <>
    <PageHeader eyebrow="ELECTION OVERVIEW" title={`Welcome back${member?.email ? `, ${member.email.split('@')[0]}` : ''}`} description="A clear view of participation, progress and the current election." action={<span className={`status-pill ${completed ? 'status-complete' : 'status-open'}`}><span />{status?.status || 'NO ELECTION'}</span>} />
    {error && <ErrorMessage message={error} onRetry={refreshAll} />}
    <section className="welcome-strip"><div><div className="welcome-kicker">CURRENT ELECTION</div><h2>{status?.title || 'No election is currently available'}</h2><p>{status?.startedAt ? `Started ${formatDate(status.startedAt)}` : 'Election details will appear here when available.'}</p></div><div className="welcome-action">{didParticipate ? <div className="participated-callout"><CheckCircle2 size={19} /><span><strong>Entry recorded</strong><small>Your number is {assigned ? `#${assigned}` : 'assigned'}.</small></span></div> : !completed && status?.status === 'OPEN' && <Link to="/participate" className="button button-light">Participate now <ArrowRight size={16} /></Link>}</div></section>
    {busy && status && <div className="refresh-indicator">Updating live election information…</div>}
    <div className="stats-grid"><StatCard label="Registered members" value={status?.totalMembers ?? '—'} detail="Eligible voters" icon={Users} /><StatCard label="Participated" value={status?.participantCount ?? '—'} detail="Entries recorded" icon={UserRoundCheck} tone="green" /><StatCard label="Pending" value={status?.pendingCount ?? '—'} detail="Still to participate" icon={Clock3} tone="amber" /><StatCard label="Participation" value={formatPercentage(status?.participationPercentage)} detail="Of eligible members" icon={Percent} tone="violet" /></div>
    <section className="surface progress-card"><div className="section-heading"><div><h3>Participation progress</h3><p>Each registered member can enter once.</p></div><span className="progress-count">{status?.participantCount ?? 0} <span>of {status?.totalMembers ?? 0}</span></span></div><ProgressBar value={status?.participationPercentage} label={`${status?.participantCount ?? 0} of ${status?.totalMembers ?? 0} members have participated`} caption={formatPercentage(status?.participationPercentage)} /></section>
    <MemberLists participants={participants} pending={pending} />
    <section className="results-preview surface"><div><span className="preview-icon"><CheckCircle2 size={18} /></span><div><h3>{completed ? 'The draw is complete' : 'Results will be published automatically'}</h3><p>{completed ? 'The final selection is available for every member to review.' : 'Two representatives are selected after every eligible member has participated.'}</p></div></div><Link to="/results" className="subtle-link">View results <ArrowRight size={16} /></Link>{completed && results?.winners?.length > 0 && <div className="preview-winners">{results.winners.map((winner) => <span key={winner.email}><CheckCircle2 size={15} /> {winner.email}</span>)}</div>}</section>
  </>;
}
