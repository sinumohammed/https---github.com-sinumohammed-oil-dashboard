import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay } from 'rxjs';

export interface DataSource {
  id: string;
  name: string;
  type: 'table' | 'api' | 'file';
  connectionString?: string;
}

export interface DataColumn {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  sample?: any;
}

export interface WidgetDataConfig {
  widgetId: string;
  dataSourceId: string;
  dataSourceName: string;
  mappings: ColumnMapping[];
  filters?: DataFilter[];
  aggregations?: DataAggregation[];
}

export interface ColumnMapping {
  widgetField: string; // e.g., 'xName', 'yName', 'value'
  sourceColumn: string;
  displayName?: string;
}

export interface DataFilter {
  column: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
}

export interface DataAggregation {
  column: string;
  function: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

@Injectable({
  providedIn: 'root'
})
export class DataConfigurationService {
  // MOCK DATA - Replace with real API calls later
  private mockDataSources: DataSource[] = [
    { id: 'wells_table', name: 'Wells Performance Data', type: 'table' },
    { id: 'production_table', name: 'Monthly Production Records', type: 'table' },
    { id: 'maintenance_table', name: 'Maintenance History', type: 'table' },
    { id: 'sensors_api', name: 'Real-time Sensor Data', type: 'api' },
    { id: 'efficiency_table', name: 'Efficiency Metrics', type: 'table' },
    { id: 'alerts_table', name: 'System Alerts & Warnings', type: 'table' },
    { id: 'revenue_table', name: 'Revenue & Financial Data', type: 'table' }
  ];

  private mockColumns: { [key: string]: DataColumn[] } = {
    wells_table: [
      { name: 'wellId', type: 'string', sample: 'WELL-001' },
      { name: 'wellName', type: 'string', sample: 'Alpha Site' },
      { name: 'status', type: 'string', sample: 'Active' },
      { name: 'oilRate', type: 'number', sample: 850 },
      { name: 'gasRate', type: 'number', sample: 1200 },
      { name: 'waterRate', type: 'number', sample: 150 },
      { name: 'pressure', type: 'number', sample: 2450 },
      { name: 'temperature', type: 'number', sample: 185 },
      { name: 'efficiency', type: 'number', sample: 92 },
      { name: 'lastMaintenance', type: 'date', sample: '2024-01-15' },
      { name: 'latitude', type: 'number', sample: 29.7604 },
      { name: 'longitude', type: 'number', sample: -95.3698 }
    ],
    production_table: [
      { name: 'month', type: 'string', sample: 'January' },
      { name: 'monthNumber', type: 'number', sample: 1 },
      { name: 'year', type: 'number', sample: 2024 },
      { name: 'oil', type: 'number', sample: 45000 },
      { name: 'gas', type: 'number', sample: 32000 },
      { name: 'water', type: 'number', sample: 12000 },
      { name: 'totalProduction', type: 'number', sample: 89000 },
      { name: 'revenue', type: 'number', sample: 2850000 },
      { name: 'date', type: 'date', sample: '2024-01-31' }
    ],
    maintenance_table: [
      { name: 'maintenanceId', type: 'string', sample: 'MNT-001' },
      { name: 'wellId', type: 'string', sample: 'WELL-001' },
      { name: 'type', type: 'string', sample: 'Scheduled' },
      { name: 'description', type: 'string', sample: 'Pump replacement' },
      { name: 'cost', type: 'number', sample: 15000 },
      { name: 'duration', type: 'number', sample: 4 },
      { name: 'technician', type: 'string', sample: 'John Smith' },
      { name: 'completedDate', type: 'date', sample: '2024-01-20' },
      { name: 'status', type: 'string', sample: 'Completed' }
    ],
    sensors_api: [
      { name: 'sensorId', type: 'string', sample: 'SENSOR-001' },
      { name: 'wellId', type: 'string', sample: 'WELL-001' },
      { name: 'reading', type: 'number', sample: 2350 },
      { name: 'unit', type: 'string', sample: 'PSI' },
      { name: 'timestamp', type: 'date', sample: '2024-02-11T10:30:00Z' },
      { name: 'isNormal', type: 'boolean', sample: true }
    ],
    efficiency_table: [
      { name: 'wellId', type: 'string', sample: 'WELL-001' },
      { name: 'date', type: 'date', sample: '2024-02-11' },
      { name: 'efficiencyPercent', type: 'number', sample: 87.5 },
      { name: 'uptimeHours', type: 'number', sample: 720 },
      { name: 'downtimeHours', type: 'number', sample: 24 },
      { name: 'productionTarget', type: 'number', sample: 1000 },
      { name: 'actualProduction', type: 'number', sample: 875 }
    ],
    alerts_table: [
      { name: 'alertId', type: 'string', sample: 'ALERT-001' },
      { name: 'wellId', type: 'string', sample: 'WELL-003' },
      { name: 'severity', type: 'string', sample: 'Warning' },
      { name: 'message', type: 'string', sample: 'Pressure below threshold' },
      { name: 'timestamp', type: 'date', sample: '2024-02-11T09:15:00Z' },
      { name: 'acknowledged', type: 'boolean', sample: false }
    ],
    revenue_table: [
      { name: 'month', type: 'string', sample: 'January' },
      { name: 'oilRevenue', type: 'number', sample: 2500000 },
      { name: 'gasRevenue', type: 'number', sample: 350000 },
      { name: 'totalRevenue', type: 'number', sample: 2850000 },
      { name: 'operatingCost', type: 'number', sample: 850000 },
      { name: 'netProfit', type: 'number', sample: 2000000 },
      { name: 'profitMargin', type: 'number', sample: 70.18 }
    ]
  };

