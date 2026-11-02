import { Link } from "react-router-dom";
import { ShieldX } from "lucide-react";

export default function Unauthorized() {
  return (
    <div className="center-page">
      <div className="center-card">
        <span className="center-icon">
          <ShieldX size={25} />
        </span>
        <div className="eyebrow">ACCESS RESTRICTED</div>
        <h1>Admin access required</h1>
        <p>
          Your account can access voter pages, but it does not have the Super
          Admin role.
        </p>
        <Link to="/dashboard" className="button button-primary">
          Return to dashboard
        </Link>
      </div>
    </div>
  );
}
