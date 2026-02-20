import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApp } from '@/contexts/AppContext';
import { FolderKanban, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Project, ProjectStatus, ProjectType } from '@/types';
import { ProjectFilters } from '@/components/projects/ProjectFilters';
import { ProjectStats } from '@/components/projects/ProjectStats';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectFormDialog } from '@/components/projects/ProjectFormDialog';
import { ProjectDetailsDialog } from '@/components/projects/ProjectDetailsDialog';

export default function Projects() {
  const { 
    projects, 
    clients, 
    addProject, 
    updateProject, 
    deleteProject, 
    getProjectWithDetails, 
    addTask, 
    updateTask, 
    deleteTask, 
    getSubprojects 
  } = useApp();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ProjectType | 'all'>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');

  const selectedProject = selectedProjectId ? getProjectWithDetails(selectedProjectId) : null;

  // Only show root-level projects (not subprojects) in the main list
  const rootProjects = projects.filter(p => !p.parentProjectId);

  // Stats (only root projects)
  const planningProjects = rootProjects.filter(p => p.status === 'planning').length;
  const activeProjects = rootProjects.filter(p => p.status === 'in_progress').length;
  const pausedProjects = rootProjects.filter(p => p.status === 'paused').length;
  const completedProjects = rootProjects.filter(p => p.status === 'completed').length;

  const handleFormSubmit = (data: any) => {
    if (editingProject) {
      updateProject(editingProject.id, data);
    } else {
      addProject({ ...data, parentProjectId: null });
    }
    setIsFormOpen(false);
    setEditingProject(null);
  };

  const handleEdit = (project: Project, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingProject(project);
    setSelectedProjectId(null);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    deleteProject(id);
    setSelectedProjectId(null);
  };

  const filteredProjects = rootProjects.filter((project) => {
    const client = clients.find((c) => c.id === project.clientId);
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesType = typeFilter === 'all' || project.type === typeFilter;
    const matchesClient = clientFilter === 'all' || project.clientId === clientFilter;
    return matchesSearch && matchesStatus && matchesType && matchesClient;
  });

  return (
    <AppLayout>
      <PageHeader
        title="Projectos"
        description="Gestão de obras, projectos arquitectónicos e design de interiores"
        icon={FolderKanban}
      >
        <Button 
          className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
          onClick={() => { setEditingProject(null); setIsFormOpen(true); }}
        >
          <Plus className="w-4 h-4" />
          Novo Projecto
        </Button>
      </PageHeader>

      <ProjectStats 
        planningCount={planningProjects}
        activeCount={activeProjects}
        pausedCount={pausedProjects}
        completedCount={completedProjects}
      />

      <Card className="shadow-card border-border/50 rounded-2xl mb-6">
        <CardContent className="p-4">
          <ProjectFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            typeFilter={typeFilter}
            onTypeChange={setTypeFilter}
            clientFilter={clientFilter}
            onClientChange={setClientFilter}
            clients={clients.filter(c => c.status !== 'inactive')}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => {
          const client = clients.find((c) => c.id === project.clientId);
          const projectDetails = getProjectWithDetails(project.id);
          
          return (
            <ProjectCard 
              key={project.id}
              project={project}
              clientName={client?.name || 'Cliente não encontrado'}
              progress={projectDetails?.kpis.progressPercentage || 0}
              taskCount={projectDetails?.tasks.length || 0}
              subprojectCount={getSubprojects(project.id).length}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onClick={setSelectedProjectId}
            />
          );
        })}
        {filteredProjects.length === 0 && (
          <div className="col-span-full">
            <Card className="shadow-lg border-0">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <FolderKanban className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">Nenhum projecto encontrado</p>
                <p className="text-sm text-muted-foreground mt-1">Ajuste os filtros ou adicione um novo projecto</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <ProjectFormDialog 
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editingProject={editingProject}
        clients={clients}
        onSubmit={handleFormSubmit}
      />

      <ProjectDetailsDialog 
        project={selectedProject}
        open={!!selectedProject}
        onOpenChange={(open) => !open && setSelectedProjectId(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSelectSubproject={setSelectedProjectId}
        subprojects={selectedProject ? getSubprojects(selectedProject.id) : []}
        addTask={addTask}
        updateTask={updateTask}
        deleteTask={deleteTask}
      />
    </AppLayout>
  );
}