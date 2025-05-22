import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ColorContent() {
  const colorGroups = [
    {
      name: 'Blue',
      colors: [
        {
          name: 'blue-50',
          hex: '#eff6ff',
          bg: 'bg-blue-50',
          text: 'text-blue-900',
        },
        {
          name: 'blue-100',
          hex: '#dbeafe',
          bg: 'bg-blue-100',
          text: 'text-blue-900',
        },
        {
          name: 'blue-200',
          hex: '#bfdbfe',
          bg: 'bg-blue-200',
          text: 'text-blue-900',
        },
        {
          name: 'blue-300',
          hex: '#93c5fd',
          bg: 'bg-blue-300',
          text: 'text-blue-900',
        },
        {
          name: 'blue-400',
          hex: '#60a5fa',
          bg: 'bg-blue-400',
          text: 'text-white',
        },
        {
          name: 'blue-500',
          hex: '#3b82f6',
          bg: 'bg-blue-500',
          text: 'text-white',
        },
        {
          name: 'blue-600',
          hex: '#2563eb',
          bg: 'bg-blue-600',
          text: 'text-white',
        },
        {
          name: 'blue-700',
          hex: '#1d4ed8',
          bg: 'bg-blue-700',
          text: 'text-white',
        },
        {
          name: 'blue-800',
          hex: '#1e40af',
          bg: 'bg-blue-800',
          text: 'text-white',
        },
        {
          name: 'blue-900',
          hex: '#1e3a8a',
          bg: 'bg-blue-900',
          text: 'text-white',
        },
      ],
    },
    {
      name: 'Gray',
      colors: [
        {
          name: 'gray-50',
          hex: '#f9fafb',
          bg: 'bg-gray-50',
          text: 'text-gray-900',
        },
        {
          name: 'gray-100',
          hex: '#f3f4f6',
          bg: 'bg-gray-100',
          text: 'text-gray-900',
        },
        {
          name: 'gray-200',
          hex: '#e5e7eb',
          bg: 'bg-gray-200',
          text: 'text-gray-900',
        },
        {
          name: 'gray-300',
          hex: '#d1d5db',
          bg: 'bg-gray-300',
          text: 'text-gray-900',
        },
        {
          name: 'gray-400',
          hex: '#9ca3af',
          bg: 'bg-gray-400',
          text: 'text-white',
        },
        {
          name: 'gray-500',
          hex: '#6b7280',
          bg: 'bg-gray-500',
          text: 'text-white',
        },
        {
          name: 'gray-600',
          hex: '#4b5563',
          bg: 'bg-gray-600',
          text: 'text-white',
        },
        {
          name: 'gray-700',
          hex: '#374151',
          bg: 'bg-gray-700',
          text: 'text-white',
        },
        {
          name: 'gray-800',
          hex: '#1f2937',
          bg: 'bg-gray-800',
          text: 'text-white',
        },
        {
          name: 'gray-900',
          hex: '#111827',
          bg: 'bg-gray-900',
          text: 'text-white',
        },
      ],
    },
    {
      name: 'Amber',
      colors: [
        {
          name: 'amber-50',
          hex: '#fffbeb',
          bg: 'bg-amber-50',
          text: 'text-amber-900',
        },
        {
          name: 'amber-100',
          hex: '#fef3c7',
          bg: 'bg-amber-100',
          text: 'text-amber-900',
        },
        {
          name: 'amber-200',
          hex: '#fde68a',
          bg: 'bg-amber-200',
          text: 'text-amber-900',
        },
        {
          name: 'amber-300',
          hex: '#fcd34d',
          bg: 'bg-amber-300',
          text: 'text-amber-900',
        },
        {
          name: 'amber-400',
          hex: '#fbbf24',
          bg: 'bg-amber-400',
          text: 'text-amber-900',
        },
        {
          name: 'amber-500',
          hex: '#f59e0b',
          bg: 'bg-amber-500',
          text: 'text-white',
        },
        {
          name: 'amber-600',
          hex: '#d97706',
          bg: 'bg-amber-600',
          text: 'text-white',
        },
        {
          name: 'amber-700',
          hex: '#b45309',
          bg: 'bg-amber-700',
          text: 'text-white',
        },
        {
          name: 'amber-800',
          hex: '#92400e',
          bg: 'bg-amber-800',
          text: 'text-white',
        },
        {
          name: 'amber-900',
          hex: '#78350f',
          bg: 'bg-amber-900',
          text: 'text-white',
        },
      ],
    },
  ];

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Color Palette</h1>

      <div className="grid gap-6">
        {colorGroups.map((group) => (
          <Card key={group.name}>
            <CardHeader>
              <CardTitle>{group.name} Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {group.colors.map((color) => (
                  <div
                    key={color.name}
                    className="flex flex-col overflow-hidden rounded-md border"
                  >
                    <div className={`h-20 ${color.bg}`}></div>
                    <div className="p-3">
                      <div className="font-medium">{color.name}</div>
                      <div className="text-sm text-gray-500">{color.hex}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
