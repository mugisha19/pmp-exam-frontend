/**
 * Dashboard Page
 * Student dashboard with overview and activities
 */

import StudentLayout from "@/components/layouts/StudentLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BarChart3, BookOpen, Trophy, Clock } from "lucide-react";

export const DashboardPage = () => {
  return (
    <StudentLayout
      title="Dashboard"
      subtitle="Welcome back! Here's an overview of your activities."
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card hover>
          <CardContent padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Exams</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">24</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">18</p>
              </div>
              <div className="p-3 bg-green-600/20 rounded-xl">
                <Trophy className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average Score</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">85%</p>
              </div>
              <div className="p-3 bg-blue-600/20 rounded-xl">
                <BarChart3 className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Study Time</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">42h</p>
              </div>
              <div className="p-3 bg-yellow-600/20 rounded-xl">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Exams</CardTitle>
            <CardDescription>Your latest exam attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      PMP Practice Exam {item}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">2 days ago</p>
                  </div>
                  <Badge variant="success">Passed</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Exams</CardTitle>
            <CardDescription>Scheduled exams and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      Final Assessment {item}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Due in 3 days</p>
                  </div>
                  <Badge variant="warning">Pending</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
};

export default DashboardPage;
