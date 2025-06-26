from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import pandas as pd
import os
import json
from datetime import datetime
import uuid
import sqlite3
import plotly.graph_objs as go
from flask import abort


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Create static directory if it doesn't exist
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
os.makedirs(static_dir, exist_ok=True)

# Create data directory for storing projects
data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
os.makedirs(data_dir, exist_ok=True)

# Projects file path
projects_file = os.path.join(data_dir, "projects.json")

# --- SQLite Setup ---
db_path = os.path.join(data_dir, 'projects.db')
def init_db():
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        createdDate TEXT NOT NULL,
        lastModified TEXT NOT NULL,
        status TEXT NOT NULL,
        tags TEXT,
        visualizations TEXT
    )''')
    conn.commit()
    conn.close()
init_db()

def db_add_project(project):
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute('''INSERT INTO projects (id, name, description, createdDate, lastModified, status, tags, visualizations)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
              (project['id'], project['name'], project['description'], project['createdDate'],
               project['lastModified'], project['status'], json.dumps(project['tags']), json.dumps(project['visualizations'])))
    conn.commit()
    conn.close()

def db_get_projects():
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute('SELECT * FROM projects')
    rows = c.fetchall()
    conn.close()
    projects = []
    for row in rows:
        projects.append({
            'id': row[0],
            'name': row[1],
            'description': row[2],
            'createdDate': row[3],
            'lastModified': row[4],
            'status': row[5],
            'tags': json.loads(row[6]) if row[6] else [],
            'visualizations': json.loads(row[7]) if row[7] else []
        })
    return projects

def line_plot(data, title="RMSD vs Time", xlabel="Time (ns)", ylabel="RMSD (nm)", save_path=None):
    """
    Visualizes the RMSD data for each folder.
    """
    plt.figure(figsize=(10, 6))
    for folder, (time, rmsd) in data.items():
        plt.plot(time, rmsd, label=folder)

    plt.title(title)
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    plt.legend()
    plt.tight_layout()
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')  # Save with high resolution
        print(f"Plot saved as {save_path}")
    else:
      plt.show()

@app.route('/rmsd-plot', methods=['POST'])
def rmsd_plot():
    try:
        file = request.files.get("file")
        if file is None or file.filename == "":
            return jsonify({"error": "No CSV file uploaded"}), 400

        df = pd.read_csv(file)
        if df.shape[1] < 2:
            return jsonify({"error": "CSV must contain at least two columns"}), 400

        data = {}
        time_col = df.columns[0]
        for col in df.columns[1:]:
            data[col] = (df[time_col].tolist(), df[col].tolist())

        title = request.form.get("title", "RMSD vs Time")
        xlabel = request.form.get("xlabel", "Time (ns)")
        ylabel = request.form.get("ylabel", "RMSD (nm)")

        # Use absolute path with static directory
        save_path = os.path.join(static_dir, "rmsd_plot.png")
        
        # Clear any previous figure to avoid overlapping plots
        plt.clf()
        plt.close('all')
        
        line_plot(data, title=title, xlabel=xlabel, ylabel=ylabel, save_path=save_path)

        return send_file(save_path, mimetype='image/png')
    
    except Exception as e:
        print(f"Error generating plot: {str(e)}")
        return jsonify({"error": f"Failed to generate plot: {str(e)}"}), 500

# Helper functions for project management
def load_projects():
    """Load projects from JSON file"""
    try:
        with open(projects_file, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading projects: {e}")
        return []

def save_projects(projects):
    """Save projects to JSON file"""
    try:
        with open(projects_file, 'w') as f:
            json.dump(projects, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving projects: {e}")
        return False

def find_project_by_id(project_id):
    """Find a project by ID"""
    projects = load_projects()
    return next((p for p in projects if p['id'] == project_id), None)

# Project Management Routes

@app.route('/api/projects', methods=['GET'])
def get_projects():
    try:
        projects = db_get_projects()
        # (Optional: add filtering/sorting here as before)
        return jsonify(projects)
    except Exception as e:
        return jsonify({"error": f"Failed to fetch projects: {str(e)}"}), 500

@app.route('/api/projects', methods=['POST'])
def create_project():
    try:
        data = request.get_json()
        if not data.get('name'):
            return jsonify({"error": "Project name is required"}), 400
        if not data.get('description'):
            return jsonify({"error": "Project description is required"}), 400
        project = {
            "id": str(uuid.uuid4()),
            "name": data['name'].strip(),
            "description": data['description'].strip(),
            "createdDate": datetime.now().isoformat(),
            "lastModified": datetime.now().isoformat(),
            "status": "active",
            "tags": data.get('tags', []),
            "visualizations": []
        }
        db_add_project(project)
        # Also save to JSON for backward compatibility
        projects = load_projects()
        projects.append(project)
        save_projects(projects)
        return jsonify(project), 201
    except Exception as e:
        return jsonify({"error": f"Failed to create project: {str(e)}"}), 500

@app.route('/api/projects/<project_id>', methods=['GET'])
def get_project(project_id):
    """Get a specific project by ID"""
    try:
        project = find_project_by_id(project_id)
        if not project:
            return jsonify({"error": "Project not found"}), 404
        
        return jsonify(project)
    except Exception as e:
        return jsonify({"error": f"Failed to fetch project: {str(e)}"}), 500

@app.route('/api/projects/<project_id>', methods=['PUT'])
def update_project(project_id):
    """Update a specific project"""
    try:
        data = request.get_json()
        projects = load_projects()
        
        # Find project index
        project_index = next((i for i, p in enumerate(projects) if p['id'] == project_id), None)
        if project_index is None:
            return jsonify({"error": "Project not found"}), 404
        
        # Update project fields
        project = projects[project_index]
        if 'name' in data:
            project['name'] = data['name'].strip()
        if 'description' in data:
            project['description'] = data['description'].strip()
        if 'status' in data:
            project['status'] = data['status']
        if 'tags' in data:
            project['tags'] = data['tags']
        
        project['lastModified'] = datetime.now().isoformat()
        
        # Save projects
        if save_projects(projects):
            return jsonify(project)
        else:
            return jsonify({"error": "Failed to update project"}), 500
            
    except Exception as e:
        return jsonify({"error": f"Failed to update project: {str(e)}"}), 500

@app.route('/api/projects/<project_id>', methods=['DELETE'])
def delete_project(project_id):
    """Delete a specific project"""
    try:
        projects = load_projects()
        
        # Find and remove project
        projects = [p for p in projects if p['id'] != project_id]
        
        # Save projects
        if save_projects(projects):
            return jsonify({"message": "Project deleted successfully"})
        else:
            return jsonify({"error": "Failed to delete project"}), 500
            
    except Exception as e:
        return jsonify({"error": f"Failed to delete project: {str(e)}"}), 500

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "working"})

