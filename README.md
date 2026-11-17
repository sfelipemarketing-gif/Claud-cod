# Guaporé Studio IA — protótipo demonstrativo

> *Inteligência e praticidade para sua comunicação.*
> Plataforma interna de criação de materiais comerciais da **Guaporé Vidros · Cuiabá – MT**.

**Protótipo para apresentação à diretoria. Não é a versão definitiva.** Preços, produtos, usuários e as marcas “Marca Demo A/B” são **fictícios**. As imagens de produtos são **ilustrações provisórias** (marcadas na biblioteca como “Ilustração demo”).

---

## Executar localmente

Requisitos: Node.js 18+ (testado com Node 22).

```bash
npm install
npm run dev        # http://localhost:5173
```

Contas de demonstração (senha `demo123`):

| Perfil        | E-mail                     |
|---------------|----------------------------|
| Administrador | `admin@guapore.demo`       |
| Colaborador   | `colaborador@guapore.demo` |

A tela de login tem atalhos para preencher cada perfil.

## Publicar na web

```bash
npm run build      # gera a pasta dist/
npm run preview    # confere o build em http://localhost:4173
```

A pasta `dist/` é um site estático: funciona em **qualquer** hospedagem estática, inclusive em subpastas, sem configuração de servidor (usa rotas com `#`):

- **Netlify / Vercel / Cloudflare Pages**: comando `npm run build`, pasta de publicação `dist`.
- **GitHub Pages**: publique o conteúdo de `dist/` (ex.: action `actions/deploy-pages`).
- **Servidor interno (Apache/Nginx/IIS)**: copie o conteúdo de `dist/` para a pasta do site.

Use HTTPS em produção: o botão **Compartilhar** (Web Share API) só funciona em conexão segura.

## Roteiro da demonstração

1. **Login** — tela exclusiva da Guaporé; clique em “Administrador”.
2. **Dashboard** — saudação, atalhos, últimos materiais e o roteiro (visível ao administrador).
3. **Informativo** — em *Criar informativo*, digite **“Silicone”** e um preço (ex.: 29,90).
4. **Busca de imagem** — a plataforma encontra **2 referências** e pede a escolha; selecione a marca **“Marca Demo A”** e a imagem é **identificada automaticamente**.
5. **Geração** — clique em **GERAR INFORMATIVO**.
6. **Blindex** — *Materiais Blindex* → *Informativo de preços* → botão **Exemplo**. Teste os formatos Quadrado, Story e A4.
7. **Compartilhamento** — **Baixar PNG/JPG/PDF** ou **Compartilhar** (no celular abre WhatsApp, e-mail etc.).

O botão **Exemplo** em cada formulário preenche dados fictícios para agilizar a apresentação.

---

## Funcionalidades implementadas e testadas

Testadas de ponta a ponta com navegador automatizado (Chromium, desktop 1440 px e iPhone 13), sem erros no console:

- Login com perfis **Administrador** e **Colaborador** (mostrar/ocultar senha, permissões por perfil).
- Dashboard com navegação lateral (menu em gaveta no celular).
- **Gerador de informativos**: título, produto, marca, preço em R$, unidade (unidade, m², metro linear, caixa, personalizada), descrição, destaques, observações e validade. Cada campo pode ser exibido/ocultado e o **layout se reorganiza** sem espaços vazios.
- **7 modelos** × **3 formatos** (1080×1080, 1080×1920, A4): Informativo comercial, Destaque Blindex, Promoção, Campanha interna, Vitrine de produto, Comunicado comercial e Material para vendedores. Pré-visualização ao vivo com miniaturas reais dos modelos.
- **Biblioteca inteligente** com busca local por nome, marca, categoria, palavras-chave e sinônimos (ex.: “sacada” → guarda-corpo). Correspondência inequívoca → sugestão automática; várias → opções para escolher.
- **Reconhecimento de referência Blindex**: ao escolher marca/imagem Blindex, a plataforma sugere o modelo *Destaque Blindex*.
- **Promoções internas**: preço anterior × preço promocional com **cálculo automático do desconto** para conferência, ou percentual informado manualmente.
- **Área Materiais Blindex** com 5 modelos (preços, divulgação, comunicado, promoção, vendedores).
- **Exportação real**: PNG, JPG e PDF (A4 em milímetros; demais formatos no tamanho em pixels).
- **Compartilhar**: Web Share API com arquivo; se o navegador não suportar, mostra alternativas (baixar + abrir WhatsApp/e-mail com texto).
- **Histórico**: miniatura, nome, tipo, data; editar, duplicar, baixar e excluir.
- **Painel administrativo** (Configurações): cores da marca (aplicadas na interface e nas artes), troca de logotipos, dados das artes, faixa “material demonstrativo”, galeria de modelos, usuários (simulado), marcas e sinônimos.
- **Biblioteca (administrador)**: enviar imagens, cadastrar nome/marca/categoria/palavras-chave/sinônimos, editar e remover.
- **Importar PDF** (real, no navegador): visualização das páginas, **recorte** da região do produto e **extração do texto** para sugerir palavras-chave.
- Sem dependência de serviços externos: fontes, logotipos e bibliotecas são servidos pela própria aplicação.

