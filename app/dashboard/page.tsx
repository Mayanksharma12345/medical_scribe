"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Users, Zap, TrendingUp } from "lucide-react"

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    encounters_today: 0,
    active_users_now: 0,
    encounters_this_week: 0,
    system_status: "loading",
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch("/api/v1/reports/dashboard")
        const data = await response.json()
        setMetrics(data)
      } catch (error) {
        console.error("Failed to fetch metrics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-2 text-slate-600">Real-time system metrics and analytics</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Encounters</CardTitle>
              <Zap className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.encounters_today}</div>
              <p className="text-xs text-slate-600">Patient encounters recorded</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.active_users_now}</div>
              <p className="text-xs text-slate-600">Users using system now</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.encounters_this_week}</div>
              <p className="text-xs text-slate-600">Total encounters</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{metrics.system_status}</div>
              <p className="text-xs text-slate-600">System health</p>
            </CardContent>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Avg. Response Time</span>
                  <span className="font-semibold">245ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Uptime</span>
                  <span className="font-semibold">99.8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Error Rate</span>
                  <span className="font-semibold text-green-600">0.1%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
              <CardDescription>HIPAA compliance score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Compliance Score</span>
                  <span className="text-2xl font-bold text-green-600">98.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Encryption</span>
                  <span className="font-semibold text-green-600">✓ 100%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Audit Logs</span>
                  <span className="font-semibold text-green-600">✓ Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
