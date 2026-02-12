import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartComponent } from '@syncfusion/ej2-angular-charts';
import { GridComponent } from '@syncfusion/ej2-angular-grids';

interface GaugeAxis {
  minimum: number;
  maximum: number;
  ranges: Array<{
    start: number;
    end: number;
    color: string;
    startWidth: number;
    endWidth: number;
  }>;
  pointers: Array<{
    value: number;
    type: string;
    markerShape: string;
    markerHeight: number;
    markerWidth: number;
    color: string;
  }>;
}

@Component({
  selector: 'app-oil-field-dashboard',
  templateUrl: './oil-field-dashboard.component.html',
  styleUrls: ['./oil-field-dashboard.component.css']
})
export class OilFieldDashboardComponent implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;
  @ViewChild('grid') grid!: GridComponent;

  // Production Data
  public productionData: Object[] = [
    { month: 'Jan', oil: 45000, gas: 32000, water: 12000 },
    { month: 'Feb', oil: 48000, gas: 34000, water: 13000 },
    { month: 'Mar', oil: 52000, gas: 36000, water: 14000 },
    { month: 'Apr', oil: 49000, gas: 35000, water: 15000 },
    { month: 'May', oil: 55000, gas: 38000, water: 14500 },
    { month: 'Jun', oil: 58000, gas: 40000, water: 16000 }
  ];

  // Well Performance Data
  public wellData: Object[] = [
    { 
      wellId: 'WELL-001', 
      status: 'Active', 
      oilRate: 850, 
      gasRate: 1200, 
      pressure: 2450, 
      temperature: 185,
      efficiency: 92,
      lastMaintenance: '2024-01-15'
    },
    { 
      wellId: 'WELL-002', 
      status: 'Active', 
      oilRate: 920, 
      gasRate: 1350, 
      pressure: 2380, 
      temperature: 178,
      efficiency: 88,
      lastMaintenance: '2024-01-20'
    },
    { 
      wellId: 'WELL-003', 
      status: 'Warning', 
      oilRate: 650, 
      gasRate: 980, 
      pressure: 2100, 
      temperature: 192,
      efficiency: 75,
      lastMaintenance: '2023-12-10'
    },
    { 
      wellId: 'WELL-004', 
      status: 'Active', 
      oilRate: 1050, 
      gasRate: 1480, 
      pressure: 2520, 
      temperature: 182,
      efficiency: 95,
      lastMaintenance: '2024-02-01'
    },
    { 
      wellId: 'WELL-005', 
      status: 'Offline', 
      oilRate: 0, 
      gasRate: 0, 
      pressure: 0, 
      temperature: 0,
      efficiency: 0,
      lastMaintenance: '2024-01-05'
    }
  ];

  // Real-time metrics
  public realTimeData: Object[] = [];
  public gaugeValue: number = 2350;
  public temperatureValue: number = 183;

  // Chart Configuration
  public primaryXAxis: Object = {
    valueType: 'Category',
    title: 'Month',
    majorGridLines: { width: 0 }
  };

  public primaryYAxis: Object = {
    title: 'Production (Barrels)',
    labelFormat: '{value}',
    lineStyle: { width: 0 },
    majorTickLines: { width: 0 },
    minorTickLines: { width: 0 }
  };

  public chartArea: Object = {
    border: { width: 0 }
  };

  public tooltip: Object = {
    enable: true,
    shared: true
  };

  public legend: Object = {
    visible: true,
    position: 'Top'
  };

  public marker: Object = {
    visible: true,
    width: 7,
    height: 7,
    shape: 'Circle'
  };

  // Grid Configuration
  public pageSettings: Object = { pageSize: 10 };
  public filterSettings: Object = { type: 'Excel' };
  public toolbar: string[] = ['ExcelExport', 'PdfExport', 'Search'];

  // Gauge Configuration
  public gaugeAxes: GaugeAxis[] = [{
    minimum: 0,
    maximum: 3000,
    ranges: [
      { start: 0, end: 1500, color: '#F03E3E', startWidth: 15, endWidth: 15 },
      { start: 1500, end: 2250, color: '#FFDD00', startWidth: 15, endWidth: 15 },
      { start: 2250, end: 3000, color: '#30B32D', startWidth: 15, endWidth: 15 }
    ],
    pointers: [{
      value: 2350,
      type: 'Marker',
      markerShape: 'Triangle',
      markerHeight: 15,
      markerWidth: 15,
      color: '#757575'
    }]
  }];

  // KPI Data
  public kpiData = {
    totalProduction: 312000,
    activeWells: 4,
    avgEfficiency: 87.5,
    totalRevenue: 24850000,
    productionChange: 8.5,
    efficiencyChange: 2.3,
    revenueChange: 12.1
  };

  // Pie Chart Data for Production Mix
  public productionMixData: Object[] =  
  // [
  //   { x: 'Jan', y: 3, text: 'Jan: 3' }, { x: 'Feb', y: 3.5, text: 'Feb: 3.5' },
  //   { x: 'Mar', y: 7, text: 'Mar: 7' }, { x: 'Apr', y: 13.5, text: 'Apr: 13.5' },
  //   { x: 'May', y: 19, text: 'May: 19' }, { x: 'Jun', y: 23.5, text: 'Jun: 23.5' },
  //   { x: 'Jul', y: 26, text: 'Jul: 26' }, { x: 'Aug', y: 25, text: 'Aug: 25' },
  //   { x: 'Sep', y: 21, text: 'Sep: 21' }, { x: 'Oct', y: 15, text: 'Oct: 15' },
  //   { x: 'Nov', y: 9, text: 'Nov: 9' }, { x: 'Dec', y: 3.5, text: 'Dec: 3.5' }];
  [
    { type: 'Oil', value: 58, text: '58%' },
    { type: 'Gas', value: 30, text: '30%' },
    { type: 'Water', value: 12, text: '12%' }
  ];

  public piePalette: string[] = ['#2C5F2D', '#00AEE0', '#4A90E2'];

   // Add chat integration properties
   public isChatOpen: boolean = false;
   public dashboardContext = {
     currentView: 'main',
     selectedWell: null,
     dateRange: { start: new Date(), end: new Date() }
   };

  ngOnInit(): void {
    this.simulateRealTimeData();
  }

  // Handle chat open/close
  onChatOpenChange(isOpen: boolean): void {
    this.isChatOpen = isOpen;
  }

  // Handle AI dashboard actions
  onDashboardAction(action: any): void {
    switch (action.type) {
      case 'filter':
        // Filter grid by well status
        if (this.grid) {
          this.grid.filterByColumn('status', 'equal', action.payload.value);
        }
        break;
      case 'export':
        // Export data
        if (action.payload.format === 'excel') {
          this.grid.excelExport();
        }
        break;
      case 'navigate':
        // Navigate to specific well
        this.navigateToWell(action.payload.wellId);
        break;
      case 'refresh':
        this.refreshDashboard();
        break;
    }
  }

  // Simulate real-time data updates
  simulateRealTimeData(): void {
    setInterval(() => {
      const timestamp = new Date();
      this.realTimeData.push({
        time: timestamp.toLocaleTimeString(),
        pressure: 2300 + Math.random() * 200,
        temperature: 180 + Math.random() * 15,
        flowRate: 800 + Math.random() * 300
      });

      // Keep only last 20 data points
      if (this.realTimeData.length > 20) {
        this.realTimeData.shift();
      }
      this.realTimeData=[...this.realTimeData];
      // Update gauge values
      this.gaugeValue = 2300 + Math.random() * 200;
      this.temperatureValue = 180 + Math.random() * 15;
    }, 3000);
  }

  // Grid events
  rowDataBound(args: any): void {
    if (args.data.status === 'Warning') {
      args.row.classList.add('warning-row');
    } else if (args.data.status === 'Offline') {
      args.row.classList.add('offline-row');
    }
  }

  queryCellInfo(args: any): void {
    if (args.column.field === 'efficiency') {
      if (args.data.efficiency < 80) {
        args.cell.classList.add('below-target');
      } else if (args.data.efficiency >= 90) {
        args.cell.classList.add('above-target');
      }
    }
  }

  toolbarClick(args: any): void {
    if (args.item.id === 'grid_excelexport') {
      this.grid.excelExport();
    } else if (args.item.id === 'grid_pdfexport') {
      this.grid.pdfExport();
    }
  }

  // Navigate to well details
  navigateToWell(wellId: string): void {
    console.log('Navigating to well:', wellId);
    // Implement navigation logic
  }

  // Refresh data
  refreshDashboard(): void {
    console.log('Refreshing dashboard data...');
    // Implement refresh logic
  }
}
