import { forwardRef } from 'react';

type positions = 'top' | 'middle' | 'bottom' | 'start' | 'end';

export type ModalProps = React.DialogHTMLAttributes<HTMLDialogElement> & {
  title?: string;
  backdrop?: boolean,
  position?: positions;
};

function positionToClassName(position: positions|null|undefined) {
  switch (position) {
    case 'top': return 'modal-top';
    case 'middle': return 'modal-middle';
    case 'bottom': return 'modal-bottom';
    case 'start': return 'modal-start';
    case 'end': return 'modal-end';
  }
  return null;
}

const Modal = forwardRef<HTMLDialogElement, ModalProps>(
  ({ className, title, position, backdrop, children, ...props }, ref) => {
    const posClass = positionToClassName(position);
    const containerClasses = `modal ${posClass}`;
    const bodyClasses = `modal-box ${className}`;
    return (
      <dialog {...props} className={containerClasses} ref={ref}>
        <div className={bodyClasses}>
          <h2 className="w-full mb-8 text-xl font-bold">
            {title}
          </h2>
          <div className="">
            {children}
          </div>
          {/*
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
            </div>
            */}
        </div>
        {backdrop && (
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>)}
      </dialog>
    );
  });

export default Modal;
