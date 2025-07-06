# FastAPI backend for ScientiFlow
import os
import io
import json
import sqlite3
from datetime import datetime
from typing import List, Optional, Dict, Any

import pandas as pd
import matplotlib.pyplot as plt
import plotly.express as px
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from pydantic import BaseModel
import uuid

# --- FastAPI app setup ---
app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- SQLite setup ---
data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
os.makedirs(data_dir, exist_ok=True)
db_path = os.path.join(data_dir, 'projects.db')

# --- Database schema ---
def init_db():
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        createdDate TEXT NOT NULL,
        lastModified TEXT NOT NULL
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS visualizations (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        config_json TEXT NOT NULL,
        createdDate TEXT NOT NULL,
        lastModified TEXT NOT NULL,
        FOREIGN KEY(project_id) REFERENCES projects(id)
    )''')
    conn.commit()
    conn.close()
init_db()

# --- Pydantic models ---
class VisualizationMeta(BaseModel):
    name: str
    description: Optional[str] = None
    config: Dict[str, Any]

# --- Helper functions ---
def save_visualization(project_id: str, meta: VisualizationMeta) -> str:
    viz_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute('''INSERT INTO visualizations (id, project_id, name, description, config_json, createdDate, lastModified)
                 VALUES (?, ?, ?, ?, ?, ?, ?)''',
              (viz_id, project_id, meta.name, meta.description, json.dumps(meta.config), now, now))
    conn.commit()
    conn.close()
    return viz_id

def get_visualization(project_id: str, viz_id: str) -> Optional[dict]:
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute('SELECT id, name, description, config_json, createdDate, lastModified FROM visualizations WHERE id=? AND project_id=?', (viz_id, project_id))
    row = c.fetchone()
    conn.close()
    if row:
        return {
            'id': row[0],
            'name': row[1],
            'description': row[2],
            'config': json.loads(row[3]),
            'createdDate': row[4],
            'lastModified': row[5]
        }
    return None

# --- Plotting logic ---

def plot_dynamic_plotly_json(df: pd.DataFrame, config: dict):
    """
    Generate a Plotly Figure for various plot types (line, bar, scatter).
    Returns a plotly.graph_objs.Figure (not HTML).
    """
    import plotly.graph_objs as go
    import plotly.express as px
    print('Received config:', config)
    plot_type = config.get('plot_type', 'line')
    plot_properties = config.get('plot_properties', {})
    x_cols = plot_properties.get('x_column_names') or config.get('x_column_names') or []
    y_cols = plot_properties.get('y_column_names') or config.get('y_column_names') or []
    color_map = plot_properties.get('color') or config.get('color') or {}
    title = config.get('title', '')
    xlabel = config.get('x_label', '')
    ylabel = config.get('y_label', '')
    fig = go.Figure()
    found = False
    if plot_type == 'line':
        for y_col in y_cols:
            for x_col in x_cols:
                if x_col in df.columns and y_col in df.columns:
                    fig.add_trace(go.Scatter(
                        x=df[x_col],
                        y=df[y_col],
                        mode='lines',
                        name=f'{y_col} vs {x_col}',
                        line=dict(color=color_map.get(y_col)),
                    ))
                    found = True
    elif plot_type == 'scatter':
        for y_col in y_cols:
            for x_col in x_cols:
                if x_col in df.columns and y_col in df.columns:
                    fig.add_trace(go.Scatter(
                        x=df[x_col],
                        y=df[y_col],
                        mode='markers',
                        name=f'{y_col} vs {x_col}',
                        marker=dict(color=color_map.get(y_col)),
                    ))
                    found = True
    elif plot_type == 'bar':
        for y_col in y_cols:
            if x_cols and x_cols[0] in df.columns and y_col in df.columns:
                fig.add_trace(go.Bar(
                    x=df[x_cols[0]],
                    y=df[y_col],
                    name=y_col,
                    marker=dict(color=color_map.get(y_col)),
                ))
                found = True
    fig.update_layout(title=title, xaxis_title=xlabel, yaxis_title=ylabel)
    if not found:
        print("[dynamic-json plot] No valid plot generated.")
    return fig.to_dict()  # returns dict with 'data' and 'layout'

def plot_static_matplotlib(df: pd.DataFrame, config: dict) -> io.BytesIO:
    print('Received config:', config)
    plt.clf()
    plt.close('all')
    plt.figure(figsize=(10, 6))
    plot_type = config.get('plot_type', 'line')
    plot_properties = config.get('plot_properties', {})

    # Support both nested and top-level config structures for backward compatibility
    x_cols = plot_properties.get('x_column_names') or config.get('x_column_names') or []
    y_cols = plot_properties.get('y_column_names') or config.get('y_column_names') or []
    color_map = plot_properties.get('color') or config.get('color') or {}

    # Debug logging when falling back to top-level keys
    if not plot_properties.get('x_column_names') and config.get('x_column_names'):
        print('[config compatibility] Using top-level x_column_names')
    if not plot_properties.get('y_column_names') and config.get('y_column_names'):
        print('[config compatibility] Using top-level y_column_names')
    if not plot_properties.get('color') and config.get('color'):
        print('[config compatibility] Using top-level color map')
    title = config.get('title', '')
    xlabel = config.get('x_label', '')
    ylabel = config.get('y_label', '')
    print(f'Plot type: {plot_type}, x_cols: {x_cols}, y_cols: {y_cols}, color_map: {color_map}')
    print('DataFrame columns:', list(df.columns))

    # --- Line Plot ---
    if plot_type == 'line':
        for y_col in y_cols:
            for x_col in x_cols:
                if x_col in df.columns and y_col in df.columns:
                    plt.plot(df[x_col], df[y_col], label=f"{y_col} vs {x_col}", color=color_map.get(y_col))
                else:
                    print(f"Missing columns for line plot: x_col={x_col}, y_col={y_col}")
    # --- Scatter Plot ---
    elif plot_type == 'scatter':
        for y_col in y_cols:
            for x_col in x_cols:
                if x_col in df.columns and y_col in df.columns:
                    plt.scatter(df[x_col], df[y_col], label=f"{y_col} vs {x_col}", color=color_map.get(y_col))
                else:
                    print(f"Missing columns for scatter plot: x_col={x_col}, y_col={y_col}")
    # --- Bar Plot ---
    elif plot_type == 'bar':
        width = 0.35
        for idx, y_col in enumerate(y_cols):
            if x_cols and y_col in df.columns and x_cols[0] in df.columns:
                x = df[x_cols[0]]
                y = df[y_col]
                plt.bar([i + idx*width for i in range(len(x))], y, width=width, label=y_col, color=color_map.get(y_col))
            else:
                print(f"Missing columns for bar plot: x_col={x_cols[0] if x_cols else None}, y_col={y_col}")
        if x_cols:
            plt.xticks([i + width/2 for i in range(len(df[x_cols[0]]))], df[x_cols[0]])
    # --- Add more plot types as needed ---
    plt.title(title)
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    plt.legend()
    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=300, bbox_inches='tight')
    buf.seek(0)
    return buf

def plot_dynamic_plotly(df: pd.DataFrame, config: dict) -> str:
    """Generate interactive Plotly HTML for various plot types.

    Supported plot types: line, bar, scatter.
    The function gracefully handles different config shapes (nested plot_properties or top-level keys).
    It always embeds the Plotly JS library via CDN so the returned HTML snippet is self-contained for client rendering.
    """
    print('Received config:', config)
    plot_type = config.get('plot_type', 'line')
    plot_properties = config.get('plot_properties', {})

    # Support both nested and top-level config structures for backward compatibility
    x_cols = plot_properties.get('x_column_names') or config.get('x_column_names') or []
    y_cols = plot_properties.get('y_column_names') or config.get('y_column_names') or []
    color_map = plot_properties.get('color') or config.get('color') or {}

    # Debug logging when falling back to top-level keys
    if not plot_properties.get('x_column_names') and config.get('x_column_names'):
        print('[config compatibility] Using top-level x_column_names')
    if not plot_properties.get('y_column_names') and config.get('y_column_names'):
        print('[config compatibility] Using top-level y_column_names')
    if not plot_properties.get('color') and config.get('color'):
        print('[config compatibility] Using top-level color map')
    title = config.get('title', '')
    xlabel = config.get('x_label', '')
    ylabel = config.get('y_label', '')
    fig = None
    print(f"[dynamic plot] plot_type={plot_type}, x_cols={x_cols}, y_cols={y_cols}, color_map={color_map}")
    if not x_cols or not y_cols:
        print("[dynamic plot] Missing x_cols or y_cols, cannot plot.")
        return '<div style="color:red">No valid x/y columns for plotting.</div>'

    # --- Line Plot ---
    if plot_type == 'line':
        # Plot all y_cols vs all x_cols
        for y_col in y_cols:
            for x_col in x_cols:
                if x_col in df.columns and y_col in df.columns:
                    fig = px.line(df, x=x_col, y=y_col, color_discrete_map=color_map, title=title, labels={'x': xlabel, 'y': ylabel})
                    break
        if fig is None:
            print("[dynamic plot] No valid line plot generated.")
    # --- Bar Plot ---
    elif plot_type == 'bar':
        orientation = config.get('orientation', 'v')
        barmode = config.get('bar_mode', 'group')
        for y_col in y_cols:
            for x_col in x_cols:
                if x_col in df.columns and y_col in df.columns:
                    fig = px.bar(
                        df,
                        x=x_col if orientation == 'v' else y_col,
                        y=y_col if orientation == 'v' else x_col,
                        orientation=orientation,
                        color_discrete_map=color_map,
                        title=title,
                        labels={'x': xlabel, 'y': ylabel},
                    )
                    fig.update_layout(barmode=barmode)
                    break
        if fig is None:
            print("[dynamic plot] No valid bar plot generated.")
    # --- Scatter Plot ---
    elif plot_type == 'scatter':
        # Plot all y_cols vs all x_cols as separate traces
        import plotly.graph_objs as go
        fig = go.Figure()
        found = False
        for y_col in y_cols:
            for x_col in x_cols:
                if x_col in df.columns and y_col in df.columns:
                    fig.add_trace(go.Scatter(
                        x=df[x_col],
                        y=df[y_col],
                        mode='markers',
                        name=f'{y_col} vs {x_col}',
                        marker=dict(color=color_map.get(y_col)),
                    ))
                    found = True
        fig.update_layout(title=title, xaxis_title=xlabel, yaxis_title=ylabel)
        if not found:
            print("[dynamic plot] No valid scatter plot generated.")
            fig = None
    # --- Add more plot types as needed ---
    if fig is not None:
        return fig.to_html(full_html=False, include_plotlyjs='cdn')
    return '<div style="color:red">No plot generated (invalid columns or config).</div>'

# --- API Endpoints ---
@app.post("/api/plot")
async def generate_plot(
    mode: str = Form(...),
    config: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Generate a plot (static or dynamic) from uploaded data and config.
    mode: 'static' (matplotlib PNG) or 'dynamic' (plotly HTML)
    config: JSON string with plot configuration
    file: CSV or JSON data file
    """
    try:
        config_dict = json.loads(config)
        # Read data
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file.file)
        elif file.filename.endswith('.json'):
            df = pd.read_json(file.file)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")
        if mode == 'static':
            buf = plot_static_matplotlib(df, config_dict)
            from fastapi.responses import StreamingResponse
            print('Returning static matplotlib plot as StreamingResponse')
            return StreamingResponse(buf, media_type='image/png')
        elif mode == 'dynamic':
            html = plot_dynamic_plotly(df, config_dict)
            return HTMLResponse(content=html)
        elif mode == 'dynamic-json':
            fig = plot_dynamic_plotly_json(df, config_dict)
            # fig is a plotly.graph_objs.Figure
            # Return serializable dict for react-plotly.js
            return JSONResponse({
                'data': fig['data'],
                'layout': fig['layout']
            })
        else:
            raise HTTPException(status_code=400, detail="Invalid mode")
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/api/projects/{project_id}/visualizations")
async def list_viz(project_id: str):
    """Return all visualizations for a project"""
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute('SELECT id, name, description, config_json, createdDate, lastModified FROM visualizations WHERE project_id=?', (project_id,))
    rows = c.fetchall()
    conn.close()
    return [
        {
            'id': row[0],
            'name': row[1],
            'description': row[2],
            'config': json.loads(row[3]),
            'createdDate': row[4],
            'lastModified': row[5]
        }
        for row in rows
    ]


@app.post("/api/projects/{project_id}/visualizations")
async def save_viz(project_id: str, meta: VisualizationMeta):
    """
    Save a visualization config and metadata under a project.
    """
    try:
        viz_id = save_visualization(project_id, meta)
        return {"viz_id": viz_id}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/api/projects/{project_id}/visualizations/{viz_id}")
async def get_viz(project_id: str, viz_id: str):
    """
    Retrieve a saved visualization config and metadata.
    """
    viz = get_visualization(project_id, viz_id)
    if viz:
        return viz
    else:
        raise HTTPException(status_code=404, detail="Visualization not found")

@app.get("/api/projects")
async def list_projects():
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute('SELECT id, name, description, createdDate, lastModified FROM projects')
    rows = c.fetchall()
    conn.close()
    projects = [
        {
            'id': row[0],
            'name': row[1],
            'description': row[2],
            'createdDate': row[3],
            'lastModified': row[4],
        }
        for row in rows
    ]
    return projects

@app.post("/api/projects")
async def create_project(project: Dict[str, Any] = Body(...)):
    """
    Create a new project with name and description.
    """
    try:
        project_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        name = project.get('name', '').strip()
        description = project.get('description', '').strip()
        if not name:
            raise HTTPException(status_code=400, detail="Project name is required")
        if not description:
            raise HTTPException(status_code=400, detail="Project description is required")
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        c.execute('''INSERT INTO projects (id, name, description, createdDate, lastModified)
                     VALUES (?, ?, ?, ?, ?)''',
                  (project_id, name, description, now, now))
        conn.commit()
        conn.close()
        return {
            'id': project_id,
            'name': name,
            'description': description,
            'createdDate': now,
            'lastModified': now
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/")
def health_check():
    return {"status": "working"}

