import React from "react";
import {
  Search,
  Map,
  FileSearch,
  Download,
  TrendingUp,
  ArrowRight,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSystemHealth, useCodeSystems, useMappingQuality } from "../hooks/useApi";

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  // Fetch real data from APIs
  const { data: systemHealth, isLoading: healthLoading } = useSystemHealth();
  const { data: codeSystems, isLoading: codeSystemsLoading } = useCodeSystems();
  const { data: mappingQuality, isLoading: mappingLoading } = useMappingQuality();

  // Calculate stats from real data or show loading state
  const stats = React.useMemo(() => {
    if (healthLoading || codeSystemsLoading || mappingLoading) {
      return [
        { title: "NAMASTE Codes", value: "Loading...", change: "", trend: "up" },
        { title: "TM2 Codes", value: "Loading...", change: "", trend: "up" },
        { title: "Active Mappings", value: "Loading...", change: "", trend: "up" },
        { title: "System Status", value: "Loading...", change: "", trend: "up" },
      ];
    }

    return [
      { 
        title: "NAMASTE Codes", 
        value: codeSystems?.data?.entry?.filter((cs: any) => cs.resource?.url?.includes('namaste'))?.length?.toString() || "0", 
        change: "+127 this week", 
        trend: "up" 
      },
      { 
        title: "TM2 Codes", 
        value: codeSystems?.data?.entry?.filter((cs: any) => cs.resource?.url?.includes('icd11-tm2'))?.length?.toString() || "0", 
        change: "+43 this week", 
        trend: "up" 
      },
      { 
        title: "Active Mappings", 
        value: mappingQuality?.data?.overall?.totalMappings?.toString() || "0", 
        change: `${Math.round((mappingQuality?.data?.overall?.averageConfidence || 0) * 100)}% confidence`, 
        trend: "up" 
      },
      { 
        title: "System Health", 
        value: systemHealth?.data?.status === 'HEALTHY' ? "✓ Online" : "⚠ Issues", 
        change: systemHealth?.data?.uptime ? `${Math.floor(systemHealth.data.uptime / 3600)}h uptime` : "", 
        trend: systemHealth?.data?.status === 'HEALTHY' ? "up" : "down" 
      },
    ];
  }, [systemHealth, codeSystems, mappingQuality, healthLoading, codeSystemsLoading, mappingLoading]);

  const quickActions = [
    { title: "Code Lookup", description: "Search and browse medical codes", icon: Search, iconColor: "text-red-600", bgColor: "bg-red-50", page: "namaste-codes" },
    { title: "Mapping Explorer", description: "Explore code mappings between systems", icon: Map, iconColor: "text-green-600", bgColor: "bg-green-50", page: "mappings" },
    { title: "Smart Search", description: "Unified search across all systems", icon: FileSearch, iconColor: "text-orange-600", bgColor: "bg-orange-50", page: "namaste-codes" },
    { title: "Bulk Downloads", description: "Download FHIR data in bulk", icon: Download, iconColor: "text-yellow-600", bgColor: "bg-yellow-50", page: "downloads" },
    { title: "API Integration", description: "Test and verify API connections", icon: Shield, iconColor: "text-blue-600", bgColor: "bg-blue-50", page: "integration-test" },
  ];

  const handleActionClick = (page: string) => {
    if (onNavigate) onNavigate(page);
  };

  return (
    <div className="space-y-8 p-4">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Code Mapping Portal</h1>
        <p className="text-gray-500">
          Welcome to the FHIR Code Mapping Portal. Manage medical codes, mappings, and patient data
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className="card bg-base-100 shadow"
            whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="card-body p-4">
              <h2 className="card-title text-sm text-gray-500">{stat.title}</h2>
              <p className="text-2xl font-bold">{stat.value}</p>
              <div className="flex items-center space-x-1 text-sm text-gray-400">
                {stat.trend === "up" && <TrendingUp className="w-3 h-3 text-green-600" />}
                <span>{stat.change}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={index}
                className="card bg-base-100 shadow cursor-pointer"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => handleActionClick(action.page)}
              >
                <div className="card-body p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${action.bgColor}`}>
                      <Icon className={`w-6 h-6 ${action.iconColor}`} stroke="currentColor" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </div>
                  </div>
                  <motion.div
                    className="flex items-center"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h3 className="card-title">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  New mapping created: NAMASTE-12847 → ICD-11-MG30
                </p>
                <p className="text-xs text-gray-400">2 hours ago</p>
              </div>
              <button className="btn btn-outline btn-sm">View</button>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Batch upload completed: 43 new TM2 codes
                </p>
                <p className="text-xs text-gray-400">5 hours ago</p>
              </div>
              <button className="btn btn-outline btn-sm">View</button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Admin audit: Code validation completed
                </p>
                <p className="text-xs text-gray-400">1 day ago</p>
              </div>
              <button className="btn btn-outline btn-sm">View</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}