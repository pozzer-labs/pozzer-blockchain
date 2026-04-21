// Home page uses fixed values for stable, fast loading
// Explorer uses dynamic data from useTestnetPolling

interface NetworkStats {
  current_block: number;
  total_transactions: number;
  active_validators: number;
  network_uptime: number;
  nodes_online: number;
  avg_block_time: number;
  tps: number;
}

interface Validator {
  id: number;
  name: string;
  location: string;
  city: string;
  country: string;
  is_active: boolean;
  total_blocks_validated: number;
  uptime_percentage: number;
  stake_amount: number;
}

interface ValidatorWithCoords extends Validator {
  lat: number;
  lng: number;
}

// Fixed network stats for Home page
const DEFAULT_STATS: NetworkStats = {
  current_block: 30532,
  total_transactions: 2002,
  active_validators: 13,
  network_uptime: 99.87,
  nodes_online: 67,
  avg_block_time: 0.8,
  tps: 0,
};

const DEFAULT_VALIDATORS: ValidatorWithCoords[] = [
  { id: 1, name: 'Pozzer Foundation BR', location: 'Brazil', city: 'São Paulo', country: 'BR', is_active: true, total_blocks_validated: 3048, uptime_percentage: 99.9, stake_amount: 0, lat: -23.5505, lng: -46.6333 },
  { id: 2, name: 'Brasil Cloud Network', location: 'Brazil', city: 'Rio de Janeiro', country: 'BR', is_active: true, total_blocks_validated: 2989, uptime_percentage: 99.9, stake_amount: 0, lat: -22.9068, lng: -43.1729 },
  { id: 3, name: 'LatAm Infrastructure', location: 'Latin America', city: 'Buenos Aires', country: 'AR', is_active: true, total_blocks_validated: 3031, uptime_percentage: 99.9, stake_amount: 0, lat: -34.6037, lng: -58.3816 },
  { id: 4, name: 'US East Network', location: 'USA', city: 'New York', country: 'US', is_active: true, total_blocks_validated: 2107, uptime_percentage: 99.8, stake_amount: 50000, lat: 40.7128, lng: -74.0060 },
  { id: 5, name: 'Frankfurt Data Center', location: 'Germany', city: 'Frankfurt', country: 'DE', is_active: true, total_blocks_validated: 2121, uptime_percentage: 99.7, stake_amount: 45000, lat: 50.1109, lng: 8.6821 },
  { id: 6, name: 'Singapore Hub', location: 'Singapore', city: 'Singapore', country: 'SG', is_active: true, total_blocks_validated: 2348, uptime_percentage: 99.9, stake_amount: 60000, lat: 1.3521, lng: 103.8198 },
  { id: 7, name: 'Tokyo Network', location: 'Japan', city: 'Tokyo', country: 'JP', is_active: true, total_blocks_validated: 2266, uptime_percentage: 99.8, stake_amount: 55000, lat: 35.6762, lng: 139.6503 },
  { id: 8, name: 'London Cloud', location: 'UK', city: 'London', country: 'GB', is_active: true, total_blocks_validated: 1857, uptime_percentage: 99.6, stake_amount: 42000, lat: 51.5074, lng: -0.1278 },
  { id: 9, name: 'San Francisco Tech', location: 'USA', city: 'San Francisco', country: 'US', is_active: true, total_blocks_validated: 2091, uptime_percentage: 99.7, stake_amount: 48000, lat: 37.7749, lng: -122.4194 },
  { id: 10, name: 'Sydney Pacific', location: 'Australia', city: 'Sydney', country: 'AU', is_active: true, total_blocks_validated: 1802, uptime_percentage: 99.5, stake_amount: 38000, lat: -33.8688, lng: 151.2093 },
  { id: 11, name: 'Mexico City Network', location: 'Mexico', city: 'Mexico City', country: 'MX', is_active: true, total_blocks_validated: 1932, uptime_percentage: 99.6, stake_amount: 41000, lat: 19.4326, lng: -99.1332 },
  { id: 12, name: 'Toronto Canada', location: 'Canada', city: 'Toronto', country: 'CA', is_active: true, total_blocks_validated: 1847, uptime_percentage: 99.7, stake_amount: 43000, lat: 43.6532, lng: -79.3832 },
  { id: 13, name: 'Seoul Asia', location: 'South Korea', city: 'Seoul', country: 'KR', is_active: true, total_blocks_validated: 2154, uptime_percentage: 99.8, stake_amount: 52000, lat: 37.5665, lng: 126.9780 },
];

export function useNetworkData() {
  // Use fixed values - no API calls for stable, fast loading
  const networkStats = DEFAULT_STATS;
  const validators = DEFAULT_VALIDATORS;
  const loading = false;

  // Calculate derived stats from fixed data
  const activeCities = new Set(validators.map((v) => v.city)).size;
  const activeCountries = new Set(validators.map((v) => v.country)).size;
  const totalNodes = networkStats.nodes_online;
  // Real contributor count (actual testnet users)
  const contributors = 3000;

  return {
    networkStats,
    validators,
    activeCities,
    activeCountries,
    totalNodes,
    contributors,
    loading,
  };
}
