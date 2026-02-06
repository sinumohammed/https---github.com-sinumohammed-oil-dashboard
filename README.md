# Oil Field Dashboard - Syncfusion Angular 13

🚀 **Live Demo on StackBlitz**

This is a comprehensive oil field monitoring solution built with Angular 13 and Syncfusion components.

## 📊 Features

### Production Dashboard
- Real-time KPI cards with trend indicators
- Multi-series production charts (Oil, Gas, Water)
- Live gauges for Pressure and Temperature
- Sortable/Filterable well performance grid with Excel/PDF export
- Real-time monitoring with auto-refresh
- Alert notifications system

### Dashboard Builder
- Drag & drop widget placement
- 8 widget types: Line Chart, Bar Chart, Pie Chart, Gauge, KPI Card, Grid, Sparkline, Map
- Save/Load dashboards to local storage
- Import/Export configurations (JSON)
- Edit/View mode toggle
- Fully responsive layout

## 🎯 Navigation

- **Production Dashboard** - Pre-built oil field monitoring dashboard
- **Dashboard Builder** - Create custom dashboards on the fly

## 📦 Technologies Used

- **Angular 13** - Framework
- **Syncfusion v20.4** - UI Components (Charts, Grids, Gauges, Dashboard Layout)
- **RxJS** - Reactive programming
- **TypeScript** - Type safety

## 💡 How to Use

### Production Dashboard
1. Click on "Production Dashboard" in the navigation
2. Explore the KPI cards, charts, and real-time data
3. Use the grid to sort, filter, and export well data
4. Watch the live gauges update automatically

### Dashboard Builder
1. Click on "Dashboard Builder" in the navigation
2. Click "Widgets" button to open the widget panel
3. Click any widget to add it to the dashboard
4. Drag panels to reposition them
5. Resize panels by dragging corners (Edit Mode)
6. Click panel titles to edit them
7. Save your dashboard for later use

## 🔧 Customization

### Connecting Real Data

The dashboard currently uses dummy data. To connect to your backend:

1. Update the data sources in `oil-field-dashboard.component.ts`
2. Replace mock data with HTTP calls to your API
3. Configure the real-time polling interval (currently 3 seconds)

Example:
```typescript
import { HttpClient } from '@angular/common/http';

constructor(private http: HttpClient) {}

ngOnInit(): void {
  this.http.get('/api/production/data')
    .subscribe(data => this.productionData = data);
}
```

### Changing Colors

Edit the CSS files to match your brand colors:
- KPI card gradients
- Chart series colors
- Gauge range colors

### Adding New Widget Types

In `dashboard-builder.component.ts`:
1. Add to `availableWidgets` array
2. Create HTML template for the widget
3. Add default size in `getDefaultSize()` method

## 📱 Responsive Design

The dashboard is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1366px - 1920px)
- Tablet (768px - 1366px)
- Mobile (< 768px)

## 🎨 Theme

Currently using Syncfusion Material theme. You can change to:
- Bootstrap 5
- Fluent (Microsoft)
- Tailwind CSS

Update in `angular.json` styles section.

## 📝 Dummy Data

The application includes realistic dummy data for:
- 6 months of production trends
- 5 wells with varying statuses
- Real-time metrics simulation
- KPI calculations

## ⚡ Performance

- Virtual scrolling for large grids
- Lazy loading for charts
- Optimized change detection
- Real-time data throttling

## 🚀 Deployment

This StackBlitz project can be exported and deployed to:
- Vercel
- Netlify
- Azure Static Web Apps
- AWS Amplify
- GitHub Pages

## 📄 License

Syncfusion components require a license for commercial use. This demo uses a community license key.

For production, get your license at: https://www.syncfusion.com/sales/products

## 🤝 Contributing

Feel free to fork this project and customize it for your needs!

## 📧 Support

For issues with Syncfusion components: https://support.syncfusion.com/

---

**Built with ❤️ using Angular 13 and Syncfusion**
