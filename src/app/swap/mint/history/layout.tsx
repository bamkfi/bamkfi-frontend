import Navigation from "@/components/navigation";

export default function MintHistoryLayout({ children } : { children: React.ReactNode }) {
	return (
        <>
            <nav className="relative flex items-center justify-center mb-2 h-12">
                <div className="absolute left-1/2 transform -translate-x-1/2">
                    <Navigation links={[{ href: "/swap/mint/history", name: 'History'}]} />
                </div>
            </nav>
            {children}
        </>
		)
};
