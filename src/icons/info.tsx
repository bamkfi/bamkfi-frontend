import React, { FC, ReactElement, MouseEvent } from 'react';

const InfoIcon: FC<{
    className?: string;
    width?: number;
    height?: number;
    onClick?: (evt: MouseEvent) => void;
}> = (props): ReactElement => {
    return (
        <svg
            onClick={props.onClick}
            viewBox="0 0 24 24"
            fill="none"
            className={props.className}
            width={props.width}
            height={props.height}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v2h-2V7zm0 4h2v7h-2v-7z"
                fill="#444444"
            />
        </svg>
    );
};

export default InfoIcon;