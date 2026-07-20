import "./footer.css";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <span className="footer-copyright">© {year} Ingest Solution</span>
      </div>
    </footer>
  );
}
