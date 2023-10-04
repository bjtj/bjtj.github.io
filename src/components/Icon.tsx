type IconProps = React.HTMLAttributes<HTMLDivElement> & {
  children: string;
};

export default function Icon({className, children, ...others}: IconProps) {
  return (
    <div className={`material-icons pointer-events-none !leading-none ${className ?? ''}`} {...others}>
      {children}
    </div>
  );
}
