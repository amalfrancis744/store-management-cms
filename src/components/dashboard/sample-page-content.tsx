import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BarChart, LineChart, PieChart } from 'lucide-react';

export function SamplePageContent() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Sample Page</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sample Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="table">
              <TabsList className="mb-4">
                <TabsTrigger value="table" className="flex items-center gap-2">
                  <BarChart className="h-4 w-4" />
                  Table
                </TabsTrigger>
                <TabsTrigger value="charts" className="flex items-center gap-2">
                  <LineChart className="h-4 w-4" />
                  Charts
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Statistics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="table">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">
                            MNT-{1000 + i}
                          </TableCell>
                          <TableCell>User {i + 1}</TableCell>
                          <TableCell>user{i + 1}@example.com</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                i % 3 === 0
                                  ? 'bg-green-100 text-green-800'
                                  : i % 3 === 1
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {i % 3 === 0
                                ? 'Active'
                                : i % 3 === 1
                                  ? 'Pending'
                                  : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-600"
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="charts">
                <div className="flex h-[300px] items-center justify-center rounded-md border">
                  <p className="text-gray-500">
                    Chart visualization would appear here
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="stats">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-md border p-4">
                    <div className="text-sm font-medium text-gray-500">
                      Total Users
                    </div>
                    <div className="mt-1 text-3xl font-bold">12,345</div>
                  </div>
                  <div className="rounded-md border p-4">
                    <div className="text-sm font-medium text-gray-500">
                      Active Sessions
                    </div>
                    <div className="mt-1 text-3xl font-bold">1,234</div>
                  </div>
                  <div className="rounded-md border p-4">
                    <div className="text-sm font-medium text-gray-500">
                      Conversion Rate
                    </div>
                    <div className="mt-1 text-3xl font-bold">23.5%</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