  private mockData: { [key: string]: any[] } = {
    wells_table: [
      { wellId: 'WELL-001', wellName: 'Alpha Site', status: 'Active', oilRate: 850, gasRate: 1200, waterRate: 150, pressure: 2450, temperature: 185, efficiency: 92, lastMaintenance: '2024-01-15', latitude: 29.7604, longitude: -95.3698 },
      { wellId: 'WELL-002', wellName: 'Beta Site', status: 'Active', oilRate: 920, gasRate: 1350, waterRate: 180, pressure: 2380, temperature: 178, efficiency: 88, lastMaintenance: '2024-01-20', latitude: 29.7854, longitude: -95.4012 },
      { wellId: 'WELL-003', wellName: 'Gamma Site', status: 'Warning', oilRate: 650, gasRate: 980, waterRate: 220, pressure: 2100, temperature: 192, efficiency: 75, lastMaintenance: '2023-12-10', latitude: 29.7234, longitude: -95.3456 },
      { wellId: 'WELL-004', wellName: 'Delta Site', status: 'Active', oilRate: 1050, gasRate: 1480, waterRate: 140, pressure: 2520, temperature: 182, efficiency: 95, lastMaintenance: '2024-02-01', latitude: 29.8012, longitude: -95.3890 },
      { wellId: 'WELL-005', wellName: 'Epsilon Site', status: 'Offline', oilRate: 0, gasRate: 0, waterRate: 0, pressure: 0, temperature: 0, efficiency: 0, lastMaintenance: '2024-01-05', latitude: 29.7445, longitude: -95.4123 }
    ],
    production_table: [
      { month: 'January', monthNumber: 1, year: 2024, oil: 45000, gas: 32000, water: 12000, totalProduction: 89000, revenue: 2850000, date: '2024-01-31' },
      { month: 'February', monthNumber: 2, year: 2024, oil: 48000, gas: 34000, water: 13000, totalProduction: 95000, revenue: 3050000, date: '2024-02-29' },
      { month: 'March', monthNumber: 3, year: 2024, oil: 52000, gas: 36000, water: 14000, totalProduction: 102000, revenue: 3350000, date: '2024-03-31' },
      { month: 'April', monthNumber: 4, year: 2024, oil: 49000, gas: 35000, water: 15000, totalProduction: 99000, revenue: 3150000, date: '2024-04-30' },
      { month: 'May', monthNumber: 5, year: 2024, oil: 55000, gas: 38000, water: 14500, totalProduction: 107500, revenue: 3550000, date: '2024-05-31' },
      { month: 'June', monthNumber: 6, year: 2024, oil: 58000, gas: 40000, water: 16000, totalProduction: 114000, revenue: 3750000, date: '2024-06-30' }
    ],
    maintenance_table: [
      { maintenanceId: 'MNT-001', wellId: 'WELL-001', type: 'Scheduled', description: 'Pump replacement', cost: 15000, duration: 4, technician: 'John Smith', completedDate: '2024-01-20', status: 'Completed' },
      { maintenanceId: 'MNT-002', wellId: 'WELL-002', type: 'Emergency', description: 'Valve repair', cost: 8500, duration: 2, technician: 'Jane Doe', completedDate: '2024-01-25', status: 'Completed' },
      { maintenanceId: 'MNT-003', wellId: 'WELL-003', type: 'Scheduled', description: 'Inspection', cost: 3000, duration: 1, technician: 'Bob Johnson', completedDate: '2024-02-05', status: 'Completed' },
      { maintenanceId: 'MNT-004', wellId: 'WELL-005', type: 'Emergency', description: 'System failure', cost: 45000, duration: 8, technician: 'John Smith', completedDate: '2024-02-10', status: 'In Progress' }
    ],
    sensors_api: [
      { sensorId: 'SENSOR-001', wellId: 'WELL-001', reading: 2350, unit: 'PSI', timestamp: '2024-02-11T10:30:00Z', isNormal: true },
      { sensorId: 'SENSOR-002', wellId: 'WELL-001', reading: 185, unit: 'F', timestamp: '2024-02-11T10:30:00Z', isNormal: true },
      { sensorId: 'SENSOR-003', wellId: 'WELL-002', reading: 2380, unit: 'PSI', timestamp: '2024-02-11T10:30:00Z', isNormal: true },
      { sensorId: 'SENSOR-004', wellId: 'WELL-003', reading: 2100, unit: 'PSI', timestamp: '2024-02-11T10:30:00Z', isNormal: false }
    ],
    efficiency_table: [
      { wellId: 'WELL-001', date: '2024-02-11', efficiencyPercent: 92, uptimeHours: 720, downtimeHours: 24, productionTarget: 900, actualProduction: 828 },
      { wellId: 'WELL-002', date: '2024-02-11', efficiencyPercent: 88, uptimeHours: 710, downtimeHours: 34, productionTarget: 950, actualProduction: 836 },
      { wellId: 'WELL-003', date: '2024-02-11', efficiencyPercent: 75, uptimeHours: 680, downtimeHours: 64, productionTarget: 800, actualProduction: 600 },
      { wellId: 'WELL-004', date: '2024-02-11', efficiencyPercent: 95, uptimeHours: 730, downtimeHours: 14, productionTarget: 1100, actualProduction: 1045 }
    ],
    alerts_table: [
      { alertId: 'ALERT-001', wellId: 'WELL-003', severity: 'Warning', message: 'Pressure below threshold', timestamp: '2024-02-11T09:15:00Z', acknowledged: false },
      { alertId: 'ALERT-002', wellId: 'WELL-005', severity: 'Critical', message: 'Well offline - maintenance required', timestamp: '2024-02-11T08:30:00Z', acknowledged: true },
      { alertId: 'ALERT-003', wellId: 'WELL-001', severity: 'Info', message: 'Scheduled maintenance due', timestamp: '2024-02-11T07:00:00Z', acknowledged: true }
    ],
    revenue_table: [
      { month: 'January', oilRevenue: 2500000, gasRevenue: 350000, totalRevenue: 2850000, operatingCost: 850000, netProfit: 2000000, profitMargin: 70.18 },
      { month: 'February', oilRevenue: 2700000, gasRevenue: 380000, totalRevenue: 3080000, operatingCost: 920000, netProfit: 2160000, profitMargin: 70.13 },
      { month: 'March', oilRevenue: 2950000, gasRevenue: 410000, totalRevenue: 3360000, operatingCost: 980000, netProfit: 2380000, profitMargin: 70.83 },
      { month: 'April', oilRevenue: 2750000, gasRevenue: 395000, totalRevenue: 3145000, operatingCost: 940000, netProfit: 2205000, profitMargin: 70.11 },
      { month: 'May', oilRevenue: 3100000, gasRevenue: 430000, totalRevenue: 3530000, operatingCost: 1050000, netProfit: 2480000, profitMargin: 70.25 },
      { month: 'June', oilRevenue: 3250000, gasRevenue: 450000, totalRevenue: 3700000, operatingCost: 1100000, netProfit: 2600000, profitMargin: 70.27 }
    ]
  };
  
