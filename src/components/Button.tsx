import React, { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'xl' | 'lg' | 'md' | 'sm' | undefined | null;

type ButtonProps = {
    variant?: ButtonVariant;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const buttonvars = {
    'xl': 'text-xl',
    'lg': 'text-lg',
    'md': 'text-md',
    'sm': 'text-sm',
}

export default function Button({ className, variant, children, ...others }: ButtonProps) {

    const vr = buttonvars[variant ?? 'md'];

    return (
        <button
          className={`px-3 my-1 py-1.5 ring-0 outline-none border border-1 border-black border-r-2 border-b-2 rounded-md
focus:ring focus:ring-2
enabled:bg-white/70
enabled:hover:bg-gray-100/90 enabled:hover:shadow-md enabled:hover:ring-1 enabled:hover:ring-black
enabled:active:bg-gray-300/75 enabled:active:translate-y-[1px] enabled:active:shadow-none
disabled:bg-gray-500/20 disabled:text-gray-400 disabled:border-gray-500
flex gap-1 items-center justify-center ${vr} ${className}`}
            {...others}>{children}</button>
    )
}
