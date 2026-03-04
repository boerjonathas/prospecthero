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
INSERT INTO badges (nome, descricao) VALUES
('Iniciante', 'Realizou o primeiro cadastro de prospect'),
('Explorador', 'Alcançou o Nível 2'),
('Mestre da Prospecção', 'Converteu 10 prospects')
ON CONFLICT DO NOTHING;

-- Nota: Perfis e Seed de Prospects dependem de IDs da tabela auth.users.
-- No Supabase, o ideal é criar os usuários via Auth e depois popular.
-- Para fins de demonstração no seed, podemos usar placeholders ou pular perfis.