  // Store widget configurations
  private widgetConfigs = new BehaviorSubject<Map<string, WidgetDataConfig>>(new Map());
  public widgetConfigs$ = this.widgetConfigs.asObservable();

  constructor() {
    this.loadSavedConfigurations();
  }

  // Get available data sources (MOCK - returns dummy data with simulated delay)
  getDataSources(): Observable<DataSource[]> {
    // Simulate API delay
    return of(this.mockDataSources).pipe(delay(500));
    
    // TODO: Replace with real API call when backend is ready:
    // return this.http.get<DataSource[]>(`${this.apiUrl}/data-sources`);
  }

  // Get columns for a specific data source (MOCK)
  getDataSourceColumns(dataSourceId: string): Observable<DataColumn[]> {
    const columns = this.mockColumns[dataSourceId] || [];
    // Simulate API delay
    return of(columns).pipe(delay(500));
    
    // TODO: Replace with real API call:
    // return this.http.get<DataColumn[]>(`${this.apiUrl}/data-sources/${dataSourceId}/columns`);
  }

  // Preview data from source (MOCK)
  previewData(dataSourceId: string, limit: number = 10): Observable<any[]> {
    const data = this.mockData[dataSourceId] || [];
    const preview = data.slice(0, limit);
    // Simulate API delay
    return of(preview).pipe(delay(500));
    
    // TODO: Replace with real API call:
    // return this.http.get<any[]>(`${this.apiUrl}/data-sources/${dataSourceId}/preview?limit=${limit}`);
  }

