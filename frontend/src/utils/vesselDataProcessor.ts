import { VesselData } from './types';
import Papa from 'papaparse';

interface AISData {
  MMSI?: string;
  LAT?: number | string;
  LON?: number | string;
  LATITUDE?: number | string;
  LONGITUDE?: number | string;
  SPEED?: number | string;
  COURSE?: number | string;
  HEADING?: number | string;
  TIMESTAMP?: string;
  VESSEL_TYPE?: string;
  VESSEL_NAME?: string;
  FLAG?: string;
  LENGTH?: number | string;
  WIDTH?: number | string;
  DRAUGHT?: number | string;
  STATUS?: string;
}

export const processVesselData = async (url: string): Promise<VesselData[]> => {
  try {
    // Determine file type from URL
    const fileType = url.split('.').pop()?.toLowerCase();
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    let data: AISData[];

    switch (fileType) {
      case 'csv':
        const text = await response.text();
        const parsed = await new Promise<Papa.ParseResult<AISData>>((resolve) => {
          Papa.parse(text, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: resolve
          });
        });
        data = parsed.data;
        break;

      case 'json':
        data = await response.json();
        break;

      case 'geojson':
        const geojson = await response.json();
        data = geojson.features.map((feature: any) => ({
          ...feature.properties,
          LAT: feature.geometry.coordinates[1],
          LON: feature.geometry.coordinates[0]
        }));
        break;

      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }

    // Transform and validate the data
    return data.map((row) => {
      // Handle different coordinate field names
      const latitude = Number(row.LAT ?? row.LATITUDE);
      const longitude = Number(row.LON ?? row.LONGITUDE);

      // Validate coordinates
      if (isNaN(latitude) || isNaN(longitude) ||
          latitude < -90 || latitude > 90 ||
          longitude < -180 || longitude > 180) {
        console.warn('Invalid coordinates:', row);
        return null;
      }

      // Create standardized vessel object
      return {
        vessel_id: row.MMSI?.toString() || row.VESSEL_NAME?.toString(),
        latitude,
        longitude,
        speed: Number(row.SPEED) || undefined,
        course: Number(row.COURSE) || undefined,
        heading: Number(row.HEADING) || undefined,
        timestamp: row.TIMESTAMP,
        vessel_type: row.VESSEL_TYPE,
        flag: row.FLAG,
        dimensions: {
          length: Number(row.LENGTH) || undefined,
          width: Number(row.WIDTH) || undefined,
          draught: Number(row.DRAUGHT) || undefined
        },
        status: row.STATUS,
        behavior: determineBehavior(row),
      };
    }).filter((vessel): vessel is VesselData => vessel !== null);
  } catch (error) {
    console.error('Error processing vessel data:', error);
    throw new Error(`Failed to process vessel data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Helper function to determine vessel behavior based on available data
function determineBehavior(data: AISData): string {
  const speed = Number(data.SPEED);
  
  if (isNaN(speed)) return 'unknown';
  
  if (speed < 0.5) return 'stopped';
  if (speed < 3) return 'fishing'; // Typical fishing vessel speed
  if (speed < 8) return 'maneuvering';
  return 'transit';
}

// Sample URLs for testing:
export const SAMPLE_URLS = {
  // Marine Traffic sample AIS data
  marineTraffic: 'https://services.marinetraffic.com/api/exportdata/{API_KEY}/timespan:60/protocol:jsono',
  
  // NOAA AIS data samples
  noaaAIS: 'https://coast.noaa.gov/htdata/CMSP/AISDataHandler/2023/AIS_2023_01_01.zip',
  
  // Global Fishing Watch data
  globalFishingWatch: 'https://globalfishingwatch.org/data-download/datasets/public-fishing-effort:v20201019',
  
  // EMODnet sample vessel data
  emodnet: 'https://erddap.emodnet.eu/erddap/tabledap/vessels_position.csv?time,latitude,longitude,mmsi,vesseltype',
  
  // Sample GeoJSON for testing
  testGeoJSON: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_ports.geojson',
  
  // Local test files
  localCSV: '/sample-data/vessels.csv',
  localJSON: '/sample-data/vessel-tracks.json'
};
