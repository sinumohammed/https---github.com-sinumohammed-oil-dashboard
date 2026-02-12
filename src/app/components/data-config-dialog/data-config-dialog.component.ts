import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  DataConfigurationService, 
  DataSource, 
  DataColumn, 
  WidgetDataConfig,
  ColumnMapping 
} from 'src/app/service/data-configuration.service';

@Component({
  selector: 'app-data-config-dialog',
  //standalone: true,
  //imports: [CommonModule, FormsModule],
  templateUrl: './data-config-dialog.component.html',
  styleUrls: ['./data-config-dialog.component.css']
})
export class DataConfigDialogComponent implements OnInit {
  @Input() widgetId: string = '';
  @Input() widgetType: string = '';
  @Input() widgetTitle: string = '';
  @Input() isOpen: boolean = false;
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<WidgetDataConfig>();

  // Step tracking
  currentStep: number = 1;
  totalSteps: number = 3;

  // Data sources
  dataSources: DataSource[] = [];
  selectedDataSource: DataSource | null = null;
  
  // Columns
  availableColumns: DataColumn[] = [];
  previewData: any[] = [];
  
  // Configuration
  requiredFields: string[] = [];
  columnMappings: ColumnMapping[] = [];
  
  // Loading states
  isLoadingDataSources: boolean = false;
  isLoadingColumns: boolean = false;
  isLoadingPreview: boolean = false;

  constructor(private dataConfigService: DataConfigurationService) {}

  ngOnInit(): void {
    this.loadDataSources();
    this.initializeConfiguration();
  }

  // Initialize configuration based on widget type
  initializeConfiguration(): void {
    this.requiredFields = this.dataConfigService.getRequiredFieldsForWidget(this.widgetType);
    
    // Initialize empty mappings
    this.columnMappings = this.requiredFields.map(field => ({
      widgetField: field,
      sourceColumn: '',
      displayName: this.dataConfigService.getFieldDisplayName(this.widgetType, field)
    }));

    // Load existing configuration if available
    const existingConfig = this.dataConfigService.getWidgetConfig(this.widgetId);
    if (existingConfig) {
      this.loadExistingConfiguration(existingConfig);
    }
  }

  // Load existing configuration
  loadExistingConfiguration(config: WidgetDataConfig): void {
    this.columnMappings = config.mappings;
    
    // Find and select the data source
    const dataSource = this.dataSources.find(ds => ds.id === config.dataSourceId);
    if (dataSource) {
      this.selectDataSource(dataSource);
    }
  }

  // Load available data sources
  loadDataSources(): void {
    this.isLoadingDataSources = true;
    
    this.dataConfigService.getDataSources().subscribe({
      next: (sources) => {
        this.dataSources = sources;
        this.isLoadingDataSources = false;
      },
      error: (err) => {
        console.error('Error loading data sources:', err);
        this.isLoadingDataSources = false;
      }
    });
  }

  // Select a data source
  selectDataSource(dataSource: DataSource): void {
    this.selectedDataSource = dataSource;
    this.loadColumns(dataSource.id);
    this.loadPreviewData(dataSource.id);
  }

  // Load columns for selected data source
  loadColumns(dataSourceId: string): void {
    this.isLoadingColumns = true;
    
    this.dataConfigService.getDataSourceColumns(dataSourceId).subscribe({
      next: (columns) => {
        this.availableColumns = columns;
        this.isLoadingColumns = false;
      },
      error: (err) => {
        console.error('Error loading columns:', err);
        this.isLoadingColumns = false;
      }
    });
  }

  // Load preview data
  loadPreviewData(dataSourceId: string): void {
    this.isLoadingPreview = true;
    
    this.dataConfigService.previewData(dataSourceId, 3).subscribe({
      next: (data) => {
        this.previewData = data;
        this.isLoadingPreview = false;
      },
      error: (err) => {
        console.error('Error loading preview data:', err);
        this.isLoadingPreview = false;
      }
    });
  }

  // Check if configuration is valid
  isConfigValid(): boolean {
    if (!this.selectedDataSource) return false;
    
    // Check if all required fields are mapped
    return this.columnMappings.every(mapping => mapping.sourceColumn !== '');
  }

  // Save configuration
  saveConfiguration(): void {
    if (!this.isConfigValid() || !this.selectedDataSource) {
      alert('Please complete all required field mappings');
      return;
    }

    const config: WidgetDataConfig = {
      widgetId: this.widgetId,
      dataSourceId: this.selectedDataSource.id,
      dataSourceName: this.selectedDataSource.name,
      mappings: this.columnMappings
    };

    this.dataConfigService.saveWidgetConfig(config);
    this.save.emit(config);
    this.closeDialog();
  }

  // Navigation
  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  canProceedToNextStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.selectedDataSource !== null;
      case 2:
        return this.isConfigValid();
      default:
        return true;
    }
  }

  closeDialog(): void {
    this.close.emit();
  }

  // Get column type icon
  getColumnTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      string: '📝',
      number: '🔢',
      date: '📅',
      boolean: '✓'
    };
    return icons[type] || '•';
  }
}