

type DividerProps = {
  
} & React.HTMLAttributes<HTMLDivElement>;

export default function Divider({className} : DividerProps) {
  return (
    <div className={`h-[1px] my-3 sm:my-5 bg-gray-700/10 ${className ?? ''}`}>
    </div>
  )
}
