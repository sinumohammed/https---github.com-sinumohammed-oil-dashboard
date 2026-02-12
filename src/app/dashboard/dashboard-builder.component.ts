import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { DashboardLayoutComponent } from '@syncfusion/ej2-angular-layouts';
import { DataConfigurationService, WidgetDataConfig } from './../service/data-configuration.service';

interface Widget {
  id: string;
  sizeX: number;
  sizeY: number;
  row: number;
  col: number;
  type: string;
  title: string;
  config?: any;
  dataConfig?: WidgetDataConfig;
  isLoading?: boolean; // Loading state per widget
}

@Component({
  selector: 'app-dashboard-builder',
  templateUrl: './dashboard-builder.component.html',
  styleUrls: ['./dashboard-builder.component.css']
})
export class DashboardBuilderComponent implements OnInit {
  @ViewChild('dashboardLayout') dashboardLayout: DashboardLayoutComponent;

  public cellSpacing: number[] = [16, 16];
  public columns: number = 12;
  public allowResizing: boolean = true;
  public allowDragging: boolean = true;
  public mediaQuery: string = 'max-width: 768px';

  // Data configuration dialog
  public showDataConfigDialog: boolean = false;
  public selectedWidgetForConfig: Widget | null = null;

  // ✅ FIX: Store widget data in a separate Map keyed by widgetId
  // This gives us clean references Angular can track
  public widgetDataMap: Map<string, any> = new Map();

  // Available widget types
  public availableWidgets = [
    { type: 'lineChart', icon: 'e-line-chart', title: 'Line Chart', description: 'Trend visualization' },
    { type: 'barChart', icon: 'e-bar-chart', title: 'Bar Chart', description: 'Comparison chart' },
    { type: 'pieChart', icon: 'e-pie-chart', title: 'Pie Chart', description: 'Distribution view' },
    { type: 'gauge', icon: 'e-gauge', title: 'Gauge', description: 'Single metric display' },
    { type: 'kpi', icon: 'e-dashboard', title: 'KPI Card', description: 'Key performance indicator' },
    { type: 'grid', icon: 'e-table', title: 'Data Grid', description: 'Tabular data view' },
    { type: 'map', icon: 'e-location', title: 'Map View', description: 'Geographic visualization' },
    { type: 'sparkline', icon: 'e-sparkline', title: 'Sparkline', description: 'Mini trend chart' }
  ];

  // Dashboard panels
  public panels: Widget[] = [
    { id: 'widget_1', sizeX: 6, sizeY: 3, row: 0, col: 0, type: 'lineChart', title: 'Production Trends' },
    { id: 'widget_2', sizeX: 3, sizeY: 3, row: 0, col: 6, type: 'gauge', title: 'Pressure Monitor' },
    { id: 'widget_3', sizeX: 3, sizeY: 3, row: 0, col: 9, type: 'kpi', title: 'Total Production' },
    { id: 'widget_4', sizeX: 12, sizeY: 4, row: 3, col: 0, type: 'grid', title: 'Well Performance' }
  ];

  // Fallback sample data
  public productionData = [
    { month: 'Jan', value: 45000 },
    { month: 'Feb', value: 48000 },
    { month: 'Mar', value: 52000 },
    { month: 'Apr', value: 49000 },
    { month: 'May', value: 55000 },
    { month: 'Jun', value: 58000 }
  ];
  public wellData = [
    { wellId: 'WELL-001', status: 'Active', production: 850, efficiency: 92 },
    { wellId: 'WELL-002', status: 'Active', production: 920, efficiency: 88 },
    { wellId: 'WELL-003', status: 'Warning', production: 650, efficiency: 75 }
  ];
  public pieData = [
    { category: 'Oil', value: 58 },
    { category: 'Gas', value: 30 },
    { category: 'Water', value: 12 }
  ];
  public gaugeValue: number = 2350;
  public kpiValue: number = 312000;
  public kpiChange: number = 8.5;

