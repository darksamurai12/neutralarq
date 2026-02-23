export type ProjectStatus = 'planning' | 'in_progress' | 'paused' | 'completed';

export interface Project {
  id: string;
  clientId: string;
  title: string;
  description: string;
  status: ProjectStatus;
  startDate: Date;
  deadline: Date;
  budget: number;
  imageUrl?: string; // Novo campo para imagem do projeto
  parentProjectId?: string;
  createdAt: Date;
}

// ... (restante do arquivo permanece igual)