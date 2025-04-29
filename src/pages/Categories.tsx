
import React, { useState } from 'react';
import { useEquipment } from '@/contexts/EquipmentContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { EquipmentCategory } from '@/types';

const Categories = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useEquipment();
  const { toast } = useToast();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [newCategory, setNewCategory] = useState<Omit<EquipmentCategory, 'id'>>({
    name: '',
    description: ''
  });
  
  const [editingCategory, setEditingCategory] = useState<EquipmentCategory | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required.",
        variant: "destructive"
      });
      return;
    }
    
    if (categories.some(c => c.name.toLowerCase() === newCategory.name.toLowerCase())) {
      toast({
        title: "Error",
        description: "A category with this name already exists.",
        variant: "destructive"
      });
      return;
    }
    
    addCategory(newCategory);
    setNewCategory({ name: '', description: '' });
    setIsAddDialogOpen(false);
  };

  const handleEditCategory = () => {
    if (!editingCategory) return;
    
    if (!editingCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required.",
        variant: "destructive"
      });
      return;
    }
    
    if (categories.some(c => 
      c.id !== editingCategory.id && 
      c.name.toLowerCase() === editingCategory.name.toLowerCase()
    )) {
      toast({
        title: "Error",
        description: "A category with this name already exists.",
        variant: "destructive"
      });
      return;
    }
    
    updateCategory(editingCategory.id, editingCategory);
    setEditingCategory(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteCategory = () => {
    if (!deletingCategoryId) return;
    
    deleteCategory(deletingCategoryId);
    setDeletingCategoryId(null);
    setIsDeleteDialogOpen(false);
  };

  const openEditDialog = (category: EquipmentCategory) => {
    setEditingCategory({...category});
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (categoryId: string) => {
    setDeletingCategoryId(categoryId);
    setIsDeleteDialogOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Equipment Categories</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            Add Category
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4">
            <p className="text-gray-600 mb-4">
              Manage equipment categories to better organize your inventory. Categories help staff find equipment more easily.
            </p>
            
            {categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No categories found. Click "Add Category" to create your first category.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-1/2">Description</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.description}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(category)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => openDeleteDialog(category.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Category Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                placeholder="e.g., Diagnostic Equipment"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={newCategory.description}
                onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                placeholder="Provide a brief description of this category"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          
          {editingCategory && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-name" className="text-sm font-medium">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="edit-name"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="edit-description"
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCategory}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>
              Are you sure you want to delete this category? 
              This action cannot be undone.
            </p>
            <p className="mt-2 text-gray-500">
              Note: Categories that are currently assigned to equipment cannot be deleted.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>
              Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Categories;
