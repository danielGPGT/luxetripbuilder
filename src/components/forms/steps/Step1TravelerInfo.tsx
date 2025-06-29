import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Users, 
  Plane, 
  Bed, 
  Car, 
  Plus, 
  Trash2, 
  Settings,
  UserPlus,
  Group,
  Search,
  CheckCircle,
  Mail,
  Phone,
  Building2,
  MapPin,
  Sparkles,
  AlertCircle
} from "lucide-react";
import ClientSelector from '@/components/crm/ClientSelector';
import { CRMService } from '@/lib/crmService';
import { Client } from '@/types/crm';
import { TripIntake, IndividualTraveler, TravelerGroup } from '@/types/trip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Step1TravelerInfoProps {
  disabled?: boolean;
}

export function Step1TravelerInfo({ disabled }: Step1TravelerInfoProps) {
  const form = useFormContext<TripIntake>();
  const [clientMode, setClientMode] = useState<'select' | 'create'>('select');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [showAdvancedGrouping, setShowAdvancedGrouping] = useState(false);
  const [editingTraveler, setEditingTraveler] = useState<string | null>(null);

  // Form state for new client creation
  const [newClientData, setNewClientData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    notes: ''
  });

  const totalTravelers = (form.watch('travelerInfo.travelers.adults') || 0) + (form.watch('travelerInfo.travelers.children') || 0);
  const individualTravelers = form.watch('travelerInfo.individualTravelers') || [];
  const travelerGroups = form.watch('travelerInfo.travelerGroups') || [];

  // Auto-fill form when client is selected
  useEffect(() => {
    if (selectedClient) {
      // Set client ID for quote creation
      form.setValue('clientId', selectedClient.id);
      
      // Auto-fill traveler info from client data
      form.setValue('travelerInfo.name', `${selectedClient.firstName} ${selectedClient.lastName}`);
      form.setValue('travelerInfo.email', selectedClient.email || '');
      form.setValue('travelerInfo.phone', selectedClient.phone || '');
      
      if (selectedClient.address) {
        form.setValue('travelerInfo.address.street', selectedClient.address.street || '');
        form.setValue('travelerInfo.address.city', selectedClient.address.city || '');
        form.setValue('travelerInfo.address.state', selectedClient.address.state || '');
        form.setValue('travelerInfo.address.zipCode', selectedClient.address.zipCode || '');
        form.setValue('travelerInfo.address.country', selectedClient.address.country || '');
      }
    }
  }, [selectedClient, form]);

  const handleClientSelect = (client: Client | null) => {
    setSelectedClient(client);
    if (client) {
      // Set client ID for quote creation
      form.setValue('clientId', client.id);
      
      // Auto-fill traveler info from client data
      const fullName = `${client.firstName} ${client.lastName}`;
      form.setValue('travelerInfo.name', fullName);
      form.setValue('travelerInfo.email', client.email || '');
      form.setValue('travelerInfo.phone', client.phone || '');
      
      console.log('Setting form values for client:', {
        clientId: client.id,
        name: fullName,
        email: client.email,
        phone: client.phone
      });
      
      if (client.address) {
        form.setValue('travelerInfo.address.street', client.address.street || '');
        form.setValue('travelerInfo.address.city', client.address.city || '');
        form.setValue('travelerInfo.address.state', client.address.state || '');
        form.setValue('travelerInfo.address.zipCode', client.address.zipCode || '');
        form.setValue('travelerInfo.address.country', client.address.country || '');
      }
    } else {
      // Clear form when no client is selected
      form.setValue('clientId', '');
      form.setValue('travelerInfo.name', '');
      form.setValue('travelerInfo.email', '');
      form.setValue('travelerInfo.phone', '');
      form.setValue('travelerInfo.address.street', '');
      form.setValue('travelerInfo.address.city', '');
      form.setValue('travelerInfo.address.state', '');
      form.setValue('travelerInfo.address.zipCode', '');
      form.setValue('travelerInfo.address.country', '');
    }
  };

  const handleCreateClient = async () => {
    if (!newClientData.firstName || !newClientData.lastName || !newClientData.email) {
      return;
    }

    setIsCreatingClient(true);
    try {
      const newClient = await CRMService.createClient(newClientData);
      setSelectedClient(newClient);
      handleClientSelect(newClient);
      
      // Force form validation to clear after setting values
      await form.trigger(['travelerInfo.name', 'travelerInfo.email', 'travelerInfo.phone']);
      
      setClientMode('select');
      setNewClientData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        notes: ''
      });
    } catch (error) {
      console.error('Error creating client:', error);
    } finally {
      setIsCreatingClient(false);
    }
  };

  const addIndividualTraveler = () => {
    const newTraveler: IndividualTraveler = {
      id: `traveler-${Date.now()}`,
      name: '',
      type: 'adult',
      preferences: {},
      groupAssignments: {}
    };
    
    const currentTravelers = form.getValues('travelerInfo.individualTravelers') || [];
    form.setValue('travelerInfo.individualTravelers', [...currentTravelers, newTraveler]);
  };

  const removeIndividualTraveler = (travelerId: string) => {
    const currentTravelers = form.getValues('travelerInfo.individualTravelers') || [];
    const updatedTravelers = currentTravelers.filter(t => t.id !== travelerId);
    form.setValue('travelerInfo.individualTravelers', updatedTravelers);
  };

  const updateTraveler = (travelerId: string, updates: Partial<IndividualTraveler>) => {
    const currentTravelers = form.getValues('travelerInfo.individualTravelers') || [];
    const updatedTravelers = currentTravelers.map(t => 
      t.id === travelerId ? { ...t, ...updates } : t
    );
    form.setValue('travelerInfo.individualTravelers', updatedTravelers);
  };

  const createTravelerGroup = (type: 'flight' | 'hotel' | 'transfer') => {
    const newGroup: TravelerGroup = {
      id: `group-${type}-${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Group`,
      type,
      travelers: [],
      preferences: {}
    };
    
    const currentGroups = form.getValues('travelerInfo.travelerGroups') || [];
    form.setValue('travelerInfo.travelerGroups', [...currentGroups, newGroup]);
  };

  const assignTravelerToGroup = (travelerId: string, groupId: string, groupType: 'flight' | 'hotel' | 'transfer') => {
    // Update traveler's group assignment
    updateTraveler(travelerId, {
      groupAssignments: {
        ...individualTravelers.find(t => t.id === travelerId)?.groupAssignments,
        [`${groupType}Group`]: groupId
      }
    });

    // Update group's traveler list
    const currentGroups = form.getValues('travelerInfo.travelerGroups') || [];
    const updatedGroups = currentGroups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          travelers: [...g.travelers, travelerId]
        };
      }
      return g;
    });
    form.setValue('travelerInfo.travelerGroups', updatedGroups);
  };

  const removeTravelerFromGroup = (travelerId: string, groupId: string, groupType: 'flight' | 'hotel' | 'transfer') => {
    // Remove from traveler's group assignment
    updateTraveler(travelerId, {
      groupAssignments: {
        ...individualTravelers.find(t => t.id === travelerId)?.groupAssignments,
        [`${groupType}Group`]: undefined
      }
    });

    // Remove from group's traveler list
    const currentGroups = form.getValues('travelerInfo.travelerGroups') || [];
    const updatedGroups = currentGroups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          travelers: g.travelers.filter(t => t !== travelerId)
        };
      }
      return g;
    });
    form.setValue('travelerInfo.travelerGroups', updatedGroups);
  };

  const getGroupIcon = (type: string) => {
    switch (type) {
      case 'flight': return <Plane className="h-4 w-4" />;
      case 'hotel': return <Bed className="h-4 w-4" />;
      case 'transfer': return <Car className="h-4 w-4" />;
      default: return <Group className="h-4 w-4" />;
    }
  };

  const getGroupColor = (type: string) => {
    switch (type) {
      case 'flight': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'hotel': return 'bg-green-100 text-green-800 border-green-200';
      case 'transfer': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Check if we have validation errors for traveler info
  const hasValidationErrors = form.formState.errors.travelerInfo?.name;

  if (disabled) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-card rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 bg-card rounded animate-pulse" />
          <div className="h-32 bg-card rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 bg-card rounded animate-pulse" />
          <div className="h-12 bg-card rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mx-auto space-y-8"
    >
      

      {/* Client Selection Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-b from-[var(--card)]/95 to-[var(--background)]/20 border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-[var(--card-foreground)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20">
                <Users className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <div className="text-lg font-semibold">Client Selection</div>
                <div className="text-sm font-normal text-[var(--muted-foreground)]">
                  Choose how to handle client information
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Mode Selection */}
            <div className="flex gap-3">
              <Button
                variant={clientMode === 'select' ? 'default' : 'outline'}
                onClick={() => setClientMode('select')}
                className={`flex-1 h-12 rounded-xl transition-all duration-200 ${
                  clientMode === 'select' 
                    ? 'bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)] shadow-md' 
                    : 'border-[var(--border)] hover:bg-[var(--accent)] hover:border-[var(--primary)]/30'
                }`}
              >
                <Search className="h-4 w-4 mr-2" />
                Select Existing Client
              </Button>
              
              <Button
                variant={clientMode === 'create' ? 'default' : 'outline'}
                onClick={() => setClientMode('create')}
                className={`flex-1 h-12 rounded-xl transition-all duration-200 ${
                  clientMode === 'create' 
                    ? 'bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)] shadow-md' 
                    : 'border-[var(--border)] hover:bg-[var(--accent)] hover:border-[var(--primary)]/30'
                }`}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create New Client
              </Button>
            </div>

            <AnimatePresence mode="wait">
              {clientMode === 'select' ? (
                <motion.div
                  key="select"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <ClientSelector
                    selectedClientId={selectedClient?.id}
                    onClientSelect={handleClientSelect}
                  />
                  
                  {selectedClient && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)]"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle className="h-5 w-5 text-[var(--primary)]" />
                        <span className="font-semibold text-[var(--foreground)]">Selected Client</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-[var(--muted-foreground)]" />
                          <span className="text-sm text-[var(--foreground)]">
                            {selectedClient.firstName} {selectedClient.lastName}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-[var(--muted-foreground)]" />
                          <span className="text-sm text-[var(--foreground)]">{selectedClient.email}</span>
                        </div>
                        
                        {selectedClient.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-[var(--muted-foreground)]" />
                            <span className="text-sm text-[var(--foreground)]">{selectedClient.phone}</span>
                          </div>
                        )}
                        
                        {selectedClient.company && (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-[var(--muted-foreground)]" />
                            <span className="text-sm text-[var(--foreground)]">{selectedClient.company}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="create"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-[var(--foreground)]">
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        value={newClientData.firstName}
                        onChange={(e) => setNewClientData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                        placeholder="Enter first name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-[var(--foreground)]">
                        Last Name *
                      </Label>
                      <Input
                        id="lastName"
                        value={newClientData.lastName}
                        onChange={(e) => setNewClientData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                        placeholder="Enter last name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-[var(--foreground)]">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={newClientData.email}
                        onChange={(e) => setNewClientData(prev => ({ ...prev, email: e.target.value }))}
                        className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                        placeholder="Enter email address"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-[var(--foreground)]">
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        value={newClientData.phone}
                        onChange={(e) => setNewClientData(prev => ({ ...prev, phone: e.target.value }))}
                        className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                        placeholder="Enter phone number"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-sm font-medium text-[var(--foreground)]">
                        Company (optional)
                      </Label>
                      <Input
                        id="company"
                        value={newClientData.company}
                        onChange={(e) => setNewClientData(prev => ({ ...prev, company: e.target.value }))}
                        className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                        placeholder="Enter company name"
                      />
                    </div>
                  </div>
                  
                  <Separator className="bg-[var(--border)]" />
                  
                  <div>
                    <h4 className="text-sm font-medium text-[var(--foreground)] mb-4">Address Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="street" className="text-sm font-medium text-[var(--foreground)]">
                          Street Address
                        </Label>
                        <Input
                          id="street"
                          value={newClientData.address.street}
                          onChange={(e) => setNewClientData(prev => ({ ...prev, address: { ...prev.address, street: e.target.value } }))}
                          className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                          placeholder="Enter street address"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-sm font-medium text-[var(--foreground)]">
                          City
                        </Label>
                        <Input
                          id="city"
                          value={newClientData.address.city}
                          onChange={(e) => setNewClientData(prev => ({ ...prev, address: { ...prev.address, city: e.target.value } }))}
                          className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                          placeholder="Enter city"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-sm font-medium text-[var(--foreground)]">
                          State/Province
                        </Label>
                        <Input
                          id="state"
                          value={newClientData.address.state}
                          onChange={(e) => setNewClientData(prev => ({ ...prev, address: { ...prev.address, state: e.target.value } }))}
                          className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                          placeholder="Enter state/province"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="zipCode" className="text-sm font-medium text-[var(--foreground)]">
                          ZIP/Postal Code
                        </Label>
                        <Input
                          id="zipCode"
                          value={newClientData.address.zipCode}
                          onChange={(e) => setNewClientData(prev => ({ ...prev, address: { ...prev.address, zipCode: e.target.value } }))}
                          className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                          placeholder="Enter ZIP/postal code"
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="country" className="text-sm font-medium text-[var(--foreground)]">
                          Country
                        </Label>
                        <Input
                          id="country"
                          value={newClientData.address.country}
                          onChange={(e) => setNewClientData(prev => ({ ...prev, address: { ...prev.address, country: e.target.value } }))}
                          className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                          placeholder="Enter country"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium text-[var(--foreground)]">
                      Notes
                    </Label>
                    <textarea
                      id="notes"
                      value={newClientData.notes}
                      onChange={(e) => setNewClientData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full h-20 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20 resize-none"
                      placeholder="Any additional notes about this client..."
                    />
                  </div>
                  
                  <Button
                    onClick={handleCreateClient}
                    disabled={isCreatingClient || !newClientData.firstName || !newClientData.lastName || !newClientData.email}
                    className="w-full h-12 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)] rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingClient ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-[var(--primary-foreground)]/30 border-t-[var(--primary-foreground)] rounded-full animate-spin" />
                        Creating Client...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Create Client
                      </div>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Status Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-between items-center pt-6"
      >
        <div className="text-sm text-[var(--muted-foreground)]">
          {selectedClient ? 'Client selected - ready to proceed' : 'Please select or create a client'}
        </div>
        
        <div className="flex items-center gap-2">
          {selectedClient && (
            <Badge variant="outline" className="bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20">
              <CheckCircle className="h-3 w-3 mr-1" />
              Ready
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Advanced Grouping Section */}
      {totalTravelers > 1 && (
        <>
          {/* Advanced Grouping Toggle */}
          <Card className="bg-gradient-to-b from-[var(--card)]/95 to-[var(--background)]/20 border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="advanced-grouping"
                    checked={showAdvancedGrouping}
                    onCheckedChange={(checked) => setShowAdvancedGrouping(checked as boolean)}
                    disabled={disabled}
                  />
                  <label htmlFor="advanced-grouping" className="text-sm font-medium text-[var(--foreground)]">
                    Advanced Group Preferences
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {totalTravelers} travelers
                  </Badge>
                  {totalTravelers === 3 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Create demo scenario: 3 people with mixed preferences
                        const demoTravelers = [
                          {
                            id: 'traveler-1',
                            name: 'John Smith',
                            type: 'adult' as const,
                            preferences: {
                              flightClass: 'business' as const,
                              hotelRoom: 'shared' as const,
                              transferType: 'shared' as const,
                            },
                            groupAssignments: {}
                          },
                          {
                            id: 'traveler-2',
                            name: 'Sarah Johnson',
                            type: 'adult' as const,
                            preferences: {
                              flightClass: 'business' as const,
                              hotelRoom: 'shared' as const,
                              transferType: 'shared' as const,
                            },
                            groupAssignments: {}
                          },
                          {
                            id: 'traveler-3',
                            name: 'Mike Wilson',
                            type: 'adult' as const,
                            preferences: {
                              flightClass: 'economy' as const,
                              hotelRoom: 'single' as const,
                              transferType: 'private' as const,
                            },
                            groupAssignments: {}
                          }
                        ];

                        const demoGroups = [
                          {
                            id: 'flight-group-1',
                            name: 'Business Class Group',
                            type: 'flight' as const,
                            travelers: ['traveler-1', 'traveler-2'],
                            preferences: {
                              flightClass: 'business' as const,
                            }
                          },
                          {
                            id: 'flight-group-2',
                            name: 'Economy Group',
                            type: 'flight' as const,
                            travelers: ['traveler-3'],
                            preferences: {
                              flightClass: 'economy' as const,
                            }
                          },
                          {
                            id: 'hotel-group-1',
                            name: 'Shared Room Group',
                            type: 'hotel' as const,
                            travelers: ['traveler-1', 'traveler-2'],
                            preferences: {
                              hotelRoomType: 'deluxe' as const,
                            }
                          },
                          {
                            id: 'hotel-group-2',
                            name: 'Single Room Group',
                            type: 'hotel' as const,
                            travelers: ['traveler-3'],
                            preferences: {
                              hotelRoomType: 'standard' as const,
                            }
                          },
                          {
                            id: 'transfer-group-1',
                            name: 'Shared Transfer Group',
                            type: 'transfer' as const,
                            travelers: ['traveler-1', 'traveler-2'],
                            preferences: {
                              transferVehicle: 'sedan' as const,
                            }
                          },
                          {
                            id: 'transfer-group-2',
                            name: 'Private Transfer Group',
                            type: 'transfer' as const,
                            travelers: ['traveler-3'],
                            preferences: {
                              transferVehicle: 'sedan' as const,
                            }
                          }
                        ];

                        form.setValue('travelerInfo.individualTravelers', demoTravelers);
                        form.setValue('travelerInfo.travelerGroups', demoGroups);
                        setShowAdvancedGrouping(true);
                      }}
                      disabled={disabled}
                      className="h-8 text-xs"
                    >
                      Load Demo Scenario
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-2">
                Enable to set individual traveler preferences and group assignments for complex booking scenarios.
              </p>
            </CardContent>
          </Card>

          {/* Individual Travelers - Only show when advanced grouping is enabled */}
          {showAdvancedGrouping && (
            <Card className="bg-gradient-to-b from-[var(--card)]/95 to-[var(--background)]/20 border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[var(--card-foreground)]">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                      <Users className="h-4 w-4 text-blue-500" />
                    </div>
                    <span>Individual Travelers</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addIndividualTraveler}
                    disabled={disabled}
                    className="h-8"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Add Traveler
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {individualTravelers.map((traveler, index) => (
                  <div key={traveler.id} className="border border-[var(--border)] rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-[var(--muted-foreground)]" />
                        <span className="font-medium">Traveler {index + 1}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIndividualTraveler(traveler.id)}
                        disabled={disabled}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-[var(--muted-foreground)]">Name</label>
                        <Input
                          value={traveler.name}
                          onChange={(e) => updateTraveler(traveler.id, { name: e.target.value })}
                          placeholder="Traveler name"
                          className="h-8 text-sm"
                          disabled={disabled}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-[var(--muted-foreground)]">Type</label>
                        <Select
                          value={traveler.type}
                          onValueChange={(value) => updateTraveler(traveler.id, { type: value as 'adult' | 'child' })}
                          disabled={disabled}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="adult">Adult</SelectItem>
                            <SelectItem value="child">Child</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-[var(--muted-foreground)]">Flight Class</label>
                        <Select
                          value={traveler.preferences?.flightClass || ''}
                          onValueChange={(value) => updateTraveler(traveler.id, { 
                            preferences: { ...traveler.preferences, flightClass: value as any }
                          })}
                          disabled={disabled}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Any class" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="economy">Economy</SelectItem>
                            <SelectItem value="premium_economy">Premium Economy</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="first">First Class</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-[var(--muted-foreground)]">Hotel Room</label>
                        <Select
                          value={traveler.preferences?.hotelRoom || ''}
                          onValueChange={(value) => updateTraveler(traveler.id, { 
                            preferences: { ...traveler.preferences, hotelRoom: value as any }
                          })}
                          disabled={disabled}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Any room type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="shared">Shared Room</SelectItem>
                            <SelectItem value="single">Single Room</SelectItem>
                            <SelectItem value="suite">Suite</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-[var(--muted-foreground)]">Transfer Type</label>
                        <Select
                          value={traveler.preferences?.transferType || ''}
                          onValueChange={(value) => updateTraveler(traveler.id, { 
                            preferences: { ...traveler.preferences, transferType: value as any }
                          })}
                          disabled={disabled}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Any transfer" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="shared">Shared Transfer</SelectItem>
                            <SelectItem value="private">Private Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Traveler Groups - Only show when advanced grouping is enabled */}
          {showAdvancedGrouping && (
            <Card className="bg-gradient-to-b from-[var(--card)]/95 to-[var(--background)]/20 border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[var(--card-foreground)]">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
                      <Group className="h-4 w-4 text-green-500" />
                    </div>
                    <span>Traveler Groups</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => createTravelerGroup('flight')}
                      disabled={disabled}
                      className="h-8"
                    >
                      <Plane className="h-3 w-3 mr-1" />
                      Flight Group
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => createTravelerGroup('hotel')}
                      disabled={disabled}
                      className="h-8"
                    >
                      <Bed className="h-3 w-3 mr-1" />
                      Hotel Group
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => createTravelerGroup('transfer')}
                      disabled={disabled}
                      className="h-8"
                    >
                      <Car className="h-3 w-3 mr-1" />
                      Transfer Group
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {travelerGroups.map((group) => (
                  <div key={group.id} className="border border-[var(--border)] rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getGroupIcon(group.type)}
                        <span className="font-medium">{group.name}</span>
                        <Badge className={`text-xs ${getGroupColor(group.type)}`}>
                          {group.travelers.length} travelers
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-[var(--muted-foreground)]">Group Name</label>
                        <Input
                          value={group.name}
                          onChange={(e) => {
                            const currentGroups = form.getValues('travelerInfo.travelerGroups') || [];
                            const updatedGroups = currentGroups.map(g => 
                              g.id === group.id ? { ...g, name: e.target.value } : g
                            );
                            form.setValue('travelerInfo.travelerGroups', updatedGroups);
                          }}
                          placeholder="Group name"
                          className="h-8 text-sm"
                          disabled={disabled}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-[var(--muted-foreground)]">Travelers</label>
                        <div className="flex flex-wrap gap-1">
                          {individualTravelers
                            .filter(t => !group.travelers.includes(t.id))
                            .map(traveler => (
                              <Button
                                key={traveler.id}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => assignTravelerToGroup(traveler.id, group.id, group.type)}
                                disabled={disabled}
                                className="h-6 text-xs"
                              >
                                {traveler.name || `Traveler ${traveler.id}`}
                              </Button>
                            ))}
                        </div>
                      </div>
                    </div>

                    {group.travelers.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-[var(--muted-foreground)]">Assigned Travelers</label>
                        <div className="flex flex-wrap gap-1">
                          {group.travelers.map(travelerId => {
                            const traveler = individualTravelers.find(t => t.id === travelerId);
                            return traveler ? (
                              <Badge
                                key={travelerId}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {traveler.name || `Traveler ${travelerId}`}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeTravelerFromGroup(travelerId, group.id, group.type)}
                                  disabled={disabled}
                                  className="h-3 w-3 p-0 hover:bg-transparent"
                                >
                                  ×
                                </Button>
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </motion.div>
  );
} 