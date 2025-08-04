import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiService } from '@/services/api';
import { debounce } from '@/lib/debounce';
import { secureLog } from '@/utils/security';

interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
}

interface LeadSearchProps {
  value: string;
  onChange: (value: string) => void;
  onLeadSelect: (lead: Lead) => void;
  placeholder?: string;
  className?: string;
}

const LeadSearch: React.FC<LeadSearchProps> = ({
  value,
  onChange,
  onLeadSelect,
  placeholder = "Digite o nome do lead...",
  className
}) => {
  const [open, setOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState(value);

  // Função de busca com debounce
  const searchLeads = debounce(async (query: string) => {
    if (query.length < 3) {
      setLeads([]);
      return;
    }

    try {
      setLoading(true);
      secureLog('Searching leads with query');
      const results = await apiService.searchLeads(query);
      setLeads(results || []);
    } catch (error) {
      secureLog('Error searching leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, 300);

  // Executar busca quando o valor mudar
  useEffect(() => {
    searchLeads(searchValue);
  }, [searchValue]);

  // Sincronizar com o valor externo
  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  const handleInputChange = (newValue: string) => {
    setSearchValue(newValue);
    onChange(newValue);
  };

  const handleLeadSelect = (lead: Lead) => {
    setSearchValue(lead.name);
    onChange(lead.name);
    onLeadSelect(lead);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <span className="truncate">
            {searchValue || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Digite pelo menos 3 caracteres..."
            value={searchValue}
            onValueChange={handleInputChange}
          />
          <CommandList>
            {loading && (
              <div className="p-2 text-sm text-muted-foreground text-center">
                Buscando leads...
              </div>
            )}
            
            {!loading && searchValue.length < 3 && (
              <CommandEmpty>
                Digite pelo menos 3 caracteres para buscar
              </CommandEmpty>
            )}
            
            {!loading && searchValue.length >= 3 && leads.length === 0 && (
              <CommandEmpty>
                Nenhum lead encontrado
              </CommandEmpty>
            )}
            
            {!loading && leads.length > 0 && (
              <CommandGroup>
                {leads.map((lead) => (
                  <CommandItem
                    key={lead.id}
                    value={lead.name}
                    onSelect={() => handleLeadSelect(lead)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{lead.name}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {lead.company && `${lead.company} • `}
                          {lead.email || lead.phone}
                        </div>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === lead.name ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default LeadSearch;