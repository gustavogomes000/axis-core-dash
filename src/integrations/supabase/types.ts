export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categorias_produto: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          empresa_id: string
          icone: string | null
          id: string
          nome: string
          ordem: number
          slug: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          empresa_id: string
          icone?: string | null
          id?: string
          nome: string
          ordem?: number
          slug?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          empresa_id?: string
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number
          slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categorias_produto_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes_emporio: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          email: string | null
          empresa_id: string
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          numero: string | null
          observacoes: string | null
          rg: string | null
          status: Database["public"]["Enums"]["status_cliente"]
          telefone: string
          telefone2: string | null
          total_compras: number
          ultima_compra: string | null
          updated_at: string
          valor_total_compras: number
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          empresa_id: string
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          numero?: string | null
          observacoes?: string | null
          rg?: string | null
          status?: Database["public"]["Enums"]["status_cliente"]
          telefone: string
          telefone2?: string | null
          total_compras?: number
          ultima_compra?: string | null
          updated_at?: string
          valor_total_compras?: number
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          empresa_id?: string
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          numero?: string | null
          observacoes?: string | null
          rg?: string | null
          status?: Database["public"]["Enums"]["status_cliente"]
          telefone?: string
          telefone2?: string | null
          total_compras?: number
          ultima_compra?: string | null
          updated_at?: string
          valor_total_compras?: number
        }
        Relationships: [
          {
            foreignKeyName: "clientes_emporio_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes_factoring: {
        Row: {
          agencia: string | null
          bairro: string | null
          banco: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          conta: string | null
          cpf: string | null
          created_at: string
          credito_disponivel: number | null
          credito_utilizado: number
          data_nascimento: string | null
          documentos: Json
          email: string | null
          empresa_id: string
          endereco: string | null
          estado: string | null
          estado_civil: string | null
          id: string
          limite_credito: number
          nome: string
          numero: string | null
          observacoes: string | null
          orgao_emissor: string | null
          pix: string | null
          profissao: string | null
          renda_mensal: number | null
          rg: string | null
          score_interno: number
          status: Database["public"]["Enums"]["status_cliente"]
          telefone: string
          telefone2: string | null
          tipo_conta: string | null
          total_emprestimos: number
          ultima_operacao: string | null
          updated_at: string
          valor_total_emprestado: number
        }
        Insert: {
          agencia?: string | null
          bairro?: string | null
          banco?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          conta?: string | null
          cpf?: string | null
          created_at?: string
          credito_disponivel?: number | null
          credito_utilizado?: number
          data_nascimento?: string | null
          documentos?: Json
          email?: string | null
          empresa_id: string
          endereco?: string | null
          estado?: string | null
          estado_civil?: string | null
          id?: string
          limite_credito?: number
          nome: string
          numero?: string | null
          observacoes?: string | null
          orgao_emissor?: string | null
          pix?: string | null
          profissao?: string | null
          renda_mensal?: number | null
          rg?: string | null
          score_interno?: number
          status?: Database["public"]["Enums"]["status_cliente"]
          telefone: string
          telefone2?: string | null
          tipo_conta?: string | null
          total_emprestimos?: number
          ultima_operacao?: string | null
          updated_at?: string
          valor_total_emprestado?: number
        }
        Update: {
          agencia?: string | null
          bairro?: string | null
          banco?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          conta?: string | null
          cpf?: string | null
          created_at?: string
          credito_disponivel?: number | null
          credito_utilizado?: number
          data_nascimento?: string | null
          documentos?: Json
          email?: string | null
          empresa_id?: string
          endereco?: string | null
          estado?: string | null
          estado_civil?: string | null
          id?: string
          limite_credito?: number
          nome?: string
          numero?: string | null
          observacoes?: string | null
          orgao_emissor?: string | null
          pix?: string | null
          profissao?: string | null
          renda_mensal?: number | null
          rg?: string | null
          score_interno?: number
          status?: Database["public"]["Enums"]["status_cliente"]
          telefone?: string
          telefone2?: string | null
          tipo_conta?: string | null
          total_emprestimos?: number
          ultima_operacao?: string | null
          updated_at?: string
          valor_total_emprestado?: number
        }
        Relationships: [
          {
            foreignKeyName: "clientes_factoring_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      config_catalogo: {
        Row: {
          ativo: boolean
          banner_url: string | null
          cores: Json
          created_at: string
          descricao: string | null
          empresa_id: string
          facebook: string | null
          id: string
          instagram: string | null
          mostrar_estoque: boolean
          mostrar_preco: boolean
          slug: string
          titulo: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          ativo?: boolean
          banner_url?: string | null
          cores?: Json
          created_at?: string
          descricao?: string | null
          empresa_id: string
          facebook?: string | null
          id?: string
          instagram?: string | null
          mostrar_estoque?: boolean
          mostrar_preco?: boolean
          slug: string
          titulo?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          ativo?: boolean
          banner_url?: string | null
          cores?: Json
          created_at?: string
          descricao?: string | null
          empresa_id?: string
          facebook?: string | null
          id?: string
          instagram?: string | null
          mostrar_estoque?: boolean
          mostrar_preco?: boolean
          slug?: string
          titulo?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "config_catalogo_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: true
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      config_emporio: {
        Row: {
          comissao_padrao_pct: number
          desconto_max_sem_aprovacao: number
          dias_vencimento_padrao: number
          empresa_id: string
          id: string
          msg_aniversario: string | null
          msg_aprovacao: string | null
          msg_cobranca: string | null
          msg_entrega: string | null
          msg_orcamento: string | null
          prefixo_numero_venda: string
          updated_at: string
          whatsapp_padrao: string | null
        }
        Insert: {
          comissao_padrao_pct?: number
          desconto_max_sem_aprovacao?: number
          dias_vencimento_padrao?: number
          empresa_id: string
          id?: string
          msg_aniversario?: string | null
          msg_aprovacao?: string | null
          msg_cobranca?: string | null
          msg_entrega?: string | null
          msg_orcamento?: string | null
          prefixo_numero_venda?: string
          updated_at?: string
          whatsapp_padrao?: string | null
        }
        Update: {
          comissao_padrao_pct?: number
          desconto_max_sem_aprovacao?: number
          dias_vencimento_padrao?: number
          empresa_id?: string
          id?: string
          msg_aniversario?: string | null
          msg_aprovacao?: string | null
          msg_cobranca?: string | null
          msg_entrega?: string | null
          msg_orcamento?: string | null
          prefixo_numero_venda?: string
          updated_at?: string
          whatsapp_padrao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "config_emporio_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: true
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      config_factoring: {
        Row: {
          dias_carencia: number
          empresa_id: string
          id: string
          juros_mora_diario: number
          msg_aprovacao: string | null
          msg_boas_vindas: string | null
          msg_cobranca: string | null
          msg_liberacao: string | null
          msg_quitacao: string | null
          msg_vencimento: string | null
          multa_atraso: number
          prazo_maximo_meses: number
          prazo_minimo_meses: number
          prefixo_contrato: string
          taxa_juros_padrao: number
          tipo_taxa_padrao: Database["public"]["Enums"]["tipo_taxa"]
          updated_at: string
          valor_maximo_emprestimo: number
          valor_minimo_emprestimo: number
          whatsapp_padrao: string | null
        }
        Insert: {
          dias_carencia?: number
          empresa_id: string
          id?: string
          juros_mora_diario?: number
          msg_aprovacao?: string | null
          msg_boas_vindas?: string | null
          msg_cobranca?: string | null
          msg_liberacao?: string | null
          msg_quitacao?: string | null
          msg_vencimento?: string | null
          multa_atraso?: number
          prazo_maximo_meses?: number
          prazo_minimo_meses?: number
          prefixo_contrato?: string
          taxa_juros_padrao?: number
          tipo_taxa_padrao?: Database["public"]["Enums"]["tipo_taxa"]
          updated_at?: string
          valor_maximo_emprestimo?: number
          valor_minimo_emprestimo?: number
          whatsapp_padrao?: string | null
        }
        Update: {
          dias_carencia?: number
          empresa_id?: string
          id?: string
          juros_mora_diario?: number
          msg_aprovacao?: string | null
          msg_boas_vindas?: string | null
          msg_cobranca?: string | null
          msg_liberacao?: string | null
          msg_quitacao?: string | null
          msg_vencimento?: string | null
          multa_atraso?: number
          prazo_maximo_meses?: number
          prazo_minimo_meses?: number
          prefixo_contrato?: string
          taxa_juros_padrao?: number
          tipo_taxa_padrao?: Database["public"]["Enums"]["tipo_taxa"]
          updated_at?: string
          valor_maximo_emprestimo?: number
          valor_minimo_emprestimo?: number
          whatsapp_padrao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "config_factoring_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: true
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_pagar: {
        Row: {
          categoria: Database["public"]["Enums"]["categoria_conta"]
          comprovante_url: string | null
          created_at: string
          data_pagamento: string | null
          data_vencimento: string
          descricao: string
          empresa_id: string
          fornecedor_id: string | null
          fornecedor_nome: string | null
          id: string
          numero_documento: string | null
          observacoes: string | null
          status: Database["public"]["Enums"]["status_conta_pagar"]
          tipo_pagamento: Database["public"]["Enums"]["tipo_pagamento"] | null
          updated_at: string
          valor: number
          valor_pago: number | null
        }
        Insert: {
          categoria?: Database["public"]["Enums"]["categoria_conta"]
          comprovante_url?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento: string
          descricao: string
          empresa_id: string
          fornecedor_id?: string | null
          fornecedor_nome?: string | null
          id?: string
          numero_documento?: string | null
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_conta_pagar"]
          tipo_pagamento?: Database["public"]["Enums"]["tipo_pagamento"] | null
          updated_at?: string
          valor: number
          valor_pago?: number | null
        }
        Update: {
          categoria?: Database["public"]["Enums"]["categoria_conta"]
          comprovante_url?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string
          empresa_id?: string
          fornecedor_id?: string | null
          fornecedor_nome?: string | null
          id?: string
          numero_documento?: string | null
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_conta_pagar"]
          tipo_pagamento?: Database["public"]["Enums"]["tipo_pagamento"] | null
          updated_at?: string
          valor?: number
          valor_pago?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contas_pagar_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          ativo: boolean
          cep: string | null
          cidade: string | null
          cnpj: string | null
          created_at: string
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          logo_url: string | null
          nome: string
          telefone: string | null
          tipo: Database["public"]["Enums"]["tipo_empresa"]
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          logo_url?: string | null
          nome: string
          telefone?: string | null
          tipo: Database["public"]["Enums"]["tipo_empresa"]
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          logo_url?: string | null
          nome?: string
          telefone?: string | null
          tipo?: Database["public"]["Enums"]["tipo_empresa"]
          updated_at?: string
        }
        Relationships: []
      }
      emprestimos: {
        Row: {
          cliente_id: string
          created_at: string
          data_liberacao: string | null
          data_primeiro_vencimento: string
          data_quitacao: string | null
          documentos: Json
          empresa_id: string
          garantias: string | null
          id: string
          numero_contrato: string
          observacoes: string | null
          prazo_meses: number
          saldo_devedor: number
          status: Database["public"]["Enums"]["status_emprestimo"]
          taxa_juros: number
          tipo_taxa: Database["public"]["Enums"]["tipo_taxa"]
          total_juros: number
          total_pagar: number
          updated_at: string
          usuario_id: string | null
          valor_entrada: number
          valor_parcela: number
          valor_principal: number
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_liberacao?: string | null
          data_primeiro_vencimento: string
          data_quitacao?: string | null
          documentos?: Json
          empresa_id: string
          garantias?: string | null
          id?: string
          numero_contrato: string
          observacoes?: string | null
          prazo_meses: number
          saldo_devedor: number
          status?: Database["public"]["Enums"]["status_emprestimo"]
          taxa_juros: number
          tipo_taxa?: Database["public"]["Enums"]["tipo_taxa"]
          total_juros: number
          total_pagar: number
          updated_at?: string
          usuario_id?: string | null
          valor_entrada?: number
          valor_parcela: number
          valor_principal: number
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_liberacao?: string | null
          data_primeiro_vencimento?: string
          data_quitacao?: string | null
          documentos?: Json
          empresa_id?: string
          garantias?: string | null
          id?: string
          numero_contrato?: string
          observacoes?: string | null
          prazo_meses?: number
          saldo_devedor?: number
          status?: Database["public"]["Enums"]["status_emprestimo"]
          taxa_juros?: number
          tipo_taxa?: Database["public"]["Enums"]["tipo_taxa"]
          total_juros?: number
          total_pagar?: number
          updated_at?: string
          usuario_id?: string | null
          valor_entrada?: number
          valor_parcela?: number
          valor_principal?: number
        }
        Relationships: [
          {
            foreignKeyName: "emprestimos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes_factoring"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emprestimos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emprestimos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedores: {
        Row: {
          ativo: boolean
          cidade: string | null
          cnpj: string | null
          contato: string | null
          cpf: string | null
          created_at: string
          email: string | null
          empresa_id: string
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cidade?: string | null
          cnpj?: string | null
          contato?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          empresa_id: string
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cidade?: string | null
          cnpj?: string | null
          contato?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          empresa_id?: string
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fornecedores_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_status_emprestimo: {
        Row: {
          created_at: string
          emprestimo_id: string
          id: string
          motivo: string | null
          status_anterior:
            | Database["public"]["Enums"]["status_emprestimo"]
            | null
          status_novo: Database["public"]["Enums"]["status_emprestimo"]
          usuario_id: string | null
        }
        Insert: {
          created_at?: string
          emprestimo_id: string
          id?: string
          motivo?: string | null
          status_anterior?:
            | Database["public"]["Enums"]["status_emprestimo"]
            | null
          status_novo: Database["public"]["Enums"]["status_emprestimo"]
          usuario_id?: string | null
        }
        Update: {
          created_at?: string
          emprestimo_id?: string
          id?: string
          motivo?: string | null
          status_anterior?:
            | Database["public"]["Enums"]["status_emprestimo"]
            | null
          status_novo?: Database["public"]["Enums"]["status_emprestimo"]
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_status_emprestimo_emprestimo_id_fkey"
            columns: ["emprestimo_id"]
            isOneToOne: false
            referencedRelation: "emprestimos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_status_emprestimo_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_venda: {
        Row: {
          created_at: string
          desconto: number
          id: string
          nome_produto: string
          preco_unitario: number
          produto_id: string | null
          quantidade: number
          sku_produto: string | null
          total: number
          venda_id: string
        }
        Insert: {
          created_at?: string
          desconto?: number
          id?: string
          nome_produto: string
          preco_unitario: number
          produto_id?: string | null
          quantidade?: number
          sku_produto?: string | null
          total: number
          venda_id: string
        }
        Update: {
          created_at?: string
          desconto?: number
          id?: string
          nome_produto?: string
          preco_unitario?: number
          produto_id?: string | null
          quantidade?: number
          sku_produto?: string | null
          total?: number
          venda_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "itens_venda_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_venda_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      metas_vendedor: {
        Row: {
          comissao_pct: number
          created_at: string
          empresa_id: string
          id: string
          mes: string
          meta_valor: number
          updated_at: string
          vendedor_id: string
        }
        Insert: {
          comissao_pct?: number
          created_at?: string
          empresa_id: string
          id?: string
          mes: string
          meta_valor?: number
          updated_at?: string
          vendedor_id: string
        }
        Update: {
          comissao_pct?: number
          created_at?: string
          empresa_id?: string
          id?: string
          mes?: string
          meta_valor?: number
          updated_at?: string
          vendedor_id?: string
        }
        Relationships: []
      }
      movimentacoes_caixa: {
        Row: {
          categoria: string
          created_at: string
          data_movimentacao: string
          descricao: string
          empresa_id: string
          id: string
          observacoes: string | null
          referencia_id: string | null
          referencia_tipo: string | null
          tipo: Database["public"]["Enums"]["tipo_movimentacao"]
          usuario_id: string | null
          valor: number
        }
        Insert: {
          categoria: string
          created_at?: string
          data_movimentacao?: string
          descricao: string
          empresa_id: string
          id?: string
          observacoes?: string | null
          referencia_id?: string | null
          referencia_tipo?: string | null
          tipo: Database["public"]["Enums"]["tipo_movimentacao"]
          usuario_id?: string | null
          valor: number
        }
        Update: {
          categoria?: string
          created_at?: string
          data_movimentacao?: string
          descricao?: string
          empresa_id?: string
          id?: string
          observacoes?: string | null
          referencia_id?: string | null
          referencia_tipo?: string | null
          tipo?: Database["public"]["Enums"]["tipo_movimentacao"]
          usuario_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_caixa_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_caixa_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes_log: {
        Row: {
          assunto: string | null
          canal: Database["public"]["Enums"]["canal_notificacao"]
          created_at: string
          destinatario: string
          empresa_id: string
          enviado_em: string | null
          erro: string | null
          id: string
          mensagem: string
          referencia_id: string | null
          referencia_tipo: string | null
          status: string
        }
        Insert: {
          assunto?: string | null
          canal?: Database["public"]["Enums"]["canal_notificacao"]
          created_at?: string
          destinatario: string
          empresa_id: string
          enviado_em?: string | null
          erro?: string | null
          id?: string
          mensagem: string
          referencia_id?: string | null
          referencia_tipo?: string | null
          status?: string
        }
        Update: {
          assunto?: string | null
          canal?: Database["public"]["Enums"]["canal_notificacao"]
          created_at?: string
          destinatario?: string
          empresa_id?: string
          enviado_em?: string | null
          erro?: string | null
          id?: string
          mensagem?: string
          referencia_id?: string | null
          referencia_tipo?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_log_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      parcelas_emprestimo: {
        Row: {
          cliente_id: string
          created_at: string
          data_pagamento: string | null
          data_vencimento: string
          dias_atraso: number | null
          empresa_id: string
          emprestimo_id: string
          id: string
          juros_mora: number
          multa: number
          numero_parcela: number
          observacoes: string | null
          saldo_devedor_antes: number
          saldo_devedor_apos: number
          status: Database["public"]["Enums"]["status_parcela_emp"]
          tipo_pagamento: Database["public"]["Enums"]["tipo_pagamento"] | null
          total_parcelas: number
          updated_at: string
          valor: number
          valor_juros: number
          valor_pago: number | null
          valor_principal: number
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_pagamento?: string | null
          data_vencimento: string
          dias_atraso?: number | null
          empresa_id: string
          emprestimo_id: string
          id?: string
          juros_mora?: number
          multa?: number
          numero_parcela: number
          observacoes?: string | null
          saldo_devedor_antes: number
          saldo_devedor_apos: number
          status?: Database["public"]["Enums"]["status_parcela_emp"]
          tipo_pagamento?: Database["public"]["Enums"]["tipo_pagamento"] | null
          total_parcelas: number
          updated_at?: string
          valor: number
          valor_juros: number
          valor_pago?: number | null
          valor_principal: number
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string
          dias_atraso?: number | null
          empresa_id?: string
          emprestimo_id?: string
          id?: string
          juros_mora?: number
          multa?: number
          numero_parcela?: number
          observacoes?: string | null
          saldo_devedor_antes?: number
          saldo_devedor_apos?: number
          status?: Database["public"]["Enums"]["status_parcela_emp"]
          tipo_pagamento?: Database["public"]["Enums"]["tipo_pagamento"] | null
          total_parcelas?: number
          updated_at?: string
          valor?: number
          valor_juros?: number
          valor_pago?: number | null
          valor_principal?: number
        }
        Relationships: [
          {
            foreignKeyName: "parcelas_emprestimo_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes_factoring"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parcelas_emprestimo_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parcelas_emprestimo_emprestimo_id_fkey"
            columns: ["emprestimo_id"]
            isOneToOne: false
            referencedRelation: "emprestimos"
            referencedColumns: ["id"]
          },
        ]
      }
      parcelas_receber: {
        Row: {
          cliente_id: string | null
          created_at: string
          data_pagamento: string | null
          data_vencimento: string
          empresa_id: string
          id: string
          numero_parcela: number
          observacoes: string | null
          status: Database["public"]["Enums"]["status_parcela"]
          tipo_pagamento: Database["public"]["Enums"]["tipo_pagamento"] | null
          total_parcelas: number
          updated_at: string
          valor: number
          valor_pago: number | null
          venda_id: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento: string
          empresa_id: string
          id?: string
          numero_parcela: number
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_parcela"]
          tipo_pagamento?: Database["public"]["Enums"]["tipo_pagamento"] | null
          total_parcelas: number
          updated_at?: string
          valor: number
          valor_pago?: number | null
          venda_id: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string
          empresa_id?: string
          id?: string
          numero_parcela?: number
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_parcela"]
          tipo_pagamento?: Database["public"]["Enums"]["tipo_pagamento"] | null
          total_parcelas?: number
          updated_at?: string
          valor?: number
          valor_pago?: number | null
          venda_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parcelas_receber_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes_emporio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parcelas_receber_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parcelas_receber_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          categoria_id: string | null
          created_at: string
          descricao: string | null
          descricao_curta: string | null
          destaque: boolean
          dimensoes: Json | null
          disponivel_catalogo: boolean
          empresa_id: string
          estoque: number
          estoque_minimo: number
          fornecedor_id: string | null
          id: string
          imagens: Json
          nome: string
          peso: number | null
          preco: number
          preco_custo: number | null
          sku: string | null
          status: Database["public"]["Enums"]["status_produto"]
          tags: string[] | null
          unidade: string
          updated_at: string
        }
        Insert: {
          categoria_id?: string | null
          created_at?: string
          descricao?: string | null
          descricao_curta?: string | null
          destaque?: boolean
          dimensoes?: Json | null
          disponivel_catalogo?: boolean
          empresa_id: string
          estoque?: number
          estoque_minimo?: number
          fornecedor_id?: string | null
          id?: string
          imagens?: Json
          nome: string
          peso?: number | null
          preco?: number
          preco_custo?: number | null
          sku?: string | null
          status?: Database["public"]["Enums"]["status_produto"]
          tags?: string[] | null
          unidade?: string
          updated_at?: string
        }
        Update: {
          categoria_id?: string | null
          created_at?: string
          descricao?: string | null
          descricao_curta?: string | null
          destaque?: boolean
          dimensoes?: Json | null
          disponivel_catalogo?: boolean
          empresa_id?: string
          estoque?: number
          estoque_minimo?: number
          fornecedor_id?: string | null
          id?: string
          imagens?: Json
          nome?: string
          peso?: number | null
          preco?: number
          preco_custo?: number | null
          sku?: string | null
          status?: Database["public"]["Enums"]["status_produto"]
          tags?: string[] | null
          unidade?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_produto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      referencias_cliente_factoring: {
        Row: {
          cliente_id: string
          created_at: string
          id: string
          nome: string
          observacoes: string | null
          parentesco: string | null
          telefone: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          id?: string
          nome: string
          observacoes?: string | null
          parentesco?: string | null
          telefone: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          id?: string
          nome?: string
          observacoes?: string | null
          parentesco?: string | null
          telefone?: string
        }
        Relationships: [
          {
            foreignKeyName: "referencias_cliente_factoring_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes_factoring"
            referencedColumns: ["id"]
          },
        ]
      }
      usuario_empresa: {
        Row: {
          ativo: boolean
          created_at: string
          empresa_id: string
          id: string
          papel: Database["public"]["Enums"]["papel_usuario"]
          usuario_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          empresa_id: string
          id?: string
          papel?: Database["public"]["Enums"]["papel_usuario"]
          usuario_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          empresa_id?: string
          id?: string
          papel?: Database["public"]["Enums"]["papel_usuario"]
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuario_empresa_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuario_empresa_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          nome: string
          status: Database["public"]["Enums"]["status_usuario"]
          telefone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          nome: string
          status?: Database["public"]["Enums"]["status_usuario"]
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string
          status?: Database["public"]["Enums"]["status_usuario"]
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      vendas: {
        Row: {
          cliente_id: string | null
          comissao_pct: number
          comissao_valor: number
          created_at: string
          data_entrega: string | null
          desconto: number
          empresa_id: string
          id: string
          numero_venda: number
          observacoes: string | null
          parcelas: number
          status: Database["public"]["Enums"]["status_venda"]
          status_entrega: Database["public"]["Enums"]["status_entrega"]
          subtotal: number
          tipo_pagamento: Database["public"]["Enums"]["tipo_pagamento"] | null
          total: number
          updated_at: string
          usuario_id: string | null
          valor_entrada: number
          vendedor_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          comissao_pct?: number
          comissao_valor?: number
          created_at?: string
          data_entrega?: string | null
          desconto?: number
          empresa_id: string
          id?: string
          numero_venda?: number
          observacoes?: string | null
          parcelas?: number
          status?: Database["public"]["Enums"]["status_venda"]
          status_entrega?: Database["public"]["Enums"]["status_entrega"]
          subtotal?: number
          tipo_pagamento?: Database["public"]["Enums"]["tipo_pagamento"] | null
          total?: number
          updated_at?: string
          usuario_id?: string | null
          valor_entrada?: number
          vendedor_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          comissao_pct?: number
          comissao_valor?: number
          created_at?: string
          data_entrega?: string | null
          desconto?: number
          empresa_id?: string
          id?: string
          numero_venda?: number
          observacoes?: string | null
          parcelas?: number
          status?: Database["public"]["Enums"]["status_venda"]
          status_entrega?: Database["public"]["Enums"]["status_entrega"]
          subtotal?: number
          tipo_pagamento?: Database["public"]["Enums"]["tipo_pagamento"] | null
          total?: number
          updated_at?: string
          usuario_id?: string | null
          valor_entrada?: number
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes_emporio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fn_marcar_parcelas_atrasadas: { Args: never; Returns: undefined }
      generate_numero_contrato: {
        Args: { p_empresa_id: string }
        Returns: string
      }
      has_empresa_access: { Args: { eid: string }; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      canal_notificacao: "whatsapp" | "sms" | "email" | "sistema"
      categoria_conta:
        | "fornecedor"
        | "aluguel"
        | "salario"
        | "imposto"
        | "servico"
        | "outros"
      papel_usuario:
        | "admin"
        | "gerente"
        | "operador"
        | "visualizador"
        | "vendedor"
        | "caixa"
        | "estoquista"
      status_cliente: "ativo" | "inativo" | "bloqueado"
      status_conta_pagar: "pendente" | "pago" | "atrasado" | "cancelado"
      status_emprestimo:
        | "analise"
        | "aprovado"
        | "ativo"
        | "quitado"
        | "inadimplente"
        | "cancelado"
      status_entrega: "pendente" | "separando" | "pronto" | "entregue"
      status_parcela: "pendente" | "pago" | "atrasado" | "cancelado"
      status_parcela_emp:
        | "pendente"
        | "pago"
        | "atrasado"
        | "renegociado"
        | "cancelado"
      status_produto: "ativo" | "inativo" | "sem_estoque"
      status_usuario: "ativo" | "inativo"
      status_venda: "orcamento" | "aprovada" | "entregue" | "cancelada"
      tipo_empresa: "emporio" | "factoring"
      tipo_movimentacao: "entrada" | "saida"
      tipo_pagamento:
        | "dinheiro"
        | "pix"
        | "cartao_credito"
        | "cartao_debito"
        | "boleto"
        | "transferencia"
        | "cheque"
      tipo_taxa: "mensal" | "anual"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      canal_notificacao: ["whatsapp", "sms", "email", "sistema"],
      categoria_conta: [
        "fornecedor",
        "aluguel",
        "salario",
        "imposto",
        "servico",
        "outros",
      ],
      papel_usuario: [
        "admin",
        "gerente",
        "operador",
        "visualizador",
        "vendedor",
        "caixa",
        "estoquista",
      ],
      status_cliente: ["ativo", "inativo", "bloqueado"],
      status_conta_pagar: ["pendente", "pago", "atrasado", "cancelado"],
      status_emprestimo: [
        "analise",
        "aprovado",
        "ativo",
        "quitado",
        "inadimplente",
        "cancelado",
      ],
      status_entrega: ["pendente", "separando", "pronto", "entregue"],
      status_parcela: ["pendente", "pago", "atrasado", "cancelado"],
      status_parcela_emp: [
        "pendente",
        "pago",
        "atrasado",
        "renegociado",
        "cancelado",
      ],
      status_produto: ["ativo", "inativo", "sem_estoque"],
      status_usuario: ["ativo", "inativo"],
      status_venda: ["orcamento", "aprovada", "entregue", "cancelada"],
      tipo_empresa: ["emporio", "factoring"],
      tipo_movimentacao: ["entrada", "saida"],
      tipo_pagamento: [
        "dinheiro",
        "pix",
        "cartao_credito",
        "cartao_debito",
        "boleto",
        "transferencia",
        "cheque",
      ],
      tipo_taxa: ["mensal", "anual"],
    },
  },
} as const
