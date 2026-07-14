//useTicketFilters.js

import { useState, useMemo } from 'react';

const DEFAULT_FILTERS = {
  status:            '',   // OPEN | IN_PROGRESS | CLOSED
  asset_id:          '',
  breakdown_type_id: '',
  from:              '',
  to:                '',
  page:              1,
  limit:             20,
};

const useTicketFilters = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // Set a single filter — resets page to 1 on any filter change
  const setFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1,
    }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  // Build the query string — omit empty values
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== '' && val !== null && val !== undefined) {
        params.set(key, val);
      }
    });
    return params.toString();
  }, [filters]);

  return { filters, setFilter, resetFilters, queryString };
};

export default useTicketFilters;