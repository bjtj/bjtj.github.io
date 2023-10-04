import React, { ButtonHTMLAttributes } from 'react';

type ButtonProps = {
  
} & ButtonHTMLAttributes<HTMLButtonElement>;


export default function Button({ className, children, ...others }: ButtonProps) {
  return (
    <button
      className={`px-3 py-1.5 ring ring-1 ring-black rounded disabled:bg-gray-500/20 disabled:text-gray-400 disabled:ring-gray-500 flex gap-1 items-center justify-center ${className}`}
      {...others}>{children}</button>
  )
}