  // Fetch data based on widget configuration (MOCK)
  fetchWidgetData(config: WidgetDataConfig): Observable<any[]> {
    const sourceData = this.mockData[config.dataSourceId] || [];
    
    // Apply mappings to transform data
    const transformedData = sourceData.map(row => {
      const newRow: any = {};
      config.mappings.forEach(mapping => {
        newRow[mapping.widgetField] = row[mapping.sourceColumn];
      });
      return newRow;
    });
    
    // Simulate API delay
    return of(transformedData).pipe(delay(500));
    
    // TODO: Replace with real API call:
    // return this.http.post<any[]>(`${this.apiUrl}/data/query`, {
    //   dataSourceId: config.dataSourceId,
    //   mappings: config.mappings,
    //   filters: config.filters,
    //   aggregations: config.aggregations
    // });
  }

  // Save widget configuration
  saveWidgetConfig(config: WidgetDataConfig): void {
    const configs = this.widgetConfigs.value;
    configs.set(config.widgetId, config);
    this.widgetConfigs.next(configs);
    
    // Persist to localStorage
    this.saveToLocalStorage();
  }

  // Get widget configuration
  getWidgetConfig(widgetId: string): WidgetDataConfig | undefined {
    return this.widgetConfigs.value.get(widgetId);
  }

  // Delete widget configuration
  deleteWidgetConfig(widgetId: string): void {
    const configs = this.widgetConfigs.value;
    configs.delete(widgetId);
    this.widgetConfigs.next(configs);
    this.saveToLocalStorage();
  }

  // Get all configurations
  getAllConfigs(): Map<string, WidgetDataConfig> {
    return this.widgetConfigs.value;
  }

  // Load saved configurations from localStorage
  private loadSavedConfigurations(): void {
    const saved = localStorage.getItem('widgetDataConfigs');
    if (saved) {
      const configArray = JSON.parse(saved);
      const configMap = new Map<string, WidgetDataConfig>(configArray);
      this.widgetConfigs.next(configMap);
    }
  }

  // Save to localStorage
  private saveToLocalStorage(): void {
    const configArray = Array.from(this.widgetConfigs.value.entries());
    localStorage.setItem('widgetDataConfigs', JSON.stringify(configArray));
  }

  // Get required fields for each widget type
  getRequiredFieldsForWidget(widgetType: string): string[] {
    const fieldMap: { [key: string]: string[] } = {
      lineChart: ['xName', 'yName'],
      barChart: ['xName', 'yName'],
      pieChart: ['xName', 'yName'],
      gauge: ['value'],
      kpi: ['value', 'change'],
      grid: [], // Grid shows all columns
      sparkline: ['xName', 'yName'],
      map: ['latitude', 'longitude', 'label']
    };
    
    return fieldMap[widgetType] || [];
  }

  // Get field display names
  getFieldDisplayName(widgetType: string, field: string): string {
    const displayNames: { [key: string]: { [key: string]: string } } = {
      lineChart: { xName: 'X-Axis (Category)', yName: 'Y-Axis (Value)' },
      barChart: { xName: 'X-Axis (Category)', yName: 'Y-Axis (Value)' },
      pieChart: { xName: 'Category', yName: 'Value' },
      gauge: { value: 'Gauge Value' },
      kpi: { value: 'KPI Value', change: 'Change %' },
      sparkline: { xName: 'X-Axis', yName: 'Y-Axis' },
      map: { latitude: 'Latitude', longitude: 'Longitude', label: 'Label' }
    };
    
    return displayNames[widgetType]?.[field] || field;
  }
}