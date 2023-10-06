type TextAreaProps = {
    
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function TextArea({className, ...others}: TextAreaProps) {
    return (
        <>
            <textarea
                className={`}rounded p-1.5 border border-gray-400 border-1 rounded ${className ?? ''}`}
                {...others}
            ></textarea>
        </>
    );
}
