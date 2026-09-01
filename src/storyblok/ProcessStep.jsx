export default function ProcessStep({ blok }) {
  return (
    <li className="sb-process__step">
      <div className="sb-process__step-body">
        {blok.title && <h3 className="sb-process__step-title">{blok.title}</h3>}
        {blok.description && <p className="sb-process__step-desc">{blok.description}</p>}
      </div>
    </li>
  );
}
