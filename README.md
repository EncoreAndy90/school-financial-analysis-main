# School Financial Analysis Tool

A comprehensive financial analysis application for schools to analyze the impact of tuition fee increases, staff pay increases, and discounts over a 3-year projection period. Built with React, TypeScript, and Vite.

## 🎯 Overview

This tool helps school administrators model and visualize financial scenarios by analyzing:
- Tuition fee increases (2-6%)
- Staff pay increases (1-5%)
- Fee discounts (staff children: 50%, other children: 10-20%)
- Inflation projections for each year
- 3-year financial projections

## ✨ Features

### Financial Modeling
- **3-Year Projections**: Analyze financial impact over 3 years
- **Fee Increase Analysis**: Model tuition fee increases between 2-6%
- **Pay Increase Analysis**: Model staff pay increases between 1-5%
- **Discount Calculations**: 
  - Staff children receive 50% discount
  - Other children receive 10-20% discount
  - Total discount effect variable (10-15%)
- **Inflation Adjustments**: Separate inflation rates for each projected year
- **Turnover vs Surplus**: Clear distinction between revenue (turnover) and profit (surplus)

### Data Visualization
- **Interactive Charts**: 
  - Turnover vs Costs line chart
  - Surplus over time bar chart
  - Revenue breakdown comparison
- **Financial Table**: Comprehensive table showing all metrics by year
- **Summary Dashboard**: Key metrics at a glance

### Manual Calculations
- **Step-by-Step Breakdown**: Detailed manual calculations for each year
- **Transparent Formulas**: See exactly how each number is calculated
- **Verification**: Verify all calculations manually

### User Interface
- **Interactive Sliders**: Easy adjustment of percentage values
- **Manual Input**: Direct number input for precise control
- **Real-Time Updates**: Instant recalculation as you adjust parameters
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, professional interface with gradient styling

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/EncoreAndy90/school-financial-analysis.git
cd school-financial-analysis
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 📊 Usage

### Input Parameters

1. **Number of Children**: Total number of students
2. **Fee per Term**: Current fee charged per term (£)
3. **Number of Staff Children**: Children of staff members (receive 50% discount)
4. **Average Discount for Other Children**: Discount percentage for non-staff children (10-20%)
5. **Total Discount Effect**: Overall discount effect on revenue (10-15%)
6. **Tuition Fee Increase**: Annual fee increase percentage (2-6%)
7. **Staff Pay Increase**: Annual staff pay increase percentage (1-5%)
8. **Current Annual Surplus**: Current year's surplus/profit
9. **Inflation Rates**: Projected inflation for Year 1, Year 2, and Year 3

### Understanding the Results

- **Gross Revenue**: Total revenue before discounts
- **Discounts**: Total discount amount applied
- **Turnover (Revenue)**: Net revenue after discounts
- **Costs**: Total costs including pay increases and inflation
- **Surplus**: Profit (Turnover - Costs)

## 🛠️ Technology Stack

- **React 19.2.0**: UI framework
- **TypeScript 5.9.3**: Type safety
- **Vite 7.2.4**: Build tool and dev server
- **Recharts**: Charting library for data visualization
- **ESLint**: Code linting

## 📁 Project Structure

```
school-financial-analysis/
├── src/
│   ├── App.tsx          # Main application component
│   ├── App.css          # Application styles
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html          # HTML template
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

## 📈 Calculation Methodology

### Revenue Calculation
1. Gross Revenue = Number of Children × Fee per Term × 3 terms
2. Discount Amount = Gross Revenue × Total Discount Effect %
3. Turnover = Gross Revenue - Discount Amount

### Cost Calculation
1. Base Costs = Turnover - Surplus (for current year)
2. Apply Pay Increase: Base Costs × (1 + Pay Increase %)
3. Apply Inflation: Costs after pay increase × (1 + Inflation %)

### Projections
- Fee increases compound annually on gross revenue
- Pay increases compound annually on base costs
- Inflation is applied each year to costs
- Discounts are recalculated based on new gross revenue each year

## 🎨 Features in Detail

### Interactive Controls
- Sliders for percentage adjustments with real-time feedback
- Manual number inputs for precise values
- All inputs validate ranges and constraints

### Visualizations
- **Line Chart**: Shows revenue and costs trends over time
- **Bar Charts**: Display surplus and revenue breakdowns
- **Color Coding**: Green for positive values, red for negative

### Manual Calculations Section
- Step-by-step breakdown of all calculations
- Formula display with actual values
- Easy verification of financial projections

## 📝 License

This project is open source and available for use.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue on GitHub.

## 🔗 Repository

[View on GitHub](https://github.com/EncoreAndy90/school-financial-analysis)

---

Built with ❤️ using React, TypeScript, and Vite
