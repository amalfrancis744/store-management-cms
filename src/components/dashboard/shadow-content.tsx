import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ShadowContent() {
  const shadows = [
    { name: 'shadow-sm', class: 'shadow-sm', description: 'Small shadow' },
    { name: 'shadow', class: 'shadow', description: 'Default shadow' },
    { name: 'shadow-md', class: 'shadow-md', description: 'Medium shadow' },
    { name: 'shadow-lg', class: 'shadow-lg', description: 'Large shadow' },
    {
      name: 'shadow-xl',
      class: 'shadow-xl',
      description: 'Extra large shadow',
    },
    {
      name: 'shadow-2xl',
      class: 'shadow-2xl',
      description: '2x extra large shadow',
    },
    {
      name: 'shadow-inner',
      class: 'shadow-inner',
      description: 'Inner shadow',
    },
    { name: 'shadow-none', class: 'shadow-none', description: 'No shadow' },
  ];

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Shadow Styles</h1>

      <Card>
        <CardHeader>
          <CardTitle>Tailwind Shadow Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {shadows.map((shadow) => (
              <div
                key={shadow.name}
                className="flex flex-col items-center gap-3"
              >
                <div
                  className={`flex h-24 w-24 items-center justify-center rounded-lg bg-white ${shadow.class}`}
                >
                  <span className="text-sm font-medium">{shadow.name}</span>
                </div>
                <div className="text-center">
                  <div className="font-medium">{shadow.name}</div>
                  <div className="text-sm text-gray-500">
                    {shadow.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
