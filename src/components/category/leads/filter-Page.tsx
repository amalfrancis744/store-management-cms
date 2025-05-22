import { useGridFilter } from 'ag-grid-react';
import React, { useCallback } from 'react';
import useFocus from '../../../hooks/customFoucss';

interface MyFilterProps {
  model: { value?: string } | null;
  onModelChange: (model: { value?: string } | null) => void;
  title?: string;
  getValue: (node: any) => any;
}

const MyFilter: React.FC<MyFilterProps> = ({
  model,
  onModelChange,
  title,
  getValue,
}) => {
  const inputRef = useFocus<HTMLInputElement>();

  const valueChanged = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      onModelChange(newValue ? { value: newValue } : null);
    },
    [onModelChange]
  );

  const doesFilterPass = useCallback(
    ({ node }: { node: any }) => {
      const value = getValue(node);
      if (!model?.value) return true;

      const filterValue = model.value.trim();
      const rowValue = isNaN(value)
        ? value.toString().toLowerCase()
        : Number(value);

      if (!isNaN(Number(filterValue))) {
        return rowValue === Number(filterValue);
      }

      const rangeMatch = filterValue.match(/^([<>]=?|-?\d+-\d+)$/);
      if (rangeMatch) {
        if (filterValue.includes('-')) {
          const [min, max] = filterValue.split('-').map(Number);
          return rowValue >= min && rowValue <= max;
        } else if (filterValue.startsWith('>')) {
          return rowValue > Number(filterValue.slice(1));
        } else if (filterValue.startsWith('<')) {
          return rowValue < Number(filterValue.slice(1));
        }
      }

      return isNaN(rowValue)
        ? rowValue.includes(filterValue.toLowerCase())
        : false;
    },
    [model, getValue]
  );

  useGridFilter({ doesFilterPass });

  return (
    <div className="p-2">
      <input
        ref={inputRef}
        type="text"
        value={model?.value || ''}
        onChange={valueChanged}
        placeholder={`Filter by ${title || 'Value'}`}
        className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
};

export default MyFilter;
