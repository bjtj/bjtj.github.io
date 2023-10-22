import React, { ButtonHTMLAttributes } from 'react';
import Icon from './Icon';
import Spinner from './Spinner';


type ButtonVariant = 'xl' | 'lg' | 'md' | 'sm' | undefined | null;

type ButtonProps = {
  icon?: string;
  variant?: ButtonVariant;
  processing?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const buttonvars = {
  'xl': 'px-3 py-1.5 text-xl',
  'lg': 'px-3 py-1.5 text-lg',
  'md': 'px-3 py-1 text-base',
  'sm': 'px-1 py-0.5 text-sm',
}

const iconvars = {
  'xl': '!text-xl',
  'lg': '!text-lg',
  'md': '!text-base',
  'sm': '!text-sm',
}

export default function Button({ icon, className, variant, processing, children, ...others }: ButtonProps) {
  const vr = buttonvars[variant ?? 'md'];
  const ir = iconvars[variant ?? 'md'];

  return (
    <button
      className={`my-1 ring-0 outline-none
border border-1 border-black border-r-2 border-b-2 rounded-md
focus:ring focus:ring-2
enabled:bg-white/90
enabled:hover:bg-gray-100/90 enabled:hover:shadow-md enabled:hover:ring-1 enabled:hover:ring-black
enabled:active:bg-gray-300/75 enabled:active:translate-y-[1px] enabled:active:shadow-none
disabled:bg-gray-500/20 disabled:text-gray-400 disabled:border-gray-500
flex gap-1 items-center justify-center ${vr} ${className}`}
      {...others}>
      { processing ? (<Spinner size="sm" />) : (icon && (<Icon className={ir}>{icon}</Icon>)) }
      {children}
    </button>
  )
}
