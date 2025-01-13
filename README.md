# EV Data Analysis Dashboard
## Overview
This project implements an **Electric Vehicle Analysis Dashboard** using React, Chart.js, and PapaParse for visualizing and analyzing electric vehicle (EV) data. The dashboard provides several interactive charts and filters for exploring various aspects of EV data, including the distribution of vehicle counts by county, make, model year, range, price, and more. The user interface also supports dynamic theming with a toggle between dark and light modes.

## Features
- **Dynamic Data Filtering:** Filter EV data by year and make.
- **Interactive Charts:** Visualize data through multiple chart types (Bar, Pie, Line, Scatter).
- **Theming Support:** Toggle between dark and light themes.
- **CSV Data Parsing:** Load and parse EV data from a CSV file using PapaParse.
- **Chart Types Supported:**
  - **Bar Charts** for distribution by County, Make, Electric Range, and Utility.
  - **Pie Charts** for EV Type Distribution and CAFV Eligibility.
  - **Line Chart** for Model Year Trend.
  - **Scatter Plot** for Price vs Electric Range.

## Prerequisites
- Node.js
- npm (Node Package Manager)

## Installation

### 1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Data
The dashboard uses an **Electric Vehicle Population Data** CSV file (`/Electric_Vehicle_Population_Data.csv`) for the analysis. This file must be placed in the public directory of the project for the application to function correctly.

### Key Columns in the Data:
- `Model Year`: The year the vehicle model was released.
- `Make`: The manufacturer of the vehicle.
- `County`: The county where the vehicle is registered.
- `Electric Range`: The range of the electric vehicle (in miles).
- `Base MSRP`: The base price of the vehicle.
- `Electric Vehicle Type`: The type of the electric vehicle (BEV or PHEV).
- `Clean Alternative Fuel Vehicle (CAFV) Eligibility`: Eligibility status for CAFV.
- `Electric Utility`: The electric utility provider for the vehicle.

## Usage
### 1. Filters
- **Year Filter:** Allows the user to filter the EV data by model year.
- **Make Filter:** Allows the user to filter the EV data by manufacturer.

### 2. Charts
- Click on a chart to view more detailed information.
- Each chart type (Bar, Pie, Line, Scatter) provides a different visualization of the filtered data.

### 3. Theme Toggle
- Click the sun/moon icon to toggle between dark and light themes.

## Technology Stack
- **React**: JavaScript library for building user interfaces.
- **Chart.js**: A flexible JavaScript charting library for creating interactive charts.
- **PapaParse**: A fast and powerful CSV parser for the browser.
- **Lucide-react**: A collection of customizable, open-source icons for React.

## License
This project is licensed under the MIT License.

## Contributions
Feel free to submit issues or pull requests for any enhancements or fixes. Contributions are welcome!
