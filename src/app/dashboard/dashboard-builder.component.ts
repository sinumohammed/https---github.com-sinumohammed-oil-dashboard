import { Component, OnInit, ViewChild } from '@angular/core';
import { DashboardLayoutComponent } from '@syncfusion/ej2-angular-layouts';

interface Widget {
  id: string;
  sizeX: number;
  sizeY: number;
  row: number;
  col: number;
  type: string;
  title: string;
  config?: any;
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

  // Dashboard panels (widgets)
  public panels: Widget[] = [
    {
      id: 'widget_1',
      sizeX: 6,
      sizeY: 3,
      row: 0,
      col: 0,
      type: 'lineChart',
      title: 'Production Trends'
    },
    {
      id: 'widget_2',
      sizeX: 3,
      sizeY: 3,
      row: 0,
      col: 6,
      type: 'gauge',
      title: 'Pressure Monitor'
    },
    {
      id: 'widget_3',
      sizeX: 3,
      sizeY: 3,
      row: 0,
      col: 9,
      type: 'kpi',
      title: 'Total Production'
    },
    {
      id: 'widget_4',
      sizeX: 12,
      sizeY: 4,
      row: 3,
      col: 0,
      type: 'grid',
      title: 'Well Performance'
    }
  ];

  // Sample data for widgets
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

  // Dashboard builder state
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

  ngOnInit(): void {
    this.loadSavedDashboards();
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
  }

  // Get default size for widget type
  getDefaultSize(type: string): { x: number, y: number } {
    const sizes: any = {
      lineChart: { x: 6, y: 3 },
      barChart: { x: 6, y: 3 },
      pieChart: { x: 4, y: 3 },
      gauge: { x: 3, y: 3 },
      kpi: { x: 3, y: 2 },
      grid: { x: 12, y: 4 },
      map: { x: 6, y: 4 },
      sparkline: { x: 3, y: 2 }
    };
    return sizes[type] || { x: 4, y: 3 };
  }

  // Get next available row position
  getNextAvailableRow(): number {
    if (this.panels.length === 0) return 0;
    const maxRow = Math.max(...this.panels.map(p => p.row + p.sizeY));
    return maxRow;
  }

  // Remove widget
  removeWidget(widgetId: string): void {
    this.panels = this.panels.filter(p => p.id !== widgetId);
    if (this.selectedWidget?.id === widgetId) {
      this.selectedWidget = null;
    }
  }

  // Select widget for editing
  selectWidget(widget: Widget): void {
    this.selectedWidget = widget;
  }

  // Update widget title
  updateWidgetTitle(widgetId: string, newTitle: string): void {
    const widget = this.panels.find(p => p.id === widgetId);
    if (widget) {
      widget.title = newTitle;
    }
  }

  // Toggle edit mode
  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    this.allowDragging = this.isEditMode;
    this.allowResizing = this.isEditMode;
  }

  // Save dashboard
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

  // Load saved dashboards
  loadSavedDashboards(): void {
    const saved = localStorage.getItem('savedDashboards');
    if (saved) {
      this.savedDashboards = JSON.parse(saved);
    }
  }

  // Load a saved dashboard
  loadDashboard(dashboard: any): void {
    this.dashboardTitle = dashboard.title;
    this.panels = [...dashboard.panels];
  }

  // Delete saved dashboard
  deleteDashboard(dashboardId: number): void {
    this.savedDashboards = this.savedDashboards.filter(d => d.id !== dashboardId);
    localStorage.setItem('savedDashboards', JSON.stringify(this.savedDashboards));
  }

  // Reset dashboard
  resetDashboard(): void {
    if (confirm('Are you sure you want to reset this dashboard?')) {
      this.panels = [];
      this.selectedWidget = null;
    }
  }

  // Export dashboard configuration
  exportDashboard(): void {
    const config = {
      title: this.dashboardTitle,
      panels: this.panels
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-${Date.now()}.json`;
    link.click();
  }

  // Import dashboard configuration
  importDashboard(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const config = JSON.parse(e.target.result);
          this.dashboardTitle = config.title;
          this.panels = config.panels;
          alert('Dashboard imported successfully!');
        } catch (error) {
          alert('Invalid dashboard file!');
        }
      };
      reader.readAsText(file);
    }
  }

  // Get widget data based on type
  getWidgetData(type: string): any {
    switch (type) {
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

  // Dashboard layout events
  onPanelChange(args: any): void {
    console.log('Panel changed:', args);
  }

  onPanelResize(args: any): void {
    console.log('Panel resized:', args);
  }
}