  // Dashboard state
  public isEditMode: boolean = true;
  public selectedWidget: Widget | null = null;
  public showWidgetPanel: boolean = true;
  public dashboardTitle: string = 'My Custom Dashboard';
  public savedDashboards: any[] = [];

  // Chart configurations
  public lineChartConfig = {
    primaryXAxis: { valueType: 'Category', title: 'Month' },
    primaryYAxis: { title: 'Production (bbl)' },
    tooltip: { enable: true },
    marker: { visible: true, width: 7, height: 7 }
  };
  public barChartConfig = {
    primaryXAxis: { valueType: 'Category' },
    primaryYAxis: { title: 'Value' },
    tooltip: { enable: true }
  };
  public pieChartConfig = {
    legendSettings: { visible: true, position: 'Right' },
    dataLabel: { visible: true, position: 'Outside' }
  };
  public gridConfig = {
    allowPaging: true,
    pageSettings: { pageSize: 5 },
    allowSorting: true,
    allowFiltering: true
  };

  constructor(
    private dataConfigService: DataConfigurationService,
    private cdr: ChangeDetectorRef // ✅ FIX: Inject ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSavedDashboards();
    this.loadWidgetConfigurations();
  }

  // Load widget data configurations on init
  loadWidgetConfigurations(): void {
    this.panels.forEach(panel => {
      const config = this.dataConfigService.getWidgetConfig(panel.id);
      if (config) {
        panel.dataConfig = config;
        this.fetchWidgetData(panel);
      }
    });
  }

  // Open data configuration dialog
  openDataConfig(widget: Widget): void {
    this.selectedWidgetForConfig = widget;
    this.showDataConfigDialog = true;
  }

  // Close data configuration dialog
  closeDataConfig(): void {
    this.showDataConfigDialog = false;
    this.selectedWidgetForConfig = null;
  }

  // Called when config is saved from dialog
  onDataConfigSaved(config: WidgetDataConfig): void {
    const widget = this.panels.find(p => p.id === config.widgetId);
    if (widget) {
      widget.dataConfig = config;
      this.fetchWidgetData(widget);
    }
    this.closeDataConfig();
  }

  // ✅ FIX: Fetch data and store in widgetDataMap with a fresh array reference
  fetchWidgetData(widget: Widget): void {
    if (!widget.dataConfig) return;

    widget.isLoading = true;
    this.cdr.detectChanges(); // Show loading state immediately

    this.dataConfigService.fetchWidgetData(widget.dataConfig).subscribe({
      next: (data) => {
        widget.isLoading = false;

        // ✅ KEY FIX 1: Store as a BRAND NEW array reference in the map
        // Syncfusion charts only re-render when the dataSource reference changes
        this.widgetDataMap.set(widget.id, [...data]);

        // ✅ KEY FIX 2: Replace panels array to force Angular change detection
        this.panels = this.panels.map(p => p.id === widget.id ? { ...p } : p);

        // ✅ KEY FIX 3: Manually trigger change detection cycle
        this.cdr.detectChanges();

        console.log(`✅ Data loaded for [${widget.title}]:`, data);
      },
      error: (err) => {
        widget.isLoading = false;
        console.error(`❌ Error loading data for [${widget.title}]:`, err);
        this.cdr.detectChanges();
      }
    });
  }

  // ✅ FIX: Look up by widgetId (not type) and return fresh array for Syncfusion
  getWidgetData(widgetId: string, widgetType: string): any {
    // Check configured data first
    if (this.widgetDataMap.has(widgetId)) {
      return this.widgetDataMap.get(widgetId);
    }

    // Fallback to sample data
    switch (widgetType) {
      case 'lineChart':
      case 'barChart':
      case 'sparkline':
        return this.productionData;
      case 'pieChart':
        return this.pieData;
      case 'grid':
        return this.wellData;
      case 'gauge':
        return this.gaugeValue;
      case 'kpi':
        return { value: this.kpiValue, change: this.kpiChange };
      default:
        return [];
    }
  }

