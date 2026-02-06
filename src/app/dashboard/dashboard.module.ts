import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Syncfusion Modules
import { ChartModule, AccumulationChartModule, SparklineModule } from '@syncfusion/ej2-angular-charts';
import { 
  LineSeriesService, 
  ColumnSeriesService, 
  SplineSeriesService,
  AreaSeriesService,
  CategoryService, 
  DataLabelService, 
  TooltipService, 
  LegendService,
  AccumulationTooltipService,
  PieSeriesService,
  AccumulationDataLabelService
} from '@syncfusion/ej2-angular-charts';

import { GridModule, PageService, SortService, FilterService, ToolbarService, ExcelExportService, PdfExportService } from '@syncfusion/ej2-angular-grids';
import { CircularGaugeModule } from '@syncfusion/ej2-angular-circulargauge';
import { LinearGaugeModule } from '@syncfusion/ej2-angular-lineargauge';
import { DashboardLayoutModule } from '@syncfusion/ej2-angular-layouts';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { DateRangePickerModule } from '@syncfusion/ej2-angular-calendars';
import { TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { ListViewModule } from '@syncfusion/ej2-angular-lists';

// Components
import { OilFieldDashboardComponent } from './oil-field-dashboard.component';
import { DashboardBuilderComponent } from './dashboard-builder.component';

@NgModule({
  declarations: [
    OilFieldDashboardComponent,
    DashboardBuilderComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    
    // Syncfusion Modules
    ChartModule,
    AccumulationChartModule,
    SparklineModule,
    GridModule,
    CircularGaugeModule,
    LinearGaugeModule,
    DashboardLayoutModule,
    ButtonModule,
    DropDownListModule,
    DateRangePickerModule,
    TextBoxModule,
    ListViewModule
  ],
  providers: [
    // Chart Services
    LineSeriesService,
    ColumnSeriesService,
    SplineSeriesService,
    AreaSeriesService,
    CategoryService,
    DataLabelService,
    TooltipService,
    LegendService,
    AccumulationTooltipService,
    PieSeriesService,
    AccumulationDataLabelService,
    
    // Grid Services
    PageService,
    SortService,
    FilterService,
    ToolbarService,
    ExcelExportService,
    PdfExportService
  ],
  exports: [
    OilFieldDashboardComponent,
    DashboardBuilderComponent
  ]
})
export class DashboardModule { }
