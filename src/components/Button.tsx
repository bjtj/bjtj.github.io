import React, { ButtonHTMLAttributes } from 'react';

type ButtonProps = {
    
} & ButtonHTMLAttributes<HTMLButtonElement>;


export default function Button({ className, children, ...others }: ButtonProps) {
    return (
        <button
            className={`px-3 my-1 py-1.5 ring-0 outline-none border border-1 border-black border-r-2 border-b-2 rounded-md
enabled:hover:bg-gray-100 enabled:hover:shadow-md enabled:hover:ring-1 enabled:hover:ring-black
enabled:active:bg-gray-300/75 enabled:active:translate-y-[1px] enabled:active:shadow-none
disabled:bg-gray-500/20 disabled:text-gray-400 disabled:border-gray-500
flex gap-1 items-center justify-center ${className}`}
            {...others}>{children}</button>
    )
}
