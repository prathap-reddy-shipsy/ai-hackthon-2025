import {Component, Input, OnChanges} from '@angular/core';
import {Chart, ChartModule} from 'angular-highcharts';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  standalone: true,
  imports: [CommonModule, ChartModule],
})
export class ChartComponent implements OnChanges {
  @Input() showGraph: any;
  @Input() graphData: any;
  @Input() chartData = false;
  @Input() chartType = 'column';
  @Input() errorMessage = '';
  @Input() chartHeight = '320px';
  @Input() dataLabelsShow = true;

  ngOnChanges(): void {
    console.log('graphData', this.graphData);
    this.showGraph = new Chart({
      chart: {
        type: this.chartType,
        height: this.chartHeight
      },
      title: {
        text: ''
      },
      exporting: {
        buttons: {
          contextButton: {
            menuItems: [
              'viewFullscreen',
            ]
          }
        }
      },
      xAxis: {
        categories: this.graphData?.label || [],
        gridLineWidth: 1
      },
      yAxis: {
        title: {
          text: null
        },
        gridLineWidth: 1
      },
      plotOptions: {
        pie: {
          dataLabels: {
            enabled: true
          },
          showInLegend: true
        },
        series: {
          dataLabels: {
            // enabled: this.dataLabelsShow
            enabled: false
          },
          enableMouseTracking: true,
        }
      },
      series: this.graphData?.data
    });
  }
}