## Funcionalidades simuladas (demonstrativas)

| Recurso | Situação no protótipo |
|---|---|
| Autenticação | Local, no navegador. **Não é segura** para uso corporativo. |
| Usuários | Gerenciamento salvo apenas no navegador. |
| Armazenamento | IndexedDB do navegador — **pode ser perdido** se os dados do navegador forem apagados. |
| Preços e produtos | Fictícios; nenhum preço é cadastrado ou buscado na internet. |
| Imagens de produtos | Ilustrações provisórias em SVG; substituir por fotos oficiais/autorizadas. |
| IA no PDF | **Não executada**. Indicada na tela como “Em breve”. |

## Reservado para a versão definitiva

- Autenticação no servidor, sessões seguras (cookies HttpOnly), senhas com hash e permissões verificadas no backend.
- Banco de dados e armazenamento de arquivos centralizados (biblioteca e histórico compartilhados).
- IA multimodal para identificar marcas/produtos em PDFs; extração de imagens embutidas; busca semântica e reconhecimento visual.
- Fluxo de aprovação de referências e materiais; trilha de auditoria.

Pontos de extensão já previstos no código: `src/lib/search.ts` (trocar por busca semântica mantendo o contrato), `src/lib/store.tsx` (trocar IndexedDB por API), `src/lib/auth.tsx` (trocar por autenticação no servidor), `src/lib/pdf.ts` (acoplar IA multimodal).

---

## Identidade visual

A pesquisa nos sites e no Instagram (guaporevidros.com.br, blindex.com.br, instagram.com/guaporemt) **não pôde ser feita** neste ambiente: a rede bloqueou o acesso a esses endereços. Por isso:

- **Logotipos**: usados exatamente a partir dos arquivos fornecidos (`public/brand/`). Os símbolos “G” sem fundo (`guapore-g-*.png`) foram **derivados** do arquivo quadrado fornecido, sem redesenho.
- **Cores**: amostradas dos arquivos — azul Guaporé `#072851`, vermelho Blindex `#EE2E24`. **Confirmar com o manual de marca.** Ficam centralizadas em `src/index.css` (variáveis CSS), `src/config/brand.ts` e podem ser alteradas em *Configurações → Identidade visual*.
- **Nome “Guaporé Vidros” nas artes**: composto em texto (Montserrat) até o envio do logotipo completo em vetor.
- **Tipografia**: Montserrat (títulos das artes) e Inter (interface), provisórias.
- **Instagram @guaporemt**: não foi possível confirmar que corresponde à unidade de Cuiabá; nenhum material dele foi usado.
- Nenhuma certificação, endereço, telefone ou relação comercial foi inventada. O campo de telefone fica vazio até ser preenchido com o número oficial. Nas peças Blindex, a Guaporé aparece como empresa que **comercializa** os produtos, nunca como fabricante.

Para substituir arquivos de marca, troque os arquivos em `public/brand/` mantendo os nomes, ou use a tela de Configurações.

## Estrutura

```
src/
  art/            motor de composição: modelos (templates.tsx), peças (parts.tsx), registro
  components/     layout, pré-visualização, exportação/compartilhamento, busca de imagem, UI
  config/brand.ts nomes, cores, arquivos de marca e formatos
  data/           biblioteca demonstrativa, sinônimos, exemplos e atalhos Blindex
  lib/            autenticação, armazenamento, busca, exportação, PDF, formatação
  pages/          Login, Visão geral, Editor, Blindex, Biblioteca, Histórico, Configurações
public/brand      logotipos fornecidos
public/library    ilustrações provisórias
```

Tecnologias: React 18, TypeScript, Vite, Tailwind CSS, Lucide, html-to-image (PNG/JPG), jsPDF (PDF), pdf.js (leitura de PDF), idb-keyval (armazenamento local).
