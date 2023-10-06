type InputProps = {
  
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({type, className, ...others}: InputProps) {
  return (
    <input className={`border border-gray-400 px-2 py-1 rounded ${className ?? ''}`} type={type ?? 'text'} {...others} />
  )
}
