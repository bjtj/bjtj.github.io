import { useState, forwardRef, ImgHTMLAttributes } from 'react';
import { createPortal } from 'react-dom';

type ImageProps = {
  enableFullscreen?: boolean;
  fullscreenClassName?: string;
} & ImgHTMLAttributes<HTMLImageElement>;


const Image = forwardRef<HTMLImageElement, ImageProps>(
  (props, ref) => {
    const { enableFullscreen, fullscreenClassName, onClick, ...opts } = props;
    const [showFullscreen, setShowFullscreen] = useState<boolean>(false);
    return (
      <>
        <img
          ref={ref}
          onClick={e => {
            if (enableFullscreen) {
              setShowFullscreen(true);
            }
            onClick?.(e);
          }}
          {...opts} />
        {
          showFullscreen && (
            createPortal((
              <div
                className="fixed inset-0 bg-black/40 flex justify-center items-center"
                onClick={() => setShowFullscreen(false)}>
                <img className={`${fullscreenClassName ?? ''}`} {...opts} />
              </div>), document.body)
          )
        }
      </>
    );
});

export default Image;
