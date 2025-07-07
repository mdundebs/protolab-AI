import { WebSocket } from 'ws';
import type { Express } from 'express';

export interface CollaborationWorkspace {
  id: string;
  name: string;
  type: 'proposal' | 'business_plan' | 'resume' | 'pitch_deck';
  participants: Participant[];
  documents: WorkspaceDocument[];
  createdAt: Date;
  lastModified: Date;
  status: 'active' | 'completed' | 'archived';
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'editor' | 'reviewer' | 'viewer';
  avatar?: string;
  lastSeen: Date;
  isOnline: boolean;
}

export interface WorkspaceDocument {
  id: string;
  name: string;
  type: 'template' | 'draft' | 'final';
  content: any;
  version: number;
  changes: DocumentChange[];
  comments: Comment[];
  lastEditedBy: string;
  lastEditedAt: Date;
}

export interface DocumentChange {
  id: string;
  userId: string;
  userName: string;
  type: 'insert' | 'delete' | 'format' | 'replace';
  position: number;
  content: string;
  timestamp: Date;
  approved: boolean;
  reviewedBy?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  position: number;
  resolved: boolean;
  replies: Comment[];
  timestamp: Date;
}

// In-memory storage for demo (use database in production)
const workspaces = new Map<string, CollaborationWorkspace>();
const activeConnections = new Map<string, WebSocket[]>();

