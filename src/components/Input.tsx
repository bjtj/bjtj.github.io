type InputProps = {
  
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({type, className, ...others}: InputProps) {
  return (
    <input className={`border border-gray-400 px-2 py-1 rounded disabled:bg-gray-500/20 disabled:text-gray-400 ${className ?? ''}`} type={type ?? 'text'} {...others} />
  )
}
