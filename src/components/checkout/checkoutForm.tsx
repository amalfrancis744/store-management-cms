'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface CheckoutFormProps {
  onChange: (field: string, value: string) => void;
  values?: {
    address?: string;
    street?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
}

export function CheckoutForm({ onChange, values = {} }: CheckoutFormProps) {
  // Initialize state with default values or provided values
  const [formValues, setFormValues] = useState({
    address: values.address || '',
    street: values.street || '',
    city: values.city || '',
    region: values.region || '',
    postalCode: values.postalCode || '',
    country: values.country || '',
  });

  // Update form values when props change
  useEffect(() => {
    setFormValues({
      address: values.address || '',
      street: values.street || '',
      city: values.city || '',
      region: values.region || '',
      postalCode: values.postalCode || '',
      country: values.country || '',
    });
  }, [values]);

  // Handle field changes
  const handleChange = (field: string, value: string) => {
    setFormValues((prev) => {
      const newValues = { ...prev, [field]: value };
      onChange(field, value);
      return newValues;
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="address">Address Line 1</Label>
        <Input
          id="address"
          placeholder="123 Main St"
          value={formValues.address}
          onChange={(e) => handleChange('address', e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="street">Address Line 2 (Optional)</Label>
        <Input
          id="street"
          placeholder="Apt 4B, Floor 3, etc."
          value={formValues.street}
          onChange={(e) => handleChange('street', e.target.value)}
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="New York"
            value={formValues.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="region">State/Province/Region</Label>
          <Input
            id="region"
            placeholder="NY"
            value={formValues.region}
            onChange={(e) => handleChange('region', e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="postalCode">ZIP/Postal Code</Label>
          <Input
            id="postalCode"
            placeholder="10001"
            value={formValues.postalCode}
            onChange={(e) => handleChange('postalCode', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            placeholder="United States"
            value={formValues.country}
            onChange={(e) => handleChange('country', e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        This address will be used for this order only. It won't be saved to your
        account.
      </p>
    </div>
  );
}
