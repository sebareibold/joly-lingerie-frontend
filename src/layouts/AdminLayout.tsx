"use client";

import type React from "react";
import { Outlet } from "react-router-dom";
import { Suspense, useState, useCallback, useEffect } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import BackendStatus from "../components/admin/BackendStatus";

// Skeleton component for loading states
const AdminPageSkeleton = () => (
  <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-pulse">
    {/* Header skeleton */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div className="h-6 sm:h-8 bg-gray-700/50 rounded-lg w-48 sm:w-64 mb-2"></div>
        <div className="h-3 sm:h-4 bg-gray-700/30 rounded w-64 sm:w-96"></div>
      </div>
    </div>

    {/* Content skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-gray-800/40 border border-gray-700/30 rounded-xl p-4 sm:p-6"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700/50 rounded-xl mr-3 sm:mr-4"></div>
            <div className="flex-1">
              <div className="h-4 sm:h-6 bg-gray-700/50 rounded w-12 sm:w-16 mb-2"></div>
              <div className="h-3 sm:h-4 bg-gray-700/30 rounded w-16 sm:w-24"></div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Large content skeleton */}
    <div className="bg-gray-800/40 border border-gray-700/30 rounded-xl p-4 sm:p-6">
      <div className="h-4 sm:h-6 bg-gray-700/50 rounded w-32 sm:w-48 mb-4"></div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 sm:h-16 bg-gray-700/30 rounded-lg"></div>
        ))}
      </div>
    </div>
  </div>
);

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return isMobile;
};

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();

  const handleSidebarToggle = useCallback((isOpen: boolean) => {
    setIsSidebarOpen(isOpen);
  }, []);

  const handleSidebarCollapse = useCallback((isCollapsed: boolean) => {
    setIsSidebarCollapsed(isCollapsed);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={handleSidebarToggle}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={handleSidebarCollapse}
      />

      <div
        className={`transition-all duration-300 ease-in-out pt-16 lg:pt-0 ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <main className="p-3 sm:p-4 lg:p-6 lg:px-36 lg:px-36">
          {/* Enhanced System Status Container */}
          {!isMobile && (
            <>
              <div className="mb-4 sm:mb-6 relative overflow-hidden rounded-xl sm:rounded-2xl transition-all duration-500 ease-in-out hover:scale-[1.01] hover:shadow-xl hover:shadow-black/20 backdrop-blur-sm bg-gradient-to-br from-slate-800/40 via-slate-700/30 to-slate-600/20 border border-slate-600/30">
                <div className="absolute inset-0 opacity-30">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `radial-gradient(circle at 25% 25%, rgba(148, 163, 184, 0.1) 1px, transparent 1px)`,
                      backgroundSize: "30px 30px",
                    }}
                  />
                </div>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/60 via-purple-500/60 to-emerald-500/60" />
                <div className="relative z-10 p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-100 mb-1">
                          Estado del Sistema
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-400">
                          Monitoreo en tiempo real del Servidor
                        </p>
                      </div>
                    </div>
                    <div className="w-full lg:max-w-md">
                      <Suspense
                        fallback={
                          <div className="h-8 sm:h-10 bg-gray-700/30 rounded-lg animate-pulse"></div>
                        }
                      >
                        <BackendStatus className="w-full" />
                      </Suspense>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Main content with smooth transitions */}
          <div className="transition-all duration-300 ease-in-out sm:mt-10">
            <Suspense fallback={<AdminPageSkeleton />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
