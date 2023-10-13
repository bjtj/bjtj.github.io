type SpinnerProps = {
  stroke?: string;
  fill?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | null | undefined;
};

export default function Spinner ({ size, stroke, fill }: SpinnerProps) {
  let sz = size ?? 'md';
  let w = sz === 'sm' ? 16 : sz === 'md' ? 24 : sz === 'lg' ? 32 : 48;
  let strokeStyle = stroke ?? 'stroke-black';
  let fillStyle = fill ?? 'fill-black';
  
  return (
    <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width={w} height={w}>
      <circle className={`opacity-25 ${strokeStyle}`} cx="12" cy="12" r="10" strokeWidth="4"></circle>
      <path className={`opacity-75 ${fillStyle}`} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  )
}
