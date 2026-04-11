export type ActionType = 
  | "risco_desconforto"
  | "risco_perseguicao"
  | "risco_ameaca"
  | "risco_emergencia"
  | "modo_silencioso"
  | "enviar_localizacao"
  | "abrir_whatsapp"
  | "buscar_ajuda_proxima"
  | "encerrar_evento";

export interface AppContext {
  internet_disponivel: boolean;
  gps_disponivel: boolean;
  contatos_configurados: boolean;
}

export interface DecisionResponse {
  nivel_risco: number;
  mensagem_usuario: string;
  acoes: string[];
  iniciar_gravacao: boolean;
  salvar_localizacao: boolean;
  modo_silencioso: boolean;
  abrir_whatsapp: boolean;
  abrir_mapa: boolean;
  ligar_emergencia: boolean;
  sync_pending: boolean;
  usar_localizacao_atual: boolean;
  usar_ultima_localizacao: boolean;
  proximo_passo: string;
  intents: { type: string; payload: any }[];
}

export function processAction(acao: ActionType, context: AppContext): DecisionResponse {
  const response: DecisionResponse = {
    nivel_risco: 1,
    mensagem_usuario: "",
    acoes: [],
    iniciar_gravacao: false,
    salvar_localizacao: true,
    modo_silencioso: false,
    abrir_whatsapp: false,
    abrir_mapa: false,
    ligar_emergencia: false,
    sync_pending: !context.internet_disponivel,
    usar_localizacao_atual: context.gps_disponivel,
    usar_ultima_localizacao: !context.gps_disponivel,
    proximo_passo: "",
    intents: []
  };

  if (response.usar_localizacao_atual || response.usar_ultima_localizacao) {
    response.intents.push({ type: "SAVE_LOCATION", payload: {} });
  }

  if (!context.internet_disponivel) {
    response.intents.push({ type: "QUEUE_SYNC", payload: {} });
  }

  switch (acao) {
    case "risco_desconforto":
      response.nivel_risco = 1;
      response.mensagem_usuario = "Monitoramento leve ativado.";
      response.acoes = ["fique atenta ao redor"];
      response.iniciar_gravacao = false;
      response.modo_silencioso = false;
      response.proximo_passo = "se piorar, eleve o nível de risco";
      break;

    case "risco_perseguicao":
      response.nivel_risco = 2;
      response.mensagem_usuario = "Monitoramento ativo. Mantenha-se atenta.";
      response.acoes = ["mova-se para um local seguro", "fique atenta ao redor"];
      response.iniciar_gravacao = true;
      response.modo_silencioso = true;
      response.proximo_passo = "se confirmar perseguição, acione Ameaça ou Emergência";
      response.intents.push({ type: "START_AUDIO_RECORDING", payload: {} });
      response.intents.push({ type: "ENABLE_STEALTH_MODE", payload: {} });
      break;

    case "risco_ameaca":
      response.nivel_risco = 3;
      response.mensagem_usuario = "Modo silencioso ativado. Gravando evidências.";
      response.acoes = ["vá para um local seguro", "evite confronto"];
      response.iniciar_gravacao = true;
      response.modo_silencioso = true;
      response.proximo_passo = "prepare-se para ligar para emergência";
      response.intents.push({ type: "START_AUDIO_RECORDING", payload: {} });
      response.intents.push({ type: "ENABLE_STEALTH_MODE", payload: {} });
      break;

    case "risco_emergencia":
      response.nivel_risco = 4;
      response.mensagem_usuario = "Emergência ativada. Acionando contatos.";
      response.acoes = ["procure abrigo imediatamente", "faça barulho se seguro"];
      response.iniciar_gravacao = true;
      response.modo_silencioso = false;
      response.ligar_emergencia = true;
      response.proximo_passo = "ligando para polícia";
      response.intents.push({ type: "START_AUDIO_RECORDING", payload: {} });
      response.intents.push({ type: "CALL_EMERGENCY", payload: {} });
      break;

    case "modo_silencioso":
      response.nivel_risco = 2;
      response.mensagem_usuario = "Modo stealth ativado.";
      response.acoes = ["tela escurecida", "notificações silenciadas"];
      response.modo_silencioso = true;
      response.proximo_passo = "mantenha o app aberto para continuar gravando";
      response.intents.push({ type: "ENABLE_STEALTH_MODE", payload: {} });
      break;

    case "enviar_localizacao":
      response.nivel_risco = 2;
      response.mensagem_usuario = context.internet_disponivel ? "Preparando envio de localização." : "Localização salva. Será enviada quando houver conexão.";
      response.acoes = ["compartilhar coordenadas", "enviar link de rastreio"];
      if (context.contatos_configurados && context.internet_disponivel) {
        response.abrir_whatsapp = true;
        response.intents.push({ type: "OPEN_WHATSAPP", payload: { message: "Estou compartilhando minha localização." } });
      }
      response.proximo_passo = "aguarde confirmação de recebimento";
      break;

    case "abrir_whatsapp":
      response.nivel_risco = 2;
      response.mensagem_usuario = "Abrindo WhatsApp com mensagem de alerta.";
      response.acoes = ["enviar mensagem padrão", "incluir localização"];
      response.abrir_whatsapp = true;
      response.intents.push({ type: "OPEN_WHATSAPP", payload: { priority: true } });
      response.proximo_passo = "envie a mensagem assim que o app abrir";
      break;

    case "buscar_ajuda_proxima":
      response.nivel_risco = 2;
      response.mensagem_usuario = "Buscando locais seguros próximos.";
      response.acoes = ["listar delegacias", "listar postos policiais"];
      response.abrir_mapa = true;
      response.intents.push({ type: "OPEN_MAPS", payload: { query: "delegacia de polícia" } });
      response.proximo_passo = "siga a rota para o local mais próximo";
      break;

    case "encerrar_evento":
      response.nivel_risco = 1;
      response.mensagem_usuario = "Evento encerrado. Gravação parada.";
      response.acoes = ["salvar dados do evento", "gerar relatório"];
      response.iniciar_gravacao = false;
      response.intents.push({ type: "STOP_RECORDING", payload: {} });
      response.intents.push({ type: "SAVE_EVENT", payload: {} });
      response.proximo_passo = "revise o relatório quando estiver segura";
      break;
  }

  return response;
}
