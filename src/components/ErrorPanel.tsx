type ErrorPanelProps = {
  className?: string;
  error?: string;
  label?: string;
};

export default function ErrorPanel({ className, error, label } : ErrorPanelProps) {

  const title = label && (<h2>{label}</h2>);
  
  return (
    <>
    { error && (
      <>
        {title}
        <pre className={`p-3 text-red-600 ring ring-1 ring-red-600 bg-red-300/20 whitespace-pre-wrap overflow-auto ${className ?? ''}`}>{error}</pre>
      </>
    ) }
    </>);
}
