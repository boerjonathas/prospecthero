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
    streak INTEGER DEFAULT 0,
    ultima_prospeccao DATE,
    ultima_meta_batida DATE,
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
    icon TEXT,
    image_url TEXT,
    tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'prata', 'ouro', 'roxo', 'vermelho')),
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

-- Trigger Function for Points, Level and Streak
CREATE OR REPLACE FUNCTION fn_trigger_calculate_points()
RETURNS trigger 
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    pts_to_add INTEGER := 0;
    motivo_pts TEXT := '';
    v_meta_diaria INTEGER;
    v_streak INTEGER;
    v_ultima_meta_batida DATE;
    v_count_today INTEGER;
BEGIN
    -- AÇÕES DE INSERÇÃO (Novo Prospect)
    IF (TG_OP = 'INSERT') THEN
        pts_to_add := 1; -- Cadastro base
        motivo_pts := 'Novo prospect cadastrado';

        -- Bônus de Campos Completos (Nome, Telefone, Email, Cidade)
        IF (NEW.nome IS NOT NULL AND NEW.telefone IS NOT NULL AND NEW.email IS NOT NULL AND NEW.cidade IS NOT NULL) THEN
            pts_to_add := pts_to_add + 1;
            motivo_pts := motivo_pts || ' + Bônus de Perfil Completado';
        END IF;

    -- AÇÕES DE ATUALIZAÇÃO (Mudança de Status ou Dados)
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Mudança de Status
        IF (OLD.status <> NEW.status) THEN
            CASE NEW.status
                WHEN 'contatado' THEN 
                    pts_to_add := 1;
                    motivo_pts := 'Status atualizado para Contatado';
                WHEN 'interessado' THEN 
                    pts_to_add := 3;
                    motivo_pts := 'Status atualizado para Interessado';
                WHEN 'convertido' THEN 
                    pts_to_add := 10;
                    motivo_pts := 'Venda realizada (+10 pts!)';
                ELSE pts_to_add := 0;
            END CASE;
        END IF;

        -- Registro de Motivo
        IF (OLD.motivo_resultado_id IS NULL AND NEW.motivo_resultado_id IS NOT NULL) THEN
            IF (NEW.status = 'convertido') THEN
                pts_to_add := pts_to_add + 3;
                motivo_pts := motivo_pts || ' + Inteligência de Conversão';
            ELSIF (NEW.status = 'nao_interessado') THEN
                pts_to_add := pts_to_add + 2;
                motivo_pts := motivo_pts || ' + Inteligência de Perda';
            END IF;
        END IF;

        -- Observação Detalhada
        IF (OLD.observacao_resultado IS NULL AND NEW.observacao_resultado IS NOT NULL AND LENGTH(NEW.observacao_resultado) > 10) THEN
            pts_to_add := pts_to_add + 1;
            motivo_pts := motivo_pts || ' + Detalhamento Comercial';
        END IF;
    END IF;

    -- Executar Incremento
    IF (pts_to_add > 0) THEN
        PERFORM increment_points(NEW.vendedor_id, pts_to_add, motivo_pts);

        -- ATUALIZAÇÃO DE NÍVEL
        UPDATE profiles 
        SET nivel = CASE 
            WHEN pontos <= 100 THEN 1
            WHEN pontos <= 300 THEN 2
            WHEN pontos <= 600 THEN 3
            WHEN pontos <= 1000 THEN 4
            ELSE 5
        END
        WHERE id = NEW.vendedor_id;
    END IF;

    -- LÓGICA DE STREAK
    SELECT meta_diaria, streak, ultima_meta_batida 
    INTO v_meta_diaria, v_streak, v_ultima_meta_batida
    FROM profiles WHERE id = NEW.vendedor_id;

    UPDATE profiles SET ultima_prospeccao = CURRENT_DATE WHERE id = NEW.vendedor_id;

    SELECT count(*)::int INTO v_count_today
    FROM prospects
    WHERE vendedor_id = NEW.vendedor_id 
    AND data_prospeccao::date = CURRENT_DATE;

    IF v_count_today >= v_meta_diaria AND (v_ultima_meta_batida IS NULL OR v_ultima_meta_batida < CURRENT_DATE) THEN
        IF v_ultima_meta_batida = CURRENT_DATE - INTERVAL '1 day' THEN
            UPDATE profiles SET streak = streak + 1, ultima_meta_batida = CURRENT_DATE WHERE id = NEW.vendedor_id;
        ELSE
            UPDATE profiles SET streak = 1, ultima_meta_batida = CURRENT_DATE WHERE id = NEW.vendedor_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para Pontos e Streak
DROP TRIGGER IF EXISTS trg_calculate_points ON prospects;
CREATE TRIGGER trg_calculate_points
AFTER INSERT OR UPDATE ON prospects
FOR EACH ROW EXECUTE PROCEDURE fn_trigger_calculate_points();

-- Badge Awarding Logic
CREATE OR REPLACE FUNCTION check_and_award_badges()
RETURNS trigger AS $$
DECLARE
    v_user_id UUID;
    v_prospects_count INTEGER;
    v_conversion_count INTEGER;
    v_streak INTEGER;
    v_reasons_count INTEGER;
    v_badge RECORD;
    v_meta_val INTEGER;
    v_meta_type TEXT;
BEGIN
    IF (TG_TABLE_NAME = 'prospects') THEN
        v_user_id := NEW.vendedor_id;
    ELSIF (TG_TABLE_NAME = 'profiles') THEN
        v_user_id := NEW.id;
    END IF;

    IF v_user_id IS NULL THEN RETURN NEW; END IF;

    SELECT COUNT(*)::int INTO v_prospects_count FROM prospects WHERE vendedor_id = v_user_id;
    SELECT COUNT(*)::int INTO v_conversion_count FROM prospects WHERE vendedor_id = v_user_id AND status = 'convertido';
    SELECT streak INTO v_streak FROM profiles WHERE id = v_user_id;
    SELECT COUNT(*)::int INTO v_reasons_count FROM prospects WHERE vendedor_id = v_user_id AND motivo_resultado_id IS NOT NULL;

    FOR v_badge IN SELECT * FROM badges LOOP
        v_meta_type := v_badge.meta_json->>'type';
        v_meta_val := (v_badge.meta_json->>'val')::int;

        IF (
            (v_meta_type = 'prospects_count' AND v_prospects_count >= v_meta_val) OR
            (v_meta_type = 'conversion_count' AND v_conversion_count >= v_meta_val) OR
            (v_meta_type = 'streak' AND v_streak >= v_meta_val) OR
            (v_meta_type = 'reasons_count' AND v_reasons_count >= v_meta_val)
        ) THEN
            INSERT INTO user_badges (user_id, badge_id)
            SELECT v_user_id, v_badge.id
            WHERE NOT EXISTS (
                SELECT 1 FROM user_badges WHERE user_id = v_user_id AND badge_id = v_badge.id
            );
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers para Medalhas
DROP TRIGGER IF EXISTS trg_award_badges_prospects ON prospects;
CREATE TRIGGER trg_award_badges_prospects
AFTER INSERT OR UPDATE ON prospects
FOR EACH ROW EXECUTE PROCEDURE check_and_award_badges();

DROP TRIGGER IF EXISTS trg_award_badges_profiles ON profiles;
CREATE TRIGGER trg_award_badges_profiles
AFTER UPDATE OF streak ON profiles
FOR EACH ROW EXECUTE PROCEDURE check_and_award_badges();

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
