-- Inserir Motivos de Resultado
INSERT INTO motivos_resultado (descricao, tipo) VALUES
('Travou no preço', 'perda'),
('Travou no portfólio', 'perda'),
('Travou no prazo', 'perda'),
('Travou na forma de pagamento', 'perda'),
('Sem interesse no momento', 'perda'),
('Comprou após ver o portfólio', 'conversao'),
('Comprou após negociação', 'conversao'),
('Comprou após desconto', 'conversao'),
('Comprou após indicação', 'conversao')
ON CONFLICT DO NOTHING;

-- Inserir Badges
INSERT INTO badges (nome, descricao, icon, tier, image_url) VALUES
('Recruta', 'Realizou o seu primeiro cadastro de prospect', 'UserPlus', 'bronze', '/badges/recruta.png'),
('Primeiro Contato', 'Entrou em contato com 5 prospects', 'Phone', 'bronze', '/badges/contato.png'),
('Explorador', 'Alcançou o Nível 2', 'Map', 'bronze', '/badges/explorador.png'),
('Olho de Águia', 'Pesquisou 20 prospects no mapa', 'Search', 'prata', '/badges/olho_aguia.png'),
('Negociador de Elite', 'Realizou 10 contatos em um único dia', 'Zap', 'prata', '/badges/negociador_elite.png'),
('Rainha/Rei do Follow-up', 'Manteve um streak de 3 dias', 'Flame', 'prata', '/badges/followup.png'),
('Mestre da Conversão', 'Converteu 10 prospects', 'DollarSign', 'ouro', '/badges/mestre_conversao.png'),
('Lenda da Prospecção', 'Alcançou o Nível 5', 'Trophy', 'roxo', '/badges/lenda.png'),
('Herói do Trimestre', 'Converteu 50 prospects', 'ShieldCheck', 'vermelho', '/badges/heroi_trimestre.png')
ON CONFLICT DO NOTHING;

-- Nota: Perfis e Seed de Prospects dependem de IDs da tabela auth.users.
-- No Supabase, o ideal é criar os usuários via Auth e depois popular.
-- Para fins de demonstração no seed, podemos usar placeholders ou pular perfis.
