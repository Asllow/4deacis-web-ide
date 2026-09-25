import type { Node, Edge } from "@xyflow/react";

export interface IProjectPayload {
    id: string;
    userId: string;
    name: string;
    flowData: {
        nodes: Node[];
        edges: Edge[];
    };
    updatedAt: string;
}

export interface IProjectRepository {
    saveProject(payload: IProjectPayload): Promise<void>;
    loadProjectsByUser(userId: string): Promise<IProjectPayload[]>;
}

export class LocalStorageProjectRepository implements IProjectRepository {
    private readonly STORAGE_KEY = "@4deacis/projects";

    public async saveProject(payload: IProjectPayload): Promise<void> {
        const currentProjects = await this.getAllProjects();
        const existingIndex = currentProjects.findIndex(p => p.id === payload.id);

        if (existingIndex >= 0) {
            currentProjects[existingIndex] = payload;
        } else {
            currentProjects.push(payload);
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentProjects));
    }

    public async loadProjectsByUser(userId: string): Promise<IProjectPayload[]> {
        const allProjects = await this.getAllProjects();
        return allProjects.filter(project => project.userId === userId);
    }

    private async getAllProjects(): Promise<IProjectPayload[]> {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (!data) return [];
        return JSON.parse(data) as IProjectPayload[];
    }
}

export const projectRepository = new LocalStorageProjectRepository();