'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TimePickerProps {
  defaultValue?: string;
  onTimeChange: (time: string) => void;
}

export function TimePicker({
  defaultValue = '09:00',
  onTimeChange,
}: TimePickerProps) {
  const [hour, setHour] = useState<string>('09');
  const [minute, setMinute] = useState<string>('00');

  useEffect(() => {
    if (defaultValue) {
      const [defaultHour, defaultMinute] = defaultValue.split(':');
      setHour(defaultHour);
      setMinute(defaultMinute);
    }
  }, [defaultValue]);

  const handleHourChange = (value: string) => {
    setHour(value);
    onTimeChange(`${value}:${minute}`);
  };

  const handleMinuteChange = (value: string) => {
    setMinute(value);
    onTimeChange(`${hour}:${value}`);
  };

  // Generate hours from 00-23
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0')
  );

  // Generate minutes in 5-minute increments
  const minutes = Array.from({ length: 12 }, (_, i) =>
    (i * 5).toString().padStart(2, '0')
  );

  return (
    <div className="flex space-x-2">
      <Select value={hour} onValueChange={handleHourChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Hour" />
        </SelectTrigger>
        <SelectContent>
          {hours.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="flex items-center text-gray-500">:</span>
      <Select value={minute} onValueChange={handleMinuteChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Minute" />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
