# SF - Data Visualization Platform

A full-stack data visualization platform built with Next.js frontend and Flask backend, designed for creating interactive charts and dashboards.

## 🚀 Features

- **Interactive Data Visualization**: Create line charts, bar charts, and scatter plots
- **CSV Data Upload**: Upload and process CSV files for visualization
- **Project Management**: Organize your visualizations into projects
- **Real-time Preview**: See your charts update in real-time as you configure them
- **Responsive Design**: Modern UI that works on desktop and mobile

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern UI components
- **Recharts** - Charting library for React

### Backend
- **Flask** - Python web framework
- **SQLite** - Lightweight database
- **Pandas** - Data manipulation and analysis
- **Plotly** - Interactive plotting library

## 📁 Project Structure

```
SF/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── lib/            # Utility functions and API
│   │   └── types/          # TypeScript type definitions
│   └── package.json
├── backend/                 # Flask backend API
│   ├── app.py              # Main Flask application
│   ├── data/               # Database and data files
│   ├── requirements.txt    # Python dependencies
│   └── vercel.json         # Vercel deployment config
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Python 3.8+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd SF
   ```

2. **Set up the Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`

3. **Set up the Backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python app.py
   ```
   The backend API will be available at `http://localhost:5000`

### Environment Variables

Create `.env.local` in the frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 📖 Usage

1. **Create a Project**: Start by creating a new project in the dashboard
2. **Upload Data**: Upload your CSV file with the data you want to visualize
3. **Configure Chart**: Choose your chart type and configure X/Y axes
4. **Preview**: See your visualization update in real-time
5. **Save**: Save your visualization to your project

## 🚀 Deployment

### Frontend (Vercel)
The frontend is configured for Vercel deployment. Simply connect your GitHub repository to Vercel.

### Backend (Vercel)
The backend includes `vercel.json` for serverless deployment on Vercel.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Recharts](https://recharts.org/) for the charting library
- [Plotly](https://plotly.com/) for the backend plotting capabilities 