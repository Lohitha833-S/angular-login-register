import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  public chart: any;
  output = '';
  actual: Array<Object> = [];
  predicted: Array<Object> = [];
  label: Array<Number> = [];
  csv_sales: Array<Number> = [];
  csv_year: Array<number> = [];
  year = 10;

  public File: any;
  public fileContent: any;

  onYearChanged(value: string): void {
    this.year = +value;
    console.log('YEAR CHANGED', this.year);
  }

  onFileSelected(event: any) {
    this.File = event.target.files[0];
    let reader = new FileReader();
    reader.readAsText(this.File);
    reader.onload = () => {
      let csvData = reader.result;
      let csvRecordsArray = (<string>csvData).split(/\r\n|\n/);

      let headersRow = this.getHeaderArray(csvRecordsArray);

      this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow.length);
    };

    reader.onerror = function () {
      console.log('error is occured while reading file!');
    };
  }

  getHeaderArray(csvRecordsArr: any) {
    let headers = (<string>csvRecordsArr[0]).split(',');
    let headerArray = [];
    for (let j = 0; j < headers.length; j++) {
      headerArray.push(headers[j]);
    }
    return headerArray;
  }
  getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {
    for (let i = 1; i < csvRecordsArray.length; i++) {
      let curruntRecord = (<string>csvRecordsArray[i]).split(',');
      if (curruntRecord.length == headerLength) {
        this.csv_sales.push(+curruntRecord[0].trim());
        this.csv_year.push(+curruntRecord[1].trim());
      }
    }
    console.log(this.csv_sales, this.csv_year);
  }

  createChart(orginal: Array<Number>, pred: Array<Number>) {
    for (let i = 0; i < orginal.length + pred.length; i++) {
      this.label.push(this.csv_year[0] + i);
    }
    for (let i = 0; i < orginal.length; i++) {
      this.actual.push({ y: orginal[i], x: this.csv_year[i] });
    }
    for (let i = 0; i < pred.length; i++) {
      this.predicted.push({
        y: pred[i],
        x: this.csv_year[this.csv_year.length - 1] + i + 1,
      });
    }
    console.log(orginal, pred);

    console.log(this.actual, this.predicted);
    this.chart = new Chart('MyChart', {
      type: 'line', //this denotes tha type of chart

      data: {
        // values on X-Axis
        labels: this.label,
        datasets: [
          {
            label: 'Actual',
            data: this.actual,
            backgroundColor: 'blue',
          },
          {
            label: 'Predicted',
            data: this.predicted,
            backgroundColor: 'red',
          },
        ],
      },
      options: {
        aspectRatio: 2.5,
      },
    });
  }

  async sales() {
    if (this.File) {
      await axios
        .post('http://localhost:5000/sales', {
          data: this.csv_sales,
          no_of_days: this.year,
        })
        .then((res) => {
          console.log(res.data);
          this.createChart(res.data.actual, res.data.predicted);
        })
        .catch((err) => console.log(err));
    } else {
      alert('SELECT THE FILE !!!!');
    }
  }
}