  // Check if widget has a data config applied
  hasDataConfig(widgetId: string): boolean {
    return this.widgetDataMap.has(widgetId);
  }

  // Add new widget to dashboard
  addWidget(widgetType: any): void {
    const newWidget: Widget = {
      id: `widget_${Date.now()}`,
      sizeX: this.getDefaultSize(widgetType.type).x,
      sizeY: this.getDefaultSize(widgetType.type).y,
      row: this.getNextAvailableRow(),
      col: 0,
      type: widgetType.type,
      title: widgetType.title
    };
    this.panels = [...this.panels, newWidget];
    this.selectedWidget = newWidget;
    setTimeout(() => this.openDataConfig(newWidget), 100);
  }

  getDefaultSize(type: string): { x: number, y: number } {
    const sizes: any = {
      lineChart: { x: 6, y: 3 }, barChart: { x: 6, y: 3 },
      pieChart: { x: 4, y: 3 }, gauge: { x: 3, y: 3 },
      kpi: { x: 3, y: 2 }, grid: { x: 12, y: 4 },
      map: { x: 6, y: 4 }, sparkline: { x: 3, y: 2 }
    };
    return sizes[type] || { x: 4, y: 3 };
  }

  getNextAvailableRow(): number {
    if (this.panels.length === 0) return 0;
    return Math.max(...this.panels.map(p => p.row + p.sizeY));
  }

  removeWidget(widgetId: string): void {
    this.dataConfigService.deleteWidgetConfig(widgetId);
    this.widgetDataMap.delete(widgetId);
    this.panels = this.panels.filter(p => p.id !== widgetId);
    if (this.selectedWidget?.id === widgetId) this.selectedWidget = null;
  }

  selectWidget(widget: Widget): void {
    this.selectedWidget = widget;
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    this.allowDragging = this.isEditMode;
    this.allowResizing = this.isEditMode;
  }

  saveDashboard(): void {
    const dashboard = {
      id: Date.now(),
      title: this.dashboardTitle,
      panels: [...this.panels],
      createdAt: new Date()
    };
    this.savedDashboards.push(dashboard);
    localStorage.setItem('savedDashboards', JSON.stringify(this.savedDashboards));
    alert('Dashboard saved successfully!');
  }

  loadSavedDashboards(): void {
    const saved = localStorage.getItem('savedDashboards');
    if (saved) this.savedDashboards = JSON.parse(saved);
  }

  loadDashboard(dashboard: any): void {
    this.dashboardTitle = dashboard.title;
    this.panels = [...dashboard.panels];
    this.widgetDataMap.clear();
    this.loadWidgetConfigurations();
  }

  deleteDashboard(dashboardId: number): void {
    this.savedDashboards = this.savedDashboards.filter(d => d.id !== dashboardId);
    localStorage.setItem('savedDashboards', JSON.stringify(this.savedDashboards));
  }

  resetDashboard(): void {
    if (confirm('Are you sure you want to reset this dashboard?')) {
      this.panels = [];
      this.widgetDataMap.clear();
      this.selectedWidget = null;
    }
  }

  exportDashboard(): void {
    const config = { title: this.dashboardTitle, panels: this.panels };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-${Date.now()}.json`;
    link.click();
  }

  importDashboard(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const config = JSON.parse(e.target.result);
          this.dashboardTitle = config.title;
          this.panels = config.panels;
          this.widgetDataMap.clear();
          this.loadWidgetConfigurations();
          alert('Dashboard imported successfully!');
        } catch (error) {
          alert('Invalid dashboard file!');
        }
      };
      reader.readAsText(file);
    }
  }

  // ✅ Dynamic grid columns from configured data
  getGridColumns(widgetId: string): { field: string; headerText: string; width: string }[] {
    const data = this.widgetDataMap.get(widgetId);
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]).map(key => ({
      field: key,
      headerText: key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
      width: '130'
    }));
  }

  onPanelChange(args: any): void {}
  onPanelResize(args: any): void {}
}