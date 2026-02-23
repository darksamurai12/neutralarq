// ... (importações existentes)
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// No componente ProjectDialog, dentro do formulário:

<div className="space-y-2">
  <Label htmlFor="imageUrl">URL da Imagem do Projeto</Label>
  <Input 
    id="imageUrl" 
    value={formData.imageUrl || ''} 
    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} 
    placeholder="https://exemplo.com/imagem.jpg" 
    className="h-11 rounded-xl"
  />
  <p className="text-[10px] text-muted-foreground">Insira o link de uma imagem para ilustrar o projeto.</p>
</div>

// ... (restante do formulário)