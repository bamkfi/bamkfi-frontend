declare module 'react-fitty' {
    const ReactFitty: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & {
        children?: React.ReactNode;
        minSize?: number | undefined;
        maxSize?: number | undefined;
        wrapText?: boolean | undefined;
    } & React.RefAttributes<HTMLElement>>;
    export { ReactFitty };
}

declare module 'connectkit-next-siwe';
