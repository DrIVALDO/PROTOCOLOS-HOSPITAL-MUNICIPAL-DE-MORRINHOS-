# Manual do Usuário - Protocolos AVC Morrinhos

Bem-vindo ao **Protocolos AVC Morrinhos**, uma ferramenta digital avançada projetada para auxiliar médicos e profissionais de saúde do Hospital Municipal de Morrinhos no atendimento rápido, padronizado e seguro de pacientes com suspeita de Acidente Vascular Cerebral (AVC).

## 1. Visão Geral
O aplicativo integra as diretrizes clínicas mais recentes para o manejo do AVC em uma interface intuitiva, utilizando uma paleta de cores verde e branca para facilitar a leitura em ambiente hospitalar. O sistema permite não apenas a consulta ao protocolo, mas o registro ativo e a geração de documentação médica legal.

---

## 2. Módulos e Abas

### 2.1. Fluxograma
*   **Finalidade:** Visualização pedagógica e estática do protocolo completo.
*   **Funcionalidades:** 
    *   Mapa visual que guia desde a chegada na Unidade Hospitalar até a Alta/Reabilitação.
    *   Nós clicáveis que abrem modais detalhados com informações sobre janelas terapêuticas, critérios de inclusão/exclusão e dosagens de medicamentos.

### 2.2. Aplicação Prática (Interativo) - **Destaque**
*   **Finalidade:** Ferramenta de auxílio à decisão em tempo real durante o atendimento.
*   **Funcionalidades:**
    *   **Mapa Interativo (Lado Esquerdo):** Exibe a posição atual do paciente no fluxo.
    *   **Guia de Conduta (Lado Direito):** Apresenta apenas os campos de preenchimento e as instruções pertinentes à etapa selecionada.
    *   **Branching Inteligente:** Sugere o próximo passo (botões pulsantes) com base nos dados inseridos (ex: se Cincinnati for positivo, o sistema sugere avançar direto para a Tomografia).

### 2.3. Registro
*   **Finalidade:** Consolidação de todos os dados clínicos do atendimento em uma única tela.
*   **Funcionalidades:**
    *   Preenchimento de dados de Triagem (Cincinnati, Tempo de Início).
    *   Avaliação ABCDE (Sinais vitais e estabilização).
    *   Dados de Imagem e Tratamento (Achados da TC, Trombólise e Trombectomia).
    *   Definição de destino do paciente (UTI, Unidade de AVC, etc).

### 2.4. NIHSS (National Institutes of Health Stroke Scale)
*   **Finalidade:** Realização da avaliação neurológica quantitativa.
*   **Funcionalidades:**
    *   15 itens de avaliação organizados por categorias.
    *   Cálculo automático do score total.
    *   Sincronização imediata com os relatórios do paciente.

### 2.5. ABCD² (TIA Risk Score)
*   **Finalidade:** Estratificação de risco de AVC em 48 horas após um Ataque Isquêmico Transitório (AIT).
*   **Funcionalidades:**
    *   Cálculo baseado em Idade, Pressão, Clínica, Duração e Diabetes.
    *   Classificação automática de Risco (Baixo, Moderado ou Alto).
    *   Recomendações clínicas baseadas no score obtido.

---

## 3. Inteligência e Automação

*   **Código AVC:** Ativação prioritária com alertas visuais quando o teste de Cincinnati é positivo.
*   **Prevenção de Erros:** O sistema alerta se um achado de TC (Hemorragia) for incompatível com o fluxo de Isquemia que está sendo seguido, oferecendo a mudança de protocolo imediata.
*   **Sincronização:** Dados preenchidos em qualquer aba (como NIHSS ou dados de triagem) são refletidos automaticamente em todas as outras seções e no relatório final.

---

## 4. Geração de PDF e Documentação

O botão **"Gerar Relatório PDF"** (disponível em todas as abas relevantes) exporta um documento oficial contendo:
1.  Identificação do Paciente e Avaliador.
2.  Resumo completo do protocolo aplicado.
3.  Dados detalhados do Registro Clínico.
4.  Pontuações completas das escalas NIHSS e ABCD² (se realizadas).

---

## 5. Recomendações de Uso
1.  **Inicie os dados do paciente** na barra superior (Nome/Data).
2.  Utilize a aba **"Aplicação Prática"** como guia principal durante o atendimento.
3.  Não esqueça de **salvar o PDF** ao final para anexo ao prontuário físico ou eletrônico do hospital.
