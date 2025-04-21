import React from 'react';
import Header from './header';
import Sidebar from './sidebar';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) => {
    return (
        <div className="flex h-screen bg-grey-50">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 overflow-auto p-4">
                    {children}
                </main>
            </div>

            {/* Right Sidebar */}
            <RightSidebar />
        </div>
    );
}