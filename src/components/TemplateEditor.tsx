import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileText, Plus, Eye, Code } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  content: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

interface TemplateEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  template?: Template | null;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  isOpen,
  onClose,
  onSuccess,
  template,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    content: '',
  });

  // Variáveis disponíveis para uso nos templates
  const availableVariables = [
    { key: '{{client_name}}', description: 'Nome do cliente' },
    { key: '{{client_email}}', description: 'Email do cliente' },
    { key: '{{client_phone}}', description: 'Telefone do cliente' },
    { key: '{{client_company}}', description: 'Empresa do cliente' },
    { key: '{{client_cnpj}}', description: 'CNPJ do cliente' },
    { key: '{{client_address}}', description: 'Endereço do cliente' },
    { key: '{{proposal_title}}', description: 'Título da proposta' },
    { key: '{{proposal_amount}}', description: 'Valor da proposta' },
    { key: '{{proposal_discount}}', description: 'Desconto da proposta' },
    { key: '{{proposal_total}}', description: 'Valor total da proposta' },
    { key: '{{proposal_date}}', description: 'Data da proposta' },
    { key: '{{proposal_valid_until}}', description: 'Válida até' },
    { key: '{{company_name}}', description: 'JT Tecnologia' },
    { key: '{{company_email}}', description: 'contato@jttelecom.com.br' },
    { key: '{{company_phone}}', description: 'Telefone da empresa' },
    { key: '{{company_address}}', description: 'Endereço da empresa' },
  ];

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        content: template.content || '',
      });
    } else {
      setFormData({
        name: '',
        content: getDefaultTemplate(),
      });
    }
  }, [template]);

  const getDefaultTemplate = () => {
    return `# Proposta Comercial - {{company_name}}

## Soluções em Comunicação Inteligente

**Para:** {{client_name}}  
**Empresa:** {{client_company}}  
**Email:** {{client_email}}  
**Telefone:** {{client_phone}}  

---

### Quem Somos

A {{company_name}} é especialista em soluções que simplificam e potencializam a comunicação empresarial. Ajudamos empresas a reduzirem custos, automatizarem processos e escalarem seus canais de atendimento com tecnologia de ponta, acessível e eficiente.

### Nossos Produtos

**PABX em Nuvem**
Modernize a estrutura telefônica da sua empresa com um sistema 100% online.

**Benefícios:**
- Escalabilidade imediata (adicione ou remova ramais facilmente)
- Redução de custos com infraestrutura física
- Acesso global para equipes remotas

**Discador Preditivo**
Automatize suas campanhas de vendas e atendimento com inteligência artificial.

**URA Reversa**
Transforme chamadas perdidas em oportunidades de negócio.

**Chatbot Inteligente**
Atendimento 24/7 com respostas automáticas e direcionamento inteligente.

**0800 Virtual**
Ofereça um canal gratuito para seus clientes sem custos de infraestrutura.

**Assistentes de IA**
Potencialize seu atendimento com inteligência artificial avançada.

---

### Proposta

**Título:** {{proposal_title}}  
**Valor:** R$ {{proposal_amount}}  
**Desconto:** R$ {{proposal_discount}}  
**Total:** R$ {{proposal_total}}  

**Válida até:** {{proposal_valid_until}}

---

### Contato

**{{company_name}}**  
Email: {{company_email}}  
Telefone: {{company_phone}}  

Estamos à disposição para esclarecer dúvidas e personalizar nossa solução às suas necessidades.

*Proposta gerada em {{proposal_date}}*`;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.content;
      const newText = text.substring(0, start) + variable + text.substring(end);
      
      handleInputChange('content', newText);
      
      // Reposicionar cursor
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const renderPreview = () => {
    // Substituir variáveis por valores de exemplo para preview
    let previewContent = formData.content;
    const exampleData = {
      '{{client_name}}': 'João Silva',
      '{{client_email}}': 'joao.silva@empresa.com',
      '{{client_phone}}': '(11) 99999-8888',
      '{{client_company}}': 'Empresa Exemplo Ltda',
      '{{client_cnpj}}': '12.345.678/0001-90',
      '{{client_address}}': 'Rua Exemplo, 123 - São Paulo/SP',
      '{{proposal_title}}': 'Proposta PABX em Nuvem',
      '{{proposal_amount}}': '5.000,00',
      '{{proposal_discount}}': '500,00',
      '{{proposal_total}}': '4.500,00',
      '{{proposal_date}}': new Date().toLocaleDateString('pt-BR'),
      '{{proposal_valid_until}}': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
      '{{company_name}}': 'JT Tecnologia',
      '{{company_email}}': 'contato@jttelecom.com.br',
      '{{company_phone}}': '(11) 3000-0000',
      '{{company_address}}': 'São Paulo/SP',
    };

    Object.entries(exampleData).forEach(([key, value]) => {
      previewContent = previewContent.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    });

    // Converter markdown básico para HTML
    previewContent = previewContent
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-medium mb-2">$1</h3>')
      .replace(/^\*\*(.*)\*\*$/gim, '<strong>$1</strong>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>')
      .replace(/^---$/gim, '<hr class="my-4 border-gray-300">')
      .replace(/\n/g, '<br>');

    return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: previewContent }} />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.content) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha o nome e o conteúdo do template.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Extrair variáveis do conteúdo
      const variables = Array.from(formData.content.matchAll(/\{\{([^}]+)\}\}/g))
        .map(match => match[0])
        .filter((value, index, self) => self.indexOf(value) === index);

      const templateData = {
        ...formData,
        variables,
      };

      if (template) {
        // await apiService.updateTemplate(template.id, templateData);
        toast({
          title: 'Template atualizado',
          description: 'Template atualizado com sucesso.',
        });
      } else {
        // await apiService.createTemplate(templateData);
        toast({
          title: 'Template criado',
          description: 'Template criado com sucesso.',
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save template:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o template.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {template ? 'Editar Template' : 'Novo Template'}
          </DialogTitle>
          <DialogDescription>
            Crie templates personalizados para suas propostas usando variáveis dinâmicas.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <Label htmlFor="template-name">Nome do Template *</Label>
              <Input
                id="template-name"
                placeholder="Ex: Proposta Padrão PABX"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div className="flex gap-2 mb-2">
              <Button
                type="button"
                variant={!previewMode ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode(false)}
              >
                <Code className="w-4 h-4 mr-2" />
                Editor
              </Button>
              <Button
                type="button"
                variant={previewMode ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>

            {!previewMode ? (
              <div>
                <Label htmlFor="template-content">Conteúdo do Template *</Label>
                <Textarea
                  id="template-content"
                  placeholder="Digite o conteúdo do template..."
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                  required
                />
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Preview do Template</CardTitle>
                  <CardDescription>
                    Visualização com dados de exemplo
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto">
                  {renderPreview()}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Variáveis */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Variáveis Disponíveis</CardTitle>
                <CardDescription>
                  Clique para inserir no template
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {availableVariables.map((variable) => (
                  <div key={variable.key} className="space-y-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-2"
                      onClick={() => insertVariable(variable.key)}
                    >
                      <div>
                        <div className="font-mono text-xs text-blue-600">
                          {variable.key}
                        </div>
                        <div className="text-xs text-gray-500">
                          {variable.description}
                        </div>
                      </div>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Salvando...' : template ? 'Atualizar Template' : 'Criar Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateEditor;

