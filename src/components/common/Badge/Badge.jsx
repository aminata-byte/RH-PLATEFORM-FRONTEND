import "./Badge.css";

function Badge({ children, status = "default" }) {
  return <span className={`badge badge-${status}`}>{children}</span>;
}

export default Badge;
