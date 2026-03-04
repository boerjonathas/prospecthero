-- Resetar tabelas (CUIDADO: Isso apaga os dados existentes)
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS points_log CASCADE;
DROP TABLE IF EXISTS prospects CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS motivos_resultado CASCADE;

-- Tabuleiro de Motivos de Resultado
CREATE TABLE motivos_resultado (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    descricao TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('perda', 'conversao')),
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Perfis de Usuários (Estendendo Auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    foto_url TEXT,
    meta_diaria INTEGER DEFAULT 10,
    meta_semanal INTEGER DEFAULT 50,
    nivel INTEGER DEFAULT 1,
    pontos INTEGER DEFAULT 0,
    role TEXT NOT NULL DEFAULT 'vendedor' CHECK (role IN ('admin', 'vendedor')),
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prospects (Leads)
CREATE TABLE prospects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    cidade TEXT,
    endereco TEXT,
    telefone TEXT,
    email TEXT,
    sexo TEXT CHECK (sexo IN ('M', 'F', 'Outro')),
    idade INTEGER,
    status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'contatado', 'interessado', 'nao_interessado', 'convertido')),
    motivo_resultado_id UUID REFERENCES motivos_resultado(id),
    observacao_resultado TEXT,
    vendedor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    data_prospeccao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_resultado TIMESTAMP WITH TIME ZONE
);

-- Log de Pontuação
CREATE TABLE points_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    pontos INTEGER NOT NULL,
    motivo TEXT NOT NULL,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges (Medalhas)
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    icon_url TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges dos Usuários
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    data_conquista TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_prospects_vendedor ON prospects(vendedor_id);
CREATE INDEX idx_prospects_status ON prospects(status);
CREATE INDEX idx_points_log_user ON points_log(user_id);

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE motivos_resultado ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Policies for prospects
CREATE POLICY "Vendedor can see own prospects" ON prospects FOR SELECT USING (auth.uid() = vendedor_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Vendedor can insert own prospects" ON prospects FOR INSERT WITH CHECK (auth.uid() = vendedor_id);
CREATE POLICY "Vendedor can update own prospects" ON prospects FOR UPDATE USING (auth.uid() = vendedor_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Policies for motivos_resultado
CREATE POLICY "Everyone can view results" ON motivos_resultado FOR SELECT USING (true);

-- Policies for points_log
CREATE POLICY "Users can see own points log" ON points_log FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Policies for badges
CREATE POLICY "Everyone can view badges" ON badges FOR SELECT USING (true);

-- Increment Points Function
CREATE OR REPLACE FUNCTION increment_points(user_id UUID, amount INTEGER, reason TEXT)
RETURNS void AS $$
BEGIN
    UPDATE profiles SET pontos = pontos + amount WHERE id = user_id;
    
    INSERT INTO points_log (user_id, pontos, motivo)
    VALUES (user_id, amount, reason);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get Funnel Stats Function
CREATE OR REPLACE FUNCTION get_funnel_stats()
RETURNS TABLE(status TEXT, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT p.status, count(*)
    FROM prospects p
    GROUP BY p.status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar perfil automaticamente ao registrar no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'nome', 'Novo Herói'), 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'role', 'vendedor')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Trigger ao inserir em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Políticas de RLS Adicionais
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
