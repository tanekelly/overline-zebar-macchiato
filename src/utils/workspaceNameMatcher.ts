// Workspace name matching system
// Maps specific process combinations to custom workspace names

export interface WorkspaceNameMatch {
  processes: string[];
  name: string;
}

// Define workspace name matches
// Add new matches by adding objects to this array
// Each match should have:
// - processes: array of process names that must be present in the workspace
// - name: the custom name to display when all processes are found
const WORKSPACE_NAME_MATCHES: WorkspaceNameMatch[] = [
  {
    processes: ["docker", "datagrip"],
    name: "Database"
  },
  {
    processes: ["chrome"],
    name: "Web"
  },
  {
    processes: ["cursor"],
    name: "Dev"
  },
  {
    processes: ["cursor", "cmd"],
    name: "Dev"
  },
  {
    processes: ["datagrip64"],
    name: "Datagrip"
  },
  {
    processes: ["steamwebhelper"],
    name: "Steam"
  },
  {
    processes: ["Docker Desktop"],
    name: "Docker"
  }
];

/**
 * Get the custom workspace name based on the apps running in the workspace
 * @param workspaceApps - Array of app names running in the workspace
 * @param workspaceProcesses - Array of original process names (for matching)
 * @param workspaceNumber - The workspace number to use as fallback
 * @returns Custom workspace name if a match is found, single app name if only one app, workspace number if multiple apps, null otherwise
 */
export function getWorkspaceNameFromProcesses(workspaceApps: string[], workspaceProcesses: string[] = [], workspaceNumber?: string): string | null {
  // Convert process names to lowercase for case-insensitive matching
  const normalizedProcesses = workspaceProcesses.map(p => p.toLowerCase());
  
  // Check each match first (priority over single app names)
  for (const match of WORKSPACE_NAME_MATCHES) {
    const matchProcesses = match.processes.map(p => p.toLowerCase());
    
    // Check if all required processes are present in the workspace
    const allProcessesPresent = matchProcesses.every(process => 
      normalizedProcesses.some(workspaceProcess => 
        workspaceProcess.includes(process) || process.includes(workspaceProcess)
      )
    );
    
    // Also check that there are no extra processes (exact match)
    const noExtraProcesses = normalizedProcesses.every(workspaceProcess => 
      matchProcesses.some(process => 
        workspaceProcess.includes(process) || process.includes(workspaceProcess)
      )
    );
    
    if (allProcessesPresent && noExtraProcesses) {
      // Include workspace number if available and different from the match name
      if (workspaceNumber && workspaceNumber !== match.name) {
        return `${workspaceNumber}: ${match.name}`;
      }
      return match.name;
    }
  }
  
  // If no matches found and only one app is running, use that app name (from title)
  if (workspaceApps.length === 1) {
    const appName = workspaceApps[0];
    // Include workspace number if available and different from the app name
    if (workspaceNumber && workspaceNumber !== appName) {
      return `${workspaceNumber}: ${appName}`;
    }
    return appName;
  }
  
  // If no matches found and only one process is running, use that process name
  if (workspaceProcesses.length === 1) {
    const processName = workspaceProcesses[0];
    // Include workspace number if available and different from the process name
    if (workspaceNumber && workspaceNumber !== processName) {
      return `${workspaceNumber}: ${processName}`;
    }
    return processName;
  }
  
  // If multiple processes, return the workspace number or count as fallback
  if (workspaceProcesses.length > 1) {
    return workspaceNumber || workspaceProcesses.length.toString();
  }
  
  // Fallback: if multiple app names, return the workspace number or count
  if (workspaceApps.length > 1) {
    return workspaceNumber || workspaceApps.length.toString();
  }
  
  return null;
}

/**
 * Extract a clean app name from a window title
 * @param title - The window title
 * @returns Clean app name
 */
function extractAppNameFromTitle(title: string): string {
  if (!title) return '';
  
  // Remove [Administrator] and "Administrator: " from the title
  let cleanTitle = title
    .replace(/\s*\[.*?\]\s*/g, '') // Remove [Administrator] and similar brackets
    .replace(/^Administrator:\s*/g, '') // Remove "Administrator: " prefix
    .trim();
  
  // Common patterns to extract app names from titles
  const patterns = [
    // Pattern: "filename - project - App Name"
    /.*? - .*? - (.+?)$/,
    // Pattern: "App Name - filename"
    /^(.+?) - .*$/,
    // Pattern: "App Name"
    /^(.+?)$/,
  ];
  
  for (const pattern of patterns) {
    const match = cleanTitle.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return cleanTitle.trim();
}

/**
 * Extract app names and process names from a workspace by traversing the workspace tree structure
 * @param workspace - The workspace object from glazewm
 * @returns Object containing app names and process names running in the workspace
 */
export function extractProcessesFromWorkspace(workspace: any): { appNames: string[], processNames: string[] } {
  const appNamesSet = new Set<string>();
  const processNamesSet = new Set<string>();
  
  // Safety check for workspace
  if (!workspace || typeof workspace !== 'object') {
    return { appNames: [], processNames: [] };
  }

  // Recursive function to extract app names from containers
  const extractFromContainer = (container: any) => {
    // Always collect process name for matching
    if (container.processName) {
      processNamesSet.add(container.processName);
    }
    
    // Use title if available, fallback to processName for display
    if (container.title) {
      const appName = extractAppNameFromTitle(container.title);
      if (appName) {
        appNamesSet.add(appName);
      }
    } else if (container.processName) {
      // Fallback to processName if no title
      appNamesSet.add(container.processName);
    }
    
    // Check if container has children and recursively process them
    if (container.children && Array.isArray(container.children)) {
      container.children.forEach((child: any) => {
        extractFromContainer(child);
      });
    }
  };
  
  // Check if workspace has windows property
  if (workspace.windows && Array.isArray(workspace.windows)) {
    workspace.windows.forEach((window: any) => {
      if (window.processName) {
        processNamesSet.add(window.processName);
      }
      if (window.title) {
        const appName = extractAppNameFromTitle(window.title);
        if (appName) {
          appNamesSet.add(appName);
        }
      } else if (window.processName) {
        appNamesSet.add(window.processName);
      }
    });
  }
  
  // Check if workspace has containers property
  if (workspace.containers && Array.isArray(workspace.containers)) {
    workspace.containers.forEach((container: any) => {
      extractFromContainer(container);
    });
  }
  
  // Check if workspace has children property (workspace tree structure)
  if (workspace.children && Array.isArray(workspace.children)) {
    workspace.children.forEach((child: any) => {
      extractFromContainer(child);
    });
  }
  
  // Check if workspace has a direct title or processName property
  if (workspace.processName) {
    processNamesSet.add(workspace.processName);
  }
  if (workspace.title) {
    const appName = extractAppNameFromTitle(workspace.title);
    if (appName) {
      appNamesSet.add(appName);
    }
  } else if (workspace.processName) {
    appNamesSet.add(workspace.processName);
  }
  
  return { 
    appNames: Array.from(appNamesSet), 
    processNames: Array.from(processNamesSet) 
  };
} 