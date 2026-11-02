import { Check, Clock3 } from 'lucide-react';
import { EmptyState } from './Feedback';

function MemberRows({ members, participated }) {
  if (!members?.length) return <EmptyState title={participated ? 'No participants yet' : 'Everyone has participated'} description={participated ? 'Participant updates will appear here.' : 'There are no members waiting to participate.'} />;
  return <div className="member-list">{members.map((person) => <div className="member-row" key={person.email}><span className={`member-state ${participated ? 'state-done' : 'state-pending'}`}>{participated ? <Check size={15} /> : <Clock3 size={15} />}</span><span className="member-email">{person.email}</span>{participated && Number.isFinite(person.assignedNumber) && <span className="number-pill">#{person.assignedNumber}</span>}</div>)}</div>;
}

export default function MemberLists({ participants = [], pending = [] }) {
  return <div className="member-columns"><section className="surface list-card"><div className="list-title"><div><h3>Participated</h3><p>Members who have completed their entry</p></div><span className="count-badge success-badge">{participants.length}</span></div><MemberRows members={participants} participated /></section><section className="surface list-card"><div className="list-title"><div><h3>Yet to participate</h3><p>Members with an entry still pending</p></div><span className="count-badge pending-badge">{pending.length}</span></div><MemberRows members={pending} participated={false} /></section></div>;
}