@app.route('/api/plot', methods=['POST'])
def plot():
    try:
        data = request.get_json()
        plot_type = data.get('plotType', 'static')
        x = data.get('x', [])
        y_list = data.get('y', [])
        colors = data.get('colors', [])
        title = data.get('title', 'Plot')
        if plot_type == 'dynamic':
            fig = go.Figure()
            for idx, y in enumerate(y_list):
                color = colors[idx] if idx < len(colors) else None
                fig.add_trace(go.Scatter(x=x, y=y, mode='lines+markers',
                                         line=dict(color=color) if color else {}))
            fig.update_layout(title=title)
            return jsonify({'plotly_html': fig.to_html(full_html=False)})
        else:
            plt.figure()
            for idx, y in enumerate(y_list):
                color = colors[idx] if idx < len(colors) else None
                plt.plot(x, y, color=color if color else None)
            plt.title(title)
            plt.xlabel('X')
            plt.ylabel('Y')
            static_path = os.path.join(static_dir, 'plot.png')
            plt.savefig(static_path)
            plt.close()
            return send_file(static_path, mimetype='image/png')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def db_update_project_visualizations(project_id, visualizations):
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute('UPDATE projects SET visualizations = ?, lastModified = ? WHERE id = ?',
              (json.dumps(visualizations), datetime.now().isoformat(), project_id))
    conn.commit()
    conn.close()

@app.route('/api/projects/<project_id>/visualizations', methods=['GET'])
def list_visualizations(project_id):
    project = find_project_by_id(project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    return jsonify(project.get('visualizations', []))

@app.route('/api/projects/<project_id>/visualizations', methods=['POST'])
def add_visualization(project_id):
    data = request.get_json()
    if not data.get('name') or not data.get('type') or not data.get('config'):
        return jsonify({'error': 'Missing required fields'}), 400
    project = find_project_by_id(project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    viz = {
        'id': str(uuid.uuid4()),
        'name': data['name'],
        'type': data['type'],
        'config': data['config'],
        'createdDate': datetime.now().isoformat(),
        'lastModified': datetime.now().isoformat()
    }
    visualizations = project.get('visualizations', [])
    visualizations.append(viz)
    db_update_project_visualizations(project_id, visualizations)
    # Also update JSON file
    projects = load_projects()
    for p in projects:
        if p['id'] == project_id:
            p['visualizations'] = visualizations
            p['lastModified'] = datetime.now().isoformat()
    save_projects(projects)
    return jsonify(viz), 201

@app.route('/api/projects/<project_id>/visualizations/<viz_id>', methods=['GET'])
def get_visualization(project_id, viz_id):
    project = find_project_by_id(project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    viz = next((v for v in project.get('visualizations', []) if v['id'] == viz_id), None)
    if not viz:
        return jsonify({'error': 'Visualization not found'}), 404
    return jsonify(viz)

@app.route('/api/projects/<project_id>/visualizations/<viz_id>', methods=['PUT'])
def update_visualization(project_id, viz_id):
    data = request.get_json()
    project = find_project_by_id(project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    visualizations = project.get('visualizations', [])
    viz = next((v for v in visualizations if v['id'] == viz_id), None)
    if not viz:
        return jsonify({'error': 'Visualization not found'}), 404
    viz['name'] = data.get('name', viz['name'])
    viz['type'] = data.get('type', viz['type'])
    viz['config'] = data.get('config', viz['config'])
    viz['lastModified'] = datetime.now().isoformat()
    db_update_project_visualizations(project_id, visualizations)
    # Also update JSON file
    projects = load_projects()
    for p in projects:
        if p['id'] == project_id:
            p['visualizations'] = visualizations
            p['lastModified'] = datetime.now().isoformat()
    save_projects(projects)
    return jsonify(viz)

@app.route('/api/projects/<project_id>/visualizations/<viz_id>', methods=['DELETE'])
def delete_visualization(project_id, viz_id):
    project = find_project_by_id(project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    visualizations = project.get('visualizations', [])
    new_visualizations = [v for v in visualizations if v['id'] != viz_id]
    db_update_project_visualizations(project_id, new_visualizations)
    # Also update JSON file
    projects = load_projects()
    for p in projects:
        if p['id'] == project_id:
            p['visualizations'] = new_visualizations
            p['lastModified'] = datetime.now().isoformat()
    save_projects(projects)
    return jsonify({'message': 'Visualization deleted'})

if __name__ == '__main__':
    app.run(debug=False)

