import { useState } from 'react';
import { ArrowRight, CheckCircle2, Hash, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '../components/common/PageHeader';
import ProgressBar from '../components/common/ProgressBar';
import { ErrorMessage, Loader } from '../components/common/Feedback';
import { useAuth } from '../context/AuthContext';
import { useElection } from '../context/ElectionContext';
import { participate } from '../services/memberService';
import { messageFromError } from '../services/api';

export default function Participation() {
  const { member } = useAuth();
  const { status, busy, error, refreshAll } = useElection();
  const [submitting, setSubmitting] = useState(false);
  const didParticipate = (status?.participants || []).find((person) => person.email === member?.email);
  const canParticipate = status?.status === 'OPEN' && !didParticipate;

  const enter = async () => {
    setSubmitting(true);
    try {
      const { data } = await participate();
      toast.success(data.assignedNumber ? `Participation recorded. Your number is #${data.assignedNumber}.` : 'Participation recorded.');
      await refreshAll();
    } catch (requestError) { toast.error(messageFromError(requestError, 'Unable to record participation.')); await refreshAll(); }
    finally { setSubmitting(false); }
  };

  if (busy && !status) return <Loader label="Loading participation details" />;
  if (error && !status) return <ErrorMessage message={error} onRetry={refreshAll} />;
  return <>
    <PageHeader eyebrow="YOUR ELECTION ENTRY" title="Participation" description="Make your one entry in this election. Your number is assigned securely by the server." />
    <section className="participation-hero surface"><div className="participation-copy"><span className="eyebrow">CURRENT ELECTION</span><h2>{status?.title || 'No election is available'}</h2><p>Every eligible member gets one entry. The assigned number identifies your entry; it is not a vote or candidate preference.</p><div className="participation-meta"><span className={`status-pill ${status?.status === 'COMPLETED' ? 'status-complete' : 'status-open'}`}><span />{status?.status || 'NO ELECTION'}</span>{status?.startedAt && <span>Started {new Date(status.startedAt).toLocaleDateString()}</span>}</div></div><div className="participation-number">{didParticipate ? <><span>Your assigned number</span><strong>#{didParticipate.assignedNumber}</strong><small>Entry recorded for this election</small></> : <><span>YOUR ENTRY</span><strong><Hash size={39} /></strong><small>Assigned after you participate</small></>}</div></section>
    <section className="surface progress-card participation-progress"><div className="section-heading"><div><h3>Member progress</h3><p>Participation is visible to all members.</p></div><strong className="progress-count">{status?.participantCount ?? 0}<span> / {status?.totalMembers ?? 0}</span></strong></div><ProgressBar value={status?.participationPercentage} label={`${status?.pendingCount ?? 0} members still pending`} caption={`${status?.participationPercentage ?? 0}%`} /></section>
    <section className="surface participation-action-card"><div className="action-heading"><span className={`action-icon ${didParticipate ? 'action-icon-done' : ''}`}>{didParticipate ? <CheckCircle2 size={23} /> : <ShieldCheck size={23} />}</span><div><h3>{didParticipate ? 'Your participation is complete' : status?.status === 'COMPLETED' ? 'This election has concluded' : 'Ready to record your entry?'}</h3><p>{didParticipate ? 'You have successfully participated once in this election.' : status?.status === 'COMPLETED' ? 'Participation is closed. You can review the final selection on the results page.' : 'The server will verify your identity and assign an unused random number.'}</p></div></div>{didParticipate ? <div className="participation-confirmed"><CheckCircle2 size={19} /> Recorded {didParticipate.participatedAt ? `on ${new Date(didParticipate.participatedAt).toLocaleString()}` : 'successfully'}</div> : canParticipate ? <button className="button button-primary" onClick={enter} disabled={submitting}>{submitting ? 'Recording entry…' : <>Participate now <ArrowRight size={17} /></>}</button> : null}</section>
    <section className="steps-grid"><div className="step-card"><span>01</span><div><strong>Verified member</strong><p>Your authenticated account identifies you. No identity is sent in the request.</p></div></div><div className="step-card"><span>02</span><div><strong>Unique number</strong><p>The server assigns a number that has not been used in this election.</p></div></div><div className="step-card"><span>03</span><div><strong>Automatic draw</strong><p>Two representatives are drawn after all {status?.totalMembers ?? 'eligible'} members participate.</p></div></div></section>
  </>;
}
