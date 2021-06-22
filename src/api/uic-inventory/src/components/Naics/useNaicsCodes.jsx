import { useEffect, useState } from 'react';

const topLevelItems = [
  { code: 11, value: 'Agriculture, Forestry, Fishing and Hunting' },
  { code: 21, value: 'Mining, Quarrying, and Oil and Gas Extraction' },
  { code: 22, value: 'Utilities' },
  { code: 23, value: 'Construction' },
  { code: '31-33', value: 'Manufacturing' },
  { code: 42, value: 'Wholesale Trade' },
  { code: '44-45', value: 'Retail Trade' },
  { code: '48-49', value: 'Transportation and Warehousing' },
  { code: 51, value: 'Information' },
  { code: 52, value: 'Finance and Insurance' },
  { code: 53, value: 'Real Estate and Rental and Leasing' },
  { code: 54, value: 'Professional, Scientific, and Technical Services' },
  { code: 55, value: 'Management of Companies and Enterprises' },
  { code: 56, value: 'Administrative and Support and Waste Management and Remediation Services' },
  { code: 61, value: 'Educational Services' },
  { code: 62, value: 'Health Care and Social Assistance' },
  { code: 71, value: 'Arts, Entertainment, and Recreation' },
  { code: 72, value: 'Accommodation and Food Services' },
  { code: 81, value: 'Other Services (except Public Administration)' },
  { code: 92, value: 'Public Administration' },
];

function useNaicsCodes(naicsCode) {
  const [codes, setCodes] = useState();

  useEffect(() => {
    if (!naicsCode) {
      return setCodes(topLevelItems);
    }

    const fetchCodes = async () => {
      const response = await fetch(`/api/naics/${naicsCode}`, {
        method: 'GET',
      });

      setCodes(await response.json());
    };

    fetchCodes();
  }, [naicsCode]);

  return codes;
}

export default useNaicsCodes;
