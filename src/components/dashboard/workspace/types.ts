import * as z from 'zod';

// Define the workspace schema
export const workspaceSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(3, { message: 'Workspace name must be at least 3 characters' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters' }),
  images: z.array(z.string()).default([]),
  openingTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Opening time must be in 24-hour format (HH:MM)',
  }),
  closingTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Closing time must be in 24-hour format (HH:MM)',
  }),
});

export type Workspace = z.infer<typeof workspaceSchema>;
