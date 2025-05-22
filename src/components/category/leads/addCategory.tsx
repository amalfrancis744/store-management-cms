import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

interface AddCategoryProps {
  onAddCategory: (category: { name: string; description: string }) => void;
}

export function AddCategory({ onAddCategory }: AddCategoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    onAddCategory({ name, description });
    resetForm();
    setIsOpen(false);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setError(null);
  };

  const openModal = () => {
    resetForm();
    setIsOpen(true);
  };

  return (
    <>
      <Button onClick={openModal} className="gap-2">
        <Plus className="h-4 w-4 mr-2" /> Add Category
      </Button>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                <Plus className="h-4 w-4 text-green-600" />
              </div>
              Add New Category
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Category Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter category name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (e.target.value.trim()) setError(null);
                }}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Enter category description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700"
            >
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
