import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return <div className="center-page"><div className="center-card"><span className="center-icon"><SearchX size={25} /></span><div className="eyebrow">404 · PAGE NOT FOUND</div><h1>This page isn’t here</h1><p>The address may be incorrect or the page may have moved.</p><Link to="/dashboard" className="button button-primary">Go to dashboard</Link></div></div>;
}
