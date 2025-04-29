
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useEquipment } from '@/contexts/EquipmentContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const NewReport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { equipment, reportDamage } = useEquipment();
  const { toast } = useToast();
  
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEquipmentId) {
      toast({
        title: "Error",
        description: "Please select an equipment item.",
        variant: "destructive"
      });
      return;
    }
    
    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Please provide a description of the damage.",
        variant: "destructive"
      });
      return;
    }
    
    reportDamage({
      equipmentId: selectedEquipmentId,
      reporterId: user.id,
      reporterName: user.name,
      reportDate: new Date().toISOString(),
      description,
      notes: ''
    });
    
    navigate('/reports');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Report Equipment Damage</h1>
          <Button variant="outline" onClick={() => navigate('/reports')}>
            Cancel
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="equipment" className="block text-sm font-medium text-gray-700">
                Select Equipment <span className="text-red-500">*</span>
              </label>
              <Select
                value={selectedEquipmentId}
                onValueChange={setSelectedEquipmentId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  {equipment
                    .filter(item => item.status !== 'damaged')
                    .map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} - {item.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Damage Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the damage or malfunction in detail"
                rows={5}
                required
              />
              <p className="text-xs text-gray-500">
                Please be specific about the issues you've observed. Include information about when the problem started and any error messages or sounds.
              </p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => navigate('/reports')}
              >
                Cancel
              </Button>
              <Button type="submit">
                Submit Report
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default NewReport;
