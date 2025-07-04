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
    processes: ["steamwebhelper", "steamwebhelper"],
    name: "Steam"
  }
];

/**
 * Get the custom workspace name based on the apps running in the workspace
 * @param workspaceApps - Array of app names running in the workspace
 * @param workspaceProcesses - Array of original process names (for matching)
 * @returns Custom workspace name if a match is found, single app name if only one app, null otherwise
 */
export function getWorkspaceNameFromProcesses(workspaceApps: string[], workspaceProcesses: string[] = []): string | null {
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
    
    if (allProcessesPresent) {
      return match.name;
    }
  }
  
  // If no matches found and only one app is running, use that as the workspace name
  if (workspaceApps.length === 1) {
    return workspaceApps[0];
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
  const appNames: string[] = [];
  const processNames: string[] = [];
  
  if (workspace && typeof workspace === 'object') {
    // Recursive function to extract app names from containers
    const extractFromContainer = (container: any) => {
      // Always collect process name for matching
      if (container.processName) {
        processNames.push(container.processName);
      }
      
      // Use title if available, fallback to processName for display
      if (container.title) {
        const appName = extractAppNameFromTitle(container.title);
        if (appName) {
          appNames.push(appName);
        }
      } else if (container.processName) {
        // Fallback to processName if no title
        appNames.push(container.processName);
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
          processNames.push(window.processName);
        }
        if (window.title) {
          const appName = extractAppNameFromTitle(window.title);
          if (appName) {
            appNames.push(appName);
          }
        } else if (window.processName) {
          appNames.push(window.processName);
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
      processNames.push(workspace.processName);
    }
    if (workspace.title) {
      const appName = extractAppNameFromTitle(workspace.title);
      if (appName) {
        appNames.push(appName);
      }
    } else if (workspace.processName) {
      appNames.push(workspace.processName);
    }
  }
  
  return { appNames, processNames };
} 