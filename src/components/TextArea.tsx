type TextAreaProps = {
  
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function TextArea({className, ...others}: TextAreaProps) {
  return (
    <>
      <textarea
        className={`}rounded p-1.5 border border-gray-300 border-1 rounded focus:border-gray-600 focus:outline-none disabled:bg-gray-500/20 disabled:text-gray-400 ${className ?? ''}`}
        {...others}
      ></textarea>
    </>
  );
}
