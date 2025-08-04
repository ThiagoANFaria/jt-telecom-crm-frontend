// Serviço para integração com API do ReceitaWS
// Documentação: https://receitaws.com.br/

// Tipos para a resposta da API ReceitaWS
interface ReceitaWSData {
  status: string;
  ultima_atualizacao?: string;
  cnpj: string;
  tipo: 'MATRIZ' | 'FILIAL';
  porte: string;
  nome: string; // Razão Social
  fantasia: string; // Nome Fantasia
  abertura: string;
  atividade_principal: Array<{
    code: string;
    text: string;
  }>;
  atividades_secundarias: Array<{
    code: string;
    text: string;
  }>;
  natureza_juridica: string;
  logradouro: string;
  numero: string;
  complemento: string;
  cep: string;
  bairro: string;
  municipio: string;
  uf: string;
  email: string;
  telefone: string;
  efr: string;
  situacao: string;
  data_situacao: string;
  motivo_situacao: string;
  situacao_especial: string;
  data_situacao_especial: string;
  capital_social: string;
  qsa: Array<{
    nome: string;
    qual: string;
    pais_origem: string;
    nome_rep_legal: string;
    qual_rep_legal: string;
  }>;
  simples: {
    optante: boolean;
    data_opcao: string;
    data_exclusao: string;
    ultima_atualizacao: string;
  };
  simei: {
    optante: boolean;
    data_opcao: string;
    data_exclusao: string;
    ultima_atualizacao: string;
  };
  billing: {
    free: boolean;
    database: boolean;
  };
}

interface CNPJResponse {
  status: number;
  data?: ReceitaWSData;
  message?: string;
}

class CNPJService {
  private baseUrl = 'https://receitaws.com.br/v1/cnpj';

  /**
   * Remove formatação do CNPJ, mantendo apenas números
   */
  private formatCNPJ(cnpj: string): string {
    return cnpj.replace(/\D/g, '');
  }

  /**
   * Valida se o CNPJ tem 14 dígitos
   */
  private isValidCNPJ(cnpj: string): boolean {
    const cleanCNPJ = this.formatCNPJ(cnpj);
    return cleanCNPJ.length === 14;
  }

  /**
   * Consulta dados do CNPJ na API ReceitaWS
   */
  async consultarCNPJ(cnpj: string): Promise<CNPJResponse> {
    try {
      // Validar formato do CNPJ
      if (!this.isValidCNPJ(cnpj)) {
        return {
          status: 400,
          message: 'CNPJ deve conter 14 dígitos'
        };
      }

      const cleanCNPJ = this.formatCNPJ(cnpj);
      
      // Secure log without exposing CNPJ details

      const response = await fetch(`${this.baseUrl}/${cleanCNPJ}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors'
      });

      if (!response.ok) {
        if (response.status === 429) {
          return {
            status: 429,
            message: 'Limite de consultas excedido. Aguarde alguns minutos.'
          };
        }
        
        if (response.status === 504) {
          return {
            status: 504,
            message: 'Timeout na consulta. Tente novamente.'
          };
        }

        return {
          status: response.status,
          message: `Erro na consulta: ${response.statusText}`
        };
      }

      const data: ReceitaWSData = await response.json();

      // Verificar se a consulta foi bem-sucedida
      if (data.status !== 'OK') {
        return {
          status: 404,
          message: 'CNPJ não encontrado ou inválido'
        };
      }

      return {
        status: 200,
        data
      };

    } catch (error) {
      console.error('Erro ao consultar CNPJ:', error);
      
      // Em caso de erro CORS ou rede, tentar usar um proxy ou retornar erro
      return {
        status: 500,
        message: 'Erro de conectividade. Verifique sua conexão com a internet.'
      };
    }
  }

  /**
   * Formata dados da ReceitaWS para o formato do Lead
   */
  formatDataForLead(data: ReceitaWSData) {
    return {
      // Dados da empresa
      razaoSocial: data.nome || '',
      nomeFantasia: data.fantasia || '',
      cnpj: this.formatCNPJDisplay(data.cnpj),
      situacao: data.situacao || '',
      porte: data.porte || '',
      atividadePrincipal: data.atividade_principal?.[0]?.text || '',
      
      // Dados de endereço
      logradouro: data.logradouro || '',
      numero: data.numero || '',
      complemento: data.complemento || '',
      bairro: data.bairro || '',
      cidade: data.municipio || '',
      uf: data.uf || '',
      cep: this.formatCEP(data.cep) || '',
      
      // Dados de contato
      telefone: data.telefone || '',
      email: data.email || ''
    };
  }

  /**
   * Formata CNPJ para exibição (XX.XXX.XXX/XXXX-XX)
   */
  private formatCNPJDisplay(cnpj: string): string {
    const clean = this.formatCNPJ(cnpj);
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  /**
   * Formata CEP para exibição (XXXXX-XXX)
   */
  private formatCEP(cep: string): string {
    const clean = cep.replace(/\D/g, '');
    return clean.replace(/(\d{5})(\d{3})/, '$1-$2');
  }

  /**
   * Aplica máscara de CNPJ durante a digitação
   */
  applyCNPJMask(value: string): string {
    const clean = value.replace(/\D/g, '');
    
    if (clean.length <= 2) return clean;
    if (clean.length <= 5) return clean.replace(/(\d{2})(\d+)/, '$1.$2');
    if (clean.length <= 8) return clean.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
    if (clean.length <= 12) return clean.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d+)/, '$1.$2.$3/$4-$5');
  }

  /**
   * Aplica máscara de CEP durante a digitação
   */
  applyCEPMask(value: string): string {
    const clean = value.replace(/\D/g, '');
    if (clean.length <= 5) return clean;
    return clean.replace(/(\d{5})(\d+)/, '$1-$2');
  }

  /**
   * Aplica máscara de telefone durante a digitação
   */
  applyPhoneMask(value: string): string {
    const clean = value.replace(/\D/g, '');
    
    if (clean.length <= 2) return clean;
    if (clean.length <= 6) return clean.replace(/(\d{2})(\d+)/, '($1) $2');
    if (clean.length <= 10) return clean.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
    return clean.replace(/(\d{2})(\d{5})(\d+)/, '($1) $2-$3');
  }
}

export const cnpjService = new CNPJService();