export function setupCollaborationRoutes(app: Express) {
  // Create new workspace
  app.post('/api/collab/workspace', (req, res) => {
    try {
      const { name, type, participants } = req.body;
      
      // Validate workspace name
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Workspace name is required'
        });
      }

      if (name.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Workspace name must be at least 3 characters'
        });
      }
      
      const workspace: CollaborationWorkspace = {
        id: `ws_${Date.now()}`,
        name: name.trim(),
        type,
        participants: (participants || []).map((p: any) => ({
          ...p,
          id: `user_${Date.now()}_${Math.random()}`,
          isOnline: false,
          lastSeen: new Date()
        })),
        documents: [],
        createdAt: new Date(),
        lastModified: new Date(),
        status: 'active'
      };

      workspaces.set(workspace.id, workspace);
      
      res.json({
        success: true,
        workspace,
        joinUrl: `/collab/${workspace.id}`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create workspace'
      });
    }
  });

  // Get workspace details
  app.get('/api/collab/workspace/:id', (req, res) => {
    try {
      const workspace = workspaces.get(req.params.id);
      
      if (!workspace) {
        return res.status(404).json({
          success: false,
          error: 'Workspace not found'
        });
      }

      res.json({
        success: true,
        workspace
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get workspace'
      });
    }
  });

  // Get all workspaces
  app.get('/api/collab/workspaces', (req, res) => {
    try {
      const allWorkspaces = Array.from(workspaces.values());
      
      res.json({
        success: true,
        workspaces: allWorkspaces
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get workspaces'
      });
    }
  });

  // Add document to workspace
  app.post('/api/collab/workspace/:id/document', (req, res) => {
    try {
      const workspace = workspaces.get(req.params.id);
      
      if (!workspace) {
        return res.status(404).json({
          success: false,
          error: 'Workspace not found'
        });
      }

      const { name, type, content } = req.body;
      
      const document: WorkspaceDocument = {
        id: `doc_${Date.now()}`,
        name,
        type,
        content,
        version: 1,
        changes: [],
        comments: [],
        lastEditedBy: 'current_user',
        lastEditedAt: new Date()
      };

      workspace.documents.push(document);
      workspace.lastModified = new Date();
      
      // Broadcast to all connected clients
      broadcastToWorkspace(workspace.id, {
        type: 'document_added',
        document
      });

      res.json({
        success: true,
        document
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add document'
      });
    }
  });

  // Track document changes
  app.post('/api/collab/workspace/:workspaceId/document/:docId/change', (req, res) => {
    try {
      const workspace = workspaces.get(req.params.workspaceId);
      
      if (!workspace) {
        return res.status(404).json({
          success: false,
          error: 'Workspace not found'
        });
      }

      const document = workspace.documents.find(d => d.id === req.params.docId);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found'
        });
      }

      const { type, position, content, userId, userName } = req.body;
      
      const change: DocumentChange = {
        id: `change_${Date.now()}`,
        userId,
        userName,
        type,
        position,
        content,
        timestamp: new Date(),
        approved: false
      };

      document.changes.push(change);
      document.lastEditedBy = userId;
      document.lastEditedAt = new Date();
      document.version += 1;

      // Broadcast change to all participants
      broadcastToWorkspace(workspace.id, {
        type: 'document_changed',
        documentId: document.id,
        change
      });

      res.json({
        success: true,
        change
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to track change'
      });
    }
  });

  // Add comment to document
  app.post('/api/collab/workspace/:workspaceId/document/:docId/comment', (req, res) => {
    try {
      const workspace = workspaces.get(req.params.workspaceId);
      
      if (!workspace) {
        return res.status(404).json({
          success: false,
          error: 'Workspace not found'
        });
      }

      const document = workspace.documents.find(d => d.id === req.params.docId);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found'
        });
      }

      const { content, position, userId, userName } = req.body;
      
      const comment: Comment = {
        id: `comment_${Date.now()}`,
        userId,
        userName,
        content,
        position,
        resolved: false,
        replies: [],
        timestamp: new Date()
      };

      document.comments.push(comment);

      // Broadcast comment to all participants
      broadcastToWorkspace(workspace.id, {
        type: 'comment_added',
        documentId: document.id,
        comment
      });

      res.json({
        success: true,
        comment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add comment'
      });
    }
  });

  // Approve/reject changes
  app.post('/api/collab/workspace/:workspaceId/document/:docId/change/:changeId/review', (req, res) => {
    try {
      const workspace = workspaces.get(req.params.workspaceId);
      
      if (!workspace) {
        return res.status(404).json({
          success: false,
          error: 'Workspace not found'
        });
      }

      const document = workspace.documents.find(d => d.id === req.params.docId);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found'
        });
      }

      const change = document.changes.find(c => c.id === req.params.changeId);
      
      if (!change) {
        return res.status(404).json({
          success: false,
          error: 'Change not found'
        });
      }

      const { approved, reviewerId, reviewerName } = req.body;
      
      change.approved = approved;
      change.reviewedBy = reviewerId;

      if (approved) {
        // Apply change to document content
        applyChangeToDocument(document, change);
      }

      // Broadcast review to all participants
      broadcastToWorkspace(workspace.id, {
        type: 'change_reviewed',
        documentId: document.id,
        changeId: change.id,
        approved,
        reviewerName
      });

      res.json({
        success: true,
        change
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to review change'
      });
    }
  });
}

function broadcastToWorkspace(workspaceId: string, message: any) {
  const connections = activeConnections.get(workspaceId);
  if (connections) {
    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }
}

function applyChangeToDocument(document: WorkspaceDocument, change: DocumentChange) {
  // Apply the approved change to the document content
  switch (change.type) {
    case 'insert':
      // Insert content at position
      break;
    case 'delete':
      // Delete content at position
      break;
    case 'replace':
      // Replace content at position
      break;
    case 'format':
      // Apply formatting change
      break;
  }
}

export function setupWebSocketServer(server: any) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws: WebSocket, req) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const workspaceId = url.searchParams.get('workspace');

    if (workspaceId) {
      // Add connection to workspace
      if (!activeConnections.has(workspaceId)) {
        activeConnections.set(workspaceId, []);
      }
      activeConnections.get(workspaceId)!.push(ws);

      // Handle real-time collaboration events
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          
          // Broadcast to other participants in the workspace
          broadcastToWorkspace(workspaceId, {
            ...message,
            from: 'participant'
          });
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        // Remove connection from workspace
        const connections = activeConnections.get(workspaceId);
        if (connections) {
          const index = connections.indexOf(ws);
          if (index > -1) {
            connections.splice(index, 1);
          }
        }
      });
    }
  });
